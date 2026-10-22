import express from 'express';

export const createMutualFundsRouter = (db, financialService) => {
  const router = express.Router();

  // 1. Search Mutual Fund Schemes
  router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      return res.json([]);
    }

    try {
      const results = await financialService.searchMutualFunds(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Mutual fund search failed' });
    }
  });

  // 2. Mutual Fund Scheme Details, NAV History, and Performance
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Scheme code parameter required' });

    try {
      const details = await financialService.getMutualFundDetails(id);
      if (!details) {
        return res.status(404).json({ error: `Mutual fund scheme ${id} not found` });
      }
      res.json(details);
    } catch (err) {
      res.status(500).json({ error: `Failed to load details for scheme ${id}` });
    }
  });

  return router;
};
