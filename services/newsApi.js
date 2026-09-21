import express from 'express';

const clamp = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
};

export const invalidateNewsCache = (db) => {
  db.prepare("DELETE FROM market_cache WHERE key LIKE 'news:%'").run();
};

export const createNewsRouter = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => {
    const page = clamp(req.query.page, 1, 100000);
    const limit = clamp(req.query.limit, 9, 30);
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const cacheKey = `news:${page}:${limit}:${category.toLowerCase()}:${search.toLowerCase()}`;
    const cached = db.prepare('SELECT data FROM market_cache WHERE key = ? AND expires_at > ?').get(cacheKey, new Date().toISOString());
    if (cached) return res.json(JSON.parse(cached.data));

    const conditions = [];
    const params = [];
    if (category && category.toLowerCase() !== 'all') {
      conditions.push('LOWER(category) = LOWER(?)');
      params.push(category);
    }
    if (search) {
      conditions.push('(title LIKE ? OR summary LIKE ? OR tags LIKE ? OR source LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS count FROM news ${where}`).get(...params).count;
    const rows = db.prepare(`SELECT id, title, summary, category, tags, source, source_url AS url, image_url AS image, published_at AS publishedAt FROM news ${where} ORDER BY COALESCE(published_at, created_at) DESC LIMIT ? OFFSET ?`).all(...params, limit, (page - 1) * limit);
    const payload = { articles: rows.map(row => ({ ...row, tags: JSON.parse(row.tags || '[]') })), pagination: { page, limit, total, hasMore: page * limit < total } };
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    db.prepare('INSERT INTO market_cache (key, data, expires_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP').run(cacheKey, JSON.stringify(payload), expiresAt);
    res.json(payload);
  });

  return router;
};
