import express from 'express';

export const createMarketRouter = (db, financialService) => {
  const router = express.Router();

  // 1. Unified Market Overview (Indices, Forex, Commodities)
  router.get('/overview', async (_req, res) => {
    try {
      const data = await financialService.getMarketOverview();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch market overview', details: err.message });
    }
  });

  // 2. Benchmarks / Indices
  router.get('/indices', async (_req, res) => {
    try {
      const overview = await financialService.getMarketOverview();
      res.json(overview.indices || []);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch market indices' });
    }
  });

  // 3. Top Gainers
  router.get('/gainers', async (_req, res) => {
    try {
      const movers = await financialService.getTopMovers();
      res.json(movers.gainers || []);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch top gainers' });
    }
  });

  // 4. Top Losers
  router.get('/losers', async (_req, res) => {
    try {
      const movers = await financialService.getTopMovers();
      res.json(movers.losers || []);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch top losers' });
    }
  });

  // 5. Existing Dashboard endpoint (Maintained for full backward compatibility)
  router.get('/dashboard', async (_req, res) => {
    try {
      const overview = await financialService.getMarketOverview();
      res.json(overview.all || []);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  });

  // 6. Interactive Historical Chart
  router.get('/chart', async (req, res) => {
    const symbol = req.query.symbol || '^NSEI';
    try {
      const candles = await financialService.getStockHistory(symbol, '1day', 90);
      const points = candles.map(c => ({ timestamp: c.timestamp, value: c.close }));
      res.json(points);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch chart data' });
    }
  });

  // 7. Screener Top Indian Stocks
  router.get('/screener/stocks', async (_req, res) => {
    try {
      const movers = await financialService.getTopMovers();
      res.json([...(movers.gainers || []), ...(movers.losers || [])]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch screener stocks' });
    }
  });

  // 8. Mutual Funds backward-compatibility endpoints
  router.get('/mutual-funds/search', async (req, res) => {
    try {
      const results = await financialService.searchMutualFunds(req.query.q);
      res.json(results);
    } catch {
      res.status(500).json({ error: 'Failed to search mutual funds' });
    }
  });

  router.get('/mutual-funds/:id', async (req, res) => {
    try {
      const details = await financialService.getMutualFundDetails(req.params.id);
      if (!details) return res.status(404).json({ error: 'Fund not found' });
      res.json({
        meta: {
          fund_house: details.fundHouse,
          scheme_type: details.schemeType,
          scheme_category: details.schemeCategory,
          scheme_code: details.schemeCode,
          scheme_name: details.schemeName
        },
        data: details.navHistory.map(h => ({ date: h.date, nav: String(h.nav) }))
      });
    } catch {
      res.status(500).json({ error: 'Failed to fetch fund details' });
    }
  });

  return router;
};
