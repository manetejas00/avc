import express from 'express';

export const createStocksRouter = (db, financialService) => {
  const router = express.Router();

  // 1. Stock Search across Twelve Data, Finnhub, and Indian exchanges
  router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query || typeof query !== 'string') {
      return res.json([]);
    }

    try {
      const results = await financialService.searchStocks(query);
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: 'Search failed', details: err.message });
    }
  });

  // 2. Real-time Quote for a stock symbol
  router.get('/:symbol', async (req, res) => {
    const { symbol } = req.params;
    if (!symbol) return res.status(400).json({ error: 'Symbol parameter required' });

    try {
      const quote = await financialService.getStockQuote(symbol);
      res.json(quote);
    } catch (err) {
      res.status(404).json({ error: `Quote not available for ${symbol}`, details: err.message });
    }
  });

  // 3. Historical Price Series & Candlesticks (OHLC)
  router.get('/:symbol/history', async (req, res) => {
    const { symbol } = req.params;
    const interval = req.query.interval || '1day';
    const points = Number.parseInt(req.query.points, 10) || 30;

    try {
      const history = await financialService.getStockHistory(symbol, interval, Math.min(points, 100));
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: `History unavailable for ${symbol}` });
    }
  });

  // 4. Technical Indicators (RSI, MACD)
  router.get('/:symbol/technicals', async (req, res) => {
    const { symbol } = req.params;
    try {
      const technicals = await financialService.getStockTechnicals(symbol);
      res.json(technicals);
    } catch (err) {
      res.status(500).json({ error: `Technicals unavailable for ${symbol}` });
    }
  });

  // 5. Fundamentals & Company Profile
  router.get('/:symbol/fundamentals', async (req, res) => {
    const { symbol } = req.params;
    try {
      const fundamentals = await financialService.getStockFundamentals(symbol);
      res.json(fundamentals);
    } catch (err) {
      res.status(500).json({ error: `Fundamentals unavailable for ${symbol}` });
    }
  });

  // 6. Company-Specific News
  router.get('/:symbol/news', async (req, res) => {
    const { symbol } = req.params;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    try {
      const news = await financialService.getNews({ symbol, limit });
      res.json(news);
    } catch (err) {
      res.status(500).json({ error: `News unavailable for ${symbol}` });
    }
  });

  return router;
};
