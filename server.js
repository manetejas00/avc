import express from 'express';
import sqlite3 from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'node:crypto';
import ebookContent from './services/ebookContent.js';
import { fileURLToPath } from 'url';
import { createMarketRouter } from './services/market.js';
import { createCryptoRouter } from './services/crypto.js';
import { createNewsRouter } from './services/newsApi.js';
import { createIpoRouter } from './services/ipo.js';
import { startNewsScheduler } from './services/newsScheduler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) throw new Error('Set JWT_SECRET to at least 32 characters in production.');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString('hex');
const DB_PATH = process.env.DATABASE_URL || path.join(__dirname, 'data', 'avc.sqlite');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = sqlite3(DB_PATH);
db.pragma('journal_mode = WAL');

// Migrations
const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS form_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interest TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS market_cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS api_sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_title TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      category TEXT NOT NULL DEFAULT 'Markets',
      tags TEXT NOT NULL DEFAULT '[]',
      source TEXT,
      source_url TEXT NOT NULL,
      image_url TEXT,
      published_at DATETIME,
      url_hash TEXT NOT NULL UNIQUE,
      title_hash TEXT NOT NULL UNIQUE,
      image_hash TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
  `);

  // Bootstrap Admin if environment variables are set and no admin exists
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (bootstrapEmail && bootstrapPassword) {
    const hash = bcrypt.hashSync(bootstrapPassword, 10);
    const adminExists = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(bootstrapEmail);
    if (!adminExists) {
      db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)').run(bootstrapEmail, hash);
      console.log(`Bootstrapped admin user: ${bootstrapEmail}`);
    }
  }
};

initDB();

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use(cookieParser());
app.use('/api', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (req.get('sec-fetch-site') === 'cross-site') return res.status(403).json({ error: 'Cross-site request rejected.' });
    if (req.get('origin')) {
      try {
        if (new URL(req.get('origin')).host !== req.get('host')) return res.status(403).json({ error: 'Cross-site request rejected.' });
      } catch { return res.status(403).json({ error: 'Invalid origin.' }); }
    }
  }
  next();
});
const loginAttempts = new Map();
const loginWindow = 15 * 60 * 1000;
const loginLimit = (req, res, next) => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts) if (entry.expires <= now) loginAttempts.delete(key);
  const entry = loginAttempts.get(req.ip) || { count: 0, expires: now + loginWindow };
  if (entry.count >= 10) return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' });
  entry.count++;
  loginAttempts.set(req.ip, entry);
  next();
};

// Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!db.prepare('SELECT id FROM admin_users WHERE id = ?').get(decoded.id)) return res.status(401).json({ error: 'Unauthorized' });
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Public API ---
app.use('/api/market', createMarketRouter(db));
app.use('/api/crypto', createCryptoRouter(db));
app.use('/api/news', createNewsRouter(db));
app.use('/api/ipo', createIpoRouter(db));

app.post('/api/submit-form', (req, res) => {
  const fields = ['name', 'email', 'phone', 'interest', 'message'];
  if (!req.body || fields.some(key => req.body[key] !== undefined && typeof req.body[key] !== 'string')) return res.status(400).json({ error: 'Form fields must be text.' });
  const { name = '', email = '', phone = '', interest = '', message = '' } = Object.fromEntries(fields.map(key => [key, (req.body[key] || '').trim()]));
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required.' });
  }
  if (name.length > 120 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[\d\s()-]{7,25}$/.test(phone) || phone.replace(/\D/g, '').length < 7 || interest.length > 150 || message.length > 5000) return res.status(400).json({ error: 'Enter a valid name, email and phone; message limit is 5000 characters.' });

  try {
    const stmt = db.prepare('INSERT INTO form_submissions (name, email, phone, interest, message) VALUES (?, ?, ?, ?, ?)');
    stmt.run(name, email, phone, interest || '', message || '');
    res.json({ success: true, message: 'Submission received successfully.' });
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Admin API ---

app.post('/api/admin/login', loginLimit, (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 200 || !email.trim() || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const admin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email);
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
});

app.get('/api/admin/check-auth', authenticateAdmin, (req, res) => {
  res.json({ authenticated: true });
});
app.get('/api/admin/ebooks', authenticateAdmin, (req, res) => res.json(ebookContent));

app.get('/api/admin/submissions', authenticateAdmin, (req, res) => {
  try {
    const submissions = db.prepare('SELECT * FROM form_submissions ORDER BY created_at DESC').all();
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/admin/sync-logs', authenticateAdmin, (req, res) => {
  try {
    const logs = db.prepare('SELECT * FROM api_sync_logs ORDER BY created_at DESC LIMIT 50').all();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/admin/submissions/:id/status', authenticateAdmin, (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  
  if (!['pending', 'completed', 'rejected'].includes(status) || !/^\d+$/.test(id)) return res.status(400).json({ error: 'Invalid submission or status.' });

  try {
    const result = db.prepare('UPDATE form_submissions SET status = ? WHERE id = ?').run(status, id);
    if (!result.changes) return res.status(404).json({ error: 'Submission not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Static Serve ---
app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(error.status === 413 ? 413 : error.status === 400 ? 400 : 500).json({ error: error.status === 413 ? 'Request too large.' : error.status === 400 ? 'Invalid request body.' : 'Internal server error.' });
});
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for React Router
app.use((req, res) => {
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).send('Not Found. Build the app first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.DISABLE_NEWS_SCHEDULER !== 'true') startNewsScheduler(db);
});
