import express from 'express';
import axios from 'axios';

const clamp = (value, fallback, maximum) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback;
};

export const invalidateNewsCache = (db) => {
  db.prepare("DELETE FROM market_cache WHERE key LIKE 'news:%'").run();
};

const DEFAULT_NEWS_IMAGES = [
  '/assets/news/news-indian-equities.webp',
  '/assets/news/news-rbi-policy.webp',
  '/assets/news/news-global-economy.webp'
];

const parseRssXml = (xml) => {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
  let imgIndex = 0;
  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
    const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/i);
    
    let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '';
    const link = linkMatch ? linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '#';
    const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();
    const source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : 'Financial News';
    let summary = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').replace(/<[^>]*>/g, '').trim() : '';

    if (title) {
      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        title = parts.slice(0, -1).join(' - ').trim();
      }
      items.push({
        title,
        summary: summary || title,
        url: link,
        image_url: DEFAULT_NEWS_IMAGES[imgIndex % DEFAULT_NEWS_IMAGES.length],
        pub_date: pubDate,
        source: source || 'Market Updates',
        topics: ['Markets']
      });
      imgIndex++;
    }
  }
  return items;
};

export const createNewsRouter = (db) => {
  const router = express.Router();

  // Live provider endpoint: free external API integration with IndianAPI & Google News RSS fallback
  router.get('/live', async (req, res) => {
    const cacheKey = 'news:live:v2';
    try {
      const cached = db.prepare('SELECT data FROM market_cache WHERE key = ? AND expires_at > ?').get(cacheKey, new Date().toISOString());
      if (cached) {
        return res.json(JSON.parse(cached.data));
      }
    } catch {}

    let articles = [];

    // Tier 1: Indian Stock Market Live News API
    const indianApiKey = process.env.INDIAN_API_KEY;
    if (indianApiKey) {
      try {
        const response = await axios.get('https://stock.indianapi.in/news', {
          headers: { 'X-Api-Key': indianApiKey },
          timeout: 6000
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          articles = response.data.map((item, index) => ({
            title: item.title,
            summary: item.summary || item.title,
            url: item.url || '#',
            image_url: item.image_url || DEFAULT_NEWS_IMAGES[index % DEFAULT_NEWS_IMAGES.length],
            pub_date: item.pub_date || new Date().toISOString(),
            source: item.source || 'LiveMint / Market News',
            topics: Array.isArray(item.topics) && item.topics.length ? item.topics : ['Markets']
          }));
        }
      } catch (err) {
        console.warn('IndianAPI live news fetch failed, falling back to RSS:', err.message);
      }
    }

    // Tier 2: Free Google News RSS for Indian Stock Market & NSE/BSE Equities
    if (!articles.length) {
      try {
        const rssResponse = await axios.get(
          'https://news.google.com/rss/search?q=Indian+Stock+Market+NSE+NIFTY+Sensex&hl=en-IN&gl=IN&ceid=IN:en',
          {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
            timeout: 6000
          }
        );
        if (rssResponse.data) {
          articles = parseRssXml(rssResponse.data);
        }
      } catch (err) {
        console.warn('Google News RSS live fetch failed:', err.message);
      }
    }

    // Tier 3: Local SQLite database fallback
    if (!articles.length) {
      try {
        const rows = db.prepare(`SELECT title, summary, source_url AS url, image_url, source, category, published_at AS pub_date FROM news ORDER BY COALESCE(published_at, created_at) DESC LIMIT 12`).all();
        if (rows.length) {
          articles = rows.map((row, index) => ({
            title: row.title,
            summary: row.summary,
            url: row.url,
            image_url: row.image_url || DEFAULT_NEWS_IMAGES[index % DEFAULT_NEWS_IMAGES.length],
            pub_date: row.pub_date,
            source: row.source || 'AVC Market Intelligence',
            topics: [row.category || 'Markets']
          }));
        }
      } catch (err) {
        console.warn('Database news fallback failed:', err.message);
      }
    }

    if (articles.length) {
      const payload = { data: articles, news: articles };
      try {
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        db.prepare('INSERT INTO market_cache (key, data, expires_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP').run(cacheKey, JSON.stringify(payload), expiresAt);
      } catch {}
      return res.json(payload);
    }

    return res.status(502).json({ error: 'Live news currently unavailable' });
  });

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
