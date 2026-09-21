import express from 'express';
import YahooFinance from 'yahoo-finance2';
import axios from 'axios';

const yahooFinance = new YahooFinance();

export const createMarketRouter = (db) => {
  const router = express.Router();

  // Utility to get cached data
  const getCachedData = (key) => {
    const row = db.prepare('SELECT * FROM market_cache WHERE key = ?').get(key);
    if (row && new Date(row.expires_at) > new Date()) {
      return JSON.parse(row.data);
    }
    return null;
  };

  // Utility to set cached data
  const setCachedData = (key, data, ttlSeconds) => {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    db.prepare(`
      INSERT INTO market_cache (key, data, expires_at) 
      VALUES (?, ?, ?) 
      ON CONFLICT(key) DO UPDATE SET 
        data = excluded.data, 
        expires_at = excluded.expires_at, 
        updated_at = CURRENT_TIMESTAMP
    `).run(key, JSON.stringify(data), expiresAt);
  };

  // Utility to log API syncs
  const logApiSync = (provider, status, message = '') => {
    db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)').run(provider, status, message);
  };

  // 1. Dashboard Indices (NIFTY, SENSEX, S&P 500, NASDAQ, etc.)
  router.get('/dashboard', async (req, res) => {
    const cacheKey = 'dashboard_indices';
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      const symbols = [
        '^NSEI', // NIFTY 50
        '^BSESN', // SENSEX
        '^GSPC', // S&P 500
        '^IXIC', // NASDAQ
        'INR=X', // USD/INR
        'GC=F', // Gold
        'CL=F' // Crude Oil
      ];

      const results = await Promise.allSettled(symbols.map(s => yahooFinance.quote(s)));
      const data = results
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value)
        .map(quote => ({
          symbol: quote.symbol,
          name: quote.shortName || quote.longName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          currency: quote.currency,
          marketState: quote.marketState,
          lastUpdated: new Date(quote.regularMarketTime * 1000).toISOString()
        }));

      setCachedData(cacheKey, data, 15 * 60); // 15 mins cache
      logApiSync('yahoo_finance', 'success', 'Fetched dashboard indices');
      res.json(data);
    } catch (error) {
      logApiSync('yahoo_finance', 'error', error.message);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  // 2. Mutual Fund Search (using mfapi.in)
  router.get('/mutual-funds/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const cacheKey = `mf_search_${q.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      let allSchemes = getCachedData('mf_all_schemes');
      if (!allSchemes) {
        const response = await axios.get('https://api.mfapi.in/mf');
        allSchemes = response.data;
        setCachedData('mf_all_schemes', allSchemes, 24 * 60 * 60); // 24 hours
        logApiSync('mfapi', 'success', 'Fetched all MF schemes');
      }

      const results = allSchemes.filter(s => s.schemeName.toLowerCase().includes(q.toLowerCase())).slice(0, 20);
      setCachedData(cacheKey, results, 60 * 60); // 1 hour cache for search queries
      res.json(results);
    } catch (error) {
      logApiSync('mfapi', 'error', error.message);
      res.status(500).json({ error: 'Failed to search mutual funds' });
    }
  });

  // 3. Mutual Fund Details & NAV history
  router.get('/mutual-funds/:id', async (req, res) => {
    const { id } = req.params;
    const cacheKey = `mf_detail_${id}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      const response = await axios.get(`https://api.mfapi.in/mf/${id}`);
      const data = response.data;
      setCachedData(cacheKey, data, 12 * 60 * 60); // 12 hours cache
      logApiSync('mfapi', 'success', `Fetched MF details for ${id}`);
      res.json(data);
    } catch (error) {
      logApiSync('mfapi', 'error', error.message);
      res.status(500).json({ error: 'Failed to fetch mutual fund details' });
    }
  });

  // 4. Stock Search
  router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const cacheKey = `stock_search_${q.toLowerCase()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      const results = await yahooFinance.search(q, { newsCount: 0 });
      const filtered = results.quotes.filter(q => q.isYahooFinance);
      
      setCachedData(cacheKey, filtered, 60 * 60); // 1 hour cache
      logApiSync('yahoo_finance', 'success', `Searched stocks for ${q}`);
      res.json(filtered);
    } catch (error) {
      logApiSync('yahoo_finance', 'error', error.message);
      res.status(500).json({ error: 'Failed to search stocks' });
    }
  });

  // 6. Top Indian Stocks (Nifty 50/BSE) for Screener
  router.get('/screener/stocks', async (req, res) => {
    const cacheKey = 'screener_top_stocks';
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      // Top NIFTY 50 + prominent stocks as base
      const symbols = [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'INFY.NS',
        'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'HINDUNILVR.NS', 'BAJFINANCE.NS',
        'L&T.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'HCLTECH.NS',
        'MARUTI.NS', 'SUNPHARMA.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'NTPC.NS',
        'M&M.NS', 'ULTRACEMCO.NS', 'POWERGRID.NS', 'BAJAJFINSV.NS', 'WIPRO.NS',
        'NESTLEIND.NS', 'ONGC.NS', 'ADANIENT.NS', 'ADANIPORTS.NS', 'GRASIM.NS',
        'TECHM.NS', 'HINDALCO.NS', 'CIPLA.NS', 'APOLLOHOSP.NS', 'JSWSTEEL.NS',
        'BRITANNIA.NS', 'COALINDIA.NS', 'EICHERMOT.NS', 'TATACONSUM.NS', 'DRREDDY.NS',
        'DIVISLAB.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS', 'UPL.NS', 'INDUSINDBK.NS',
        'BPCL.NS', 'HDFCLIFE.NS', 'SBILIFE.NS', 'SHREECEM.NS', 'LTIM.NS'
      ];

      const quotes = await yahooFinance.quote(symbols);
      const data = quotes.map(q => ({
        symbol: q.symbol,
        shortName: q.shortName || q.longName,
        exchange: q.exchange,
        regularMarketPrice: q.regularMarketPrice,
        regularMarketChange: q.regularMarketChange,
        regularMarketChangePercent: q.regularMarketChangePercent,
        marketCap: q.marketCap,
        regularMarketVolume: q.regularMarketVolume,
        averageDailyVolume3Month: q.averageDailyVolume3Month,
        trailingPE: q.trailingPE,
        priceToBook: q.priceToBook,
        epsTrailingTwelveMonths: q.epsTrailingTwelveMonths,
        dividendYield: q.dividendYield,
        fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        regularMarketOpen: q.regularMarketOpen,
        regularMarketDayHigh: q.regularMarketDayHigh,
        regularMarketDayLow: q.regularMarketDayLow,
        regularMarketPreviousClose: q.regularMarketPreviousClose,
        currency: q.currency
      }));

      setCachedData(cacheKey, data, 15 * 60); // 15 mins
      logApiSync('yahoo_finance', 'success', 'Fetched screener base stocks');
      res.json(data);
    } catch (error) {
      logApiSync('yahoo_finance', 'error', error.message);
      res.status(500).json({ error: 'Failed to fetch screener stocks' });
    }
  });
  
  // 7. Get multiple quotes (for watchlist / explicit lookup)
  router.get('/quotes', async (req, res) => {
    const { symbols } = req.query;
    if (!symbols) return res.json([]);
    
    const symbolArray = symbols.split(',').filter(Boolean);
    if (symbolArray.length === 0) return res.json([]);

    const cacheKey = `quotes_${symbolArray.sort().join(',')}`;
    const cached = getCachedData(cacheKey);
    if (cached) return res.json(cached);

    try {
      const quotes = await yahooFinance.quote(symbolArray);
      // Yahoo finance can return an array or single object if 1 symbol requested
      const results = Array.isArray(quotes) ? quotes : [quotes];
      
      setCachedData(cacheKey, results, 5 * 60); // 5 mins
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  return router;
};
