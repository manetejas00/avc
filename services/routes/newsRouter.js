import express from 'express';

export const createNewsRouter = (db, financialService) => {
  const router = express.Router();

  // 1. Unified Latest Financial News
  router.get('/latest', async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 15;
    try {
      const articles = await financialService.getNews({ scope: 'india', limit });
      res.json(articles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch latest news' });
    }
  });

  // 2. Indian Business & Stock Market News
  router.get('/india', async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 15;
    try {
      const articles = await financialService.getNews({ scope: 'india', limit });
      res.json(articles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch Indian market news' });
    }
  });

  // 3. Global Financial & Market News
  router.get('/global', async (req, res) => {
    const limit = Number.parseInt(req.query.limit, 10) || 15;
    try {
      const articles = await financialService.getNews({ scope: 'global', limit });
      res.json(articles);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch global market news' });
    }
  });

  // 4. Live News Feed (Preserved for existing Section 03 & FinancialNews components)
  router.get('/live', async (req, res) => {
    try {
      // Prefer NewsAPI live Indian equity intelligence
      let articles = await financialService.getNews({ scope: 'india', limit: 12 });
      if (!articles || !articles.length) {
        articles = await financialService.getNews({ scope: 'global', limit: 12 });
      }

      // Map to contract expected by V1Landing.tsx news section
      const formatted = articles.map(a => ({
        title: a.title,
        summary: a.summary,
        url: a.url,
        image_url: a.image,
        pub_date: a.publishedAt,
        source: a.source,
        topics: [a.category || 'Markets']
      }));

      res.json(formatted);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch live news' });
    }
  });

  // 5. Existing Paginated Database News Feed
  router.get('/', (req, res) => {
    const category = req.query.category;
    const limit = Math.min(Number.parseInt(req.query.limit, 10) || 20, 50);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const offset = (page - 1) * limit;

    try {
      let query = 'SELECT * FROM news';
      const params = [];

      if (category && category !== 'All') {
        query += ' WHERE category = ?';
        params.push(category);
      }

      query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = db.prepare(query).all(...params);
      res.json(rows.map(row => ({
        ...row,
        tags: JSON.parse(row.tags || '[]')
      })));
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch news archive' });
    }
  });

  return router;
};
