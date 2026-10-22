import YahooFinance from 'yahoo-finance2';
import { FinancialCache } from './core/cache.js';
import { twelveDataProvider } from './providers/twelveData.js';
import { finnhubProvider } from './providers/finnhub.js';
import { alphaVantageProvider } from './providers/alphaVantage.js';
import { newsApiProvider } from './providers/newsApiProvider.js';
import { mutualFundProvider } from './providers/mutualFundProvider.js';
import { normalizeQuote, normalizeNewsArticle } from './core/normalizer.js';

const yahooFinance = new YahooFinance();

export class FinancialService {
  constructor(db) {
    this.db = db;
    this.cache = new FinancialCache(db);
  }

  /**
   * Log an API synchronization event
   */
  logSync(provider, status, message = '') {
    try {
      this.db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)')
        .run(provider, status, (message || '').slice(0, 500));
    } catch {}
  }

  /**
   * 1. Market Overview (Indices, Currencies, Commodities)
   */
  async getMarketOverview() {
    const cacheKey = 'market:overview:v2';
    const cached = this.cache.get(cacheKey);
    if (cached) return { ...cached.data, cached: true, updatedAt: cached.updatedAt };

    return this.cache.dedupe(cacheKey, async () => {
      try {
        const benchmarks = [
          { symbol: '^NSEI', name: 'NIFTY 50', type: 'index', country: 'IN' },
          { symbol: '^BSESN', name: 'SENSEX', type: 'index', country: 'IN' },
          { symbol: '^GSPC', name: 'S&P 500', type: 'index', country: 'US' },
          { symbol: '^IXIC', name: 'NASDAQ', type: 'index', country: 'US' },
          { symbol: 'INR=X', name: 'USD / INR', type: 'forex', country: 'IN' },
          { symbol: 'GC=F', name: 'Gold (USD/oz)', type: 'commodity', country: 'GLOBAL' },
          { symbol: 'CL=F', name: 'Crude Oil', type: 'commodity', country: 'GLOBAL' }
        ];

        // Fetch quotes using Yahoo Finance batch + Twelve Data forex verification
        const symbolsToFetch = benchmarks.map(b => b.symbol);
        const settled = await Promise.allSettled(symbolsToFetch.map(s => yahooFinance.quote(s)));

        const quotes = [];
        settled.forEach((res, i) => {
          const benchmark = benchmarks[i];
          if (res.status === 'fulfilled' && res.value) {
            const q = res.value;
            quotes.push(normalizeQuote({
              symbol: benchmark.symbol,
              name: benchmark.name,
              price: q.regularMarketPrice,
              change: q.regularMarketChange,
              changePercent: q.regularMarketChangePercent,
              currency: q.currency,
              exchange: q.exchange || benchmark.country,
              provider: 'yahoo_finance',
              timestamp: q.regularMarketTime
            }));
          }
        });

        // Supplement live USD/INR from Twelve Data if available
        if (twelveDataProvider.isAvailable()) {
          try {
            const tdForex = await twelveDataProvider.getQuote('USD/INR');
            if (tdForex && tdForex.price > 0) {
              const inrIndex = quotes.findIndex(q => q.symbol === 'INR=X');
              if (inrIndex >= 0) {
                quotes[inrIndex].price = tdForex.price;
                quotes[inrIndex].provider = 'twelve_data';
              }
            }
          } catch {}
        }

        const payload = {
          indices: quotes.filter(q => q.symbol.startsWith('^')),
          forex: quotes.filter(q => q.symbol.includes('INR')),
          commodities: quotes.filter(q => q.symbol.endsWith('=F')),
          all: quotes,
          timestamp: new Date().toISOString()
        };

        this.cache.set(cacheKey, payload, 10 * 60); // 10 min cache
        this.logSync('market_service', 'success', 'Fetched market overview');
        return { ...payload, cached: false, updatedAt: new Date().toISOString() };
      } catch (err) {
        this.logSync('market_service', 'error', `Overview: ${err.message}`);
        // Fallback to stale cache if present
        const stale = this.cache.get(cacheKey, true);
        if (stale) return { ...stale.data, isStale: true, updatedAt: stale.updatedAt };
        throw err;
      }
    });
  }

  /**
   * 2. Top Indian Gainers & Losers (from NIFTY 50 universe)
   */
  async getTopMovers() {
    const cacheKey = 'market:movers:top';
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      try {
        const symbols = [
          'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'INFY.NS',
          'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'HINDUNILVR.NS', 'BAJFINANCE.NS',
          'L&T.NS', 'KOTAKBANK.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'HCLTECH.NS',
          'MARUTI.NS', 'SUNPHARMA.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'NTPC.NS',
          'M&M.NS', 'ULTRACEMCO.NS', 'POWERGRID.NS', 'BAJAJFINSV.NS', 'WIPRO.NS',
          'NESTLEIND.NS', 'ONGC.NS', 'ADANIENT.NS', 'ADANIPORTS.NS', 'GRASIM.NS',
          'TECHM.NS', 'HINDALCO.NS', 'CIPLA.NS', 'APOLLOHOSP.NS', 'JSWSTEEL.NS'
        ];

        const quotes = await yahooFinance.quote(symbols);
        const validQuotes = (Array.isArray(quotes) ? quotes : [quotes])
          .filter(q => q && typeof q.regularMarketPrice === 'number')
          .map(q => normalizeQuote({
            symbol: q.symbol.replace('.NS', ''),
            name: q.shortName || q.longName,
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
            volume: q.regularMarketVolume,
            provider: 'yahoo_finance',
            timestamp: q.regularMarketTime
          }));

        const sorted = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);
        const gainers = sorted.slice(0, 6);
        const losers = [...sorted].reverse().slice(0, 6);

        const payload = {
          gainers,
          losers,
          timestamp: new Date().toISOString()
        };

        this.cache.set(cacheKey, payload, 15 * 60); // 15 min cache
        return payload;
      } catch (err) {
        this.logSync('market_service', 'error', `Movers: ${err.message}`);
        const stale = this.cache.get(cacheKey, true);
        if (stale) return stale.data;
        return { gainers: [], losers: [], error: 'Unable to load market movers' };
      }
    });
  }

  /**
   * 3. Stock Quote with Intelligent Provider Cascade (Twelve Data -> Finnhub -> Alpha Vantage -> Yahoo)
   */
  async getStockQuote(rawSymbol) {
    const symbol = rawSymbol.toUpperCase().trim();
    const cacheKey = `stock:quote:${symbol}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return { ...cached.data, cached: true, updatedAt: cached.updatedAt };

    return this.cache.dedupe(cacheKey, async () => {
      let quote = null;

      // 1. Try Twelve Data (US, Global, Forex)
      if (twelveDataProvider.isAvailable()) {
        try {
          quote = await twelveDataProvider.getQuote(symbol);
        } catch {}
      }

      // 2. Try Finnhub
      if (!quote && finnhubProvider.isAvailable()) {
        try {
          quote = await finnhubProvider.getQuote(symbol);
        } catch {}
      }

      // 3. Try Alpha Vantage
      if (!quote && alphaVantageProvider.isAvailable()) {
        try {
          quote = await alphaVantageProvider.getQuote(symbol);
        } catch {}
      }

      // 4. Fallback: Yahoo Finance (supports Indian .NS / .BO tickers)
      if (!quote) {
        try {
          const ySymbol = (symbol.endsWith('.NS') || symbol.endsWith('.BO') || symbol.includes('^') || symbol.includes('='))
            ? symbol
            : `${symbol}.NS`;
          const yQuote = await yahooFinance.quote(ySymbol);
          if (yQuote && typeof yQuote.regularMarketPrice === 'number') {
            quote = normalizeQuote({
              symbol,
              name: yQuote.shortName || yQuote.longName || symbol,
              price: yQuote.regularMarketPrice,
              change: yQuote.regularMarketChange,
              changePercent: yQuote.regularMarketChangePercent,
              open: yQuote.regularMarketOpen,
              high: yQuote.regularMarketDayHigh,
              low: yQuote.regularMarketDayLow,
              previousClose: yQuote.regularMarketPreviousClose,
              volume: yQuote.regularMarketVolume,
              currency: yQuote.currency || 'INR',
              exchange: yQuote.exchange || 'NSE',
              provider: 'yahoo_finance',
              timestamp: yQuote.regularMarketTime
            });
          }
        } catch {}
      }

      if (quote) {
        this.cache.set(cacheKey, quote, 5 * 60); // 5 min TTL
        return { ...quote, cached: false, updatedAt: new Date().toISOString() };
      }

      throw new Error(`Quote not available for symbol: ${symbol}`);
    });
  }

  /**
   * 4. Stock Historical Candles / Chart Data
   */
  async getStockHistory(rawSymbol, interval = '1day', points = 30) {
    const symbol = rawSymbol.toUpperCase().trim();
    const cacheKey = `stock:history:${symbol}:${interval}:${points}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      let candles = [];

      // Try Twelve Data
      if (twelveDataProvider.isAvailable()) {
        candles = await twelveDataProvider.getTimeSeries(symbol, interval, points);
      }

      // Fallback to Alpha Vantage
      if (!candles.length && alphaVantageProvider.isAvailable()) {
        candles = await alphaVantageProvider.getDailyHistory(symbol);
      }

      // Fallback to Yahoo Finance chart
      if (!candles.length) {
        try {
          const ySymbol = (symbol.endsWith('.NS') || symbol.endsWith('.BO') || symbol.includes('^')) ? symbol : `${symbol}.NS`;
          const period1 = new Date();
          period1.setDate(period1.getDate() - (points * 2));
          const history = await yahooFinance.chart(ySymbol, { period1, interval: '1d' });
          candles = (history.quotes || [])
            .filter(q => q.date && Number.isFinite(q.close))
            .map(q => ({
              timestamp: q.date.toISOString(),
              open: q.open ?? q.close,
              high: q.high ?? q.close,
              low: q.low ?? q.close,
              close: q.close,
              volume: q.volume ?? 0
            }))
            .slice(-points);
        } catch {}
      }

      if (candles.length) {
        this.cache.set(cacheKey, candles, 15 * 60);
      }
      return candles;
    });
  }

  /**
   * 5. Stock Technical Indicators (RSI, MACD)
   */
  async getStockTechnicals(rawSymbol) {
    const symbol = rawSymbol.toUpperCase().trim();
    const cacheKey = `stock:technicals:${symbol}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      let technicals = null;

      // Try Twelve Data
      if (twelveDataProvider.isAvailable()) {
        technicals = await twelveDataProvider.getIndicator(symbol, 'rsi', 14);
      }

      // Try Alpha Vantage
      if (!technicals && alphaVantageProvider.isAvailable()) {
        technicals = await alphaVantageProvider.getRSI(symbol, 14);
      }

      if (!technicals) {
        // Fallback: estimate RSI from historical candles if available
        const candles = await this.getStockHistory(symbol, '1day', 20);
        if (candles.length >= 14) {
          let gains = 0;
          let losses = 0;
          for (let i = 1; i <= 14; i++) {
            const diff = candles[i].close - candles[i - 1].close;
            if (diff >= 0) gains += diff;
            else losses += Math.abs(diff);
          }
          const avgGain = gains / 14;
          const avgLoss = losses / 14 || 0.0001;
          const rs = avgGain / avgLoss;
          const rsi = 100 - (100 / (1 + rs));

          technicals = {
            symbol,
            rsi: Number(rsi.toFixed(2)),
            provider: 'calculated',
            timestamp: new Date().toISOString()
          };
        }
      }

      if (technicals) {
        this.cache.set(cacheKey, technicals, 30 * 60); // 30 min cache
      }
      return technicals || { symbol, rsi: null, message: 'Technicals currently unavailable for this symbol' };
    });
  }

  /**
   * 6. Stock Fundamentals & Company Profile
   */
  async getStockFundamentals(rawSymbol) {
    const symbol = rawSymbol.toUpperCase().trim();
    const cacheKey = `stock:fundamentals:${symbol}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      let fundamentals = null;

      // Try Finnhub
      if (finnhubProvider.isAvailable()) {
        fundamentals = await finnhubProvider.getCompanyProfile(symbol);
      }

      // Try Alpha Vantage
      if (!fundamentals && alphaVantageProvider.isAvailable()) {
        fundamentals = await alphaVantageProvider.getCompanyOverview(symbol);
      }

      // Fallback Yahoo Finance
      if (!fundamentals) {
        try {
          const ySymbol = (symbol.endsWith('.NS') || symbol.endsWith('.BO')) ? symbol : `${symbol}.NS`;
          const quote = await yahooFinance.quote(ySymbol);
          if (quote) {
            fundamentals = {
              symbol,
              name: quote.shortName || quote.longName || symbol,
              description: `${quote.longName || symbol} is traded on ${quote.exchange || 'markets'}.`,
              marketCap: quote.marketCap,
              peRatio: quote.trailingPE,
              eps: quote.epsTrailingTwelveMonths,
              dividendYield: quote.dividendYield,
              fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
              fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
              provider: 'yahoo_finance'
            };
          }
        } catch {}
      }

      if (fundamentals) {
        this.cache.set(cacheKey, fundamentals, 60 * 60); // 1 hour cache
      }
      return fundamentals || { symbol, message: 'Fundamentals unavailable' };
    });
  }

  /**
   * 7. Stock Search (Twelve Data -> Finnhub -> Yahoo)
   */
  async searchStocks(query) {
    if (!query) return [];
    const cacheKey = `stock:search:${query.toLowerCase().trim()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      let results = [];

      // Try Twelve Data
      if (twelveDataProvider.isAvailable()) {
        results = await twelveDataProvider.search(query);
      }

      // Try Finnhub if empty
      if (!results.length && finnhubProvider.isAvailable()) {
        results = await finnhubProvider.search(query);
      }

      // Fallback Yahoo Finance search
      if (!results.length) {
        try {
          const yRes = await yahooFinance.search(query, { newsCount: 0 });
          results = (yRes.quotes || []).map(q => ({
            symbol: q.symbol,
            name: q.shortName || q.longName || q.symbol,
            exchange: q.exchange,
            type: q.quoteType,
            provider: 'yahoo_finance'
          }));
        } catch {}
      }

      if (results.length) {
        this.cache.set(cacheKey, results, 60 * 60);
      }
      return results;
    });
  }

  /**
   * 8. Financial News (NewsAPI -> Finnhub -> SQLite Database)
   */
  async getNews({ scope = 'india', symbol = null, limit = 15 } = {}) {
    const cacheKey = `news:feed:${scope}:${symbol || 'all'}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    return this.cache.dedupe(cacheKey, async () => {
      let articles = [];

      // If symbol-specific, query Finnhub or NewsAPI search
      if (symbol) {
        if (finnhubProvider.isAvailable()) {
          articles = await finnhubProvider.getCompanyNews(symbol, 7);
        }
        if (!articles.length && newsApiProvider.isAvailable()) {
          articles = await newsApiProvider.searchNews(symbol, limit);
        }
      } else if (scope === 'india') {
        // Query NewsAPI for Indian financial news
        if (newsApiProvider.isAvailable()) {
          articles = await newsApiProvider.getIndianFinancialNews(limit);
        }
      } else if (scope === 'global') {
        // Query NewsAPI / Finnhub for global finance
        if (newsApiProvider.isAvailable()) {
          articles = await newsApiProvider.getGlobalFinancialNews(limit);
        }
        if (!articles.length && finnhubProvider.isAvailable()) {
          articles = await finnhubProvider.getMarketNews('general');
        }
      }

      // Fallback to SQLite news table if external API yielded no results
      if (!articles.length) {
        try {
          const dbRows = this.db.prepare('SELECT * FROM news ORDER BY published_at DESC LIMIT ?').all(limit);
          articles = dbRows.map(row => normalizeNewsArticle({
            id: String(row.id),
            title: row.title,
            summary: row.summary,
            url: row.source_url,
            image: row.image_url,
            source: row.source,
            category: row.category,
            publishedAt: row.published_at,
            provider: 'internal_archive'
          }));
        } catch {}
      }

      this.cache.set(cacheKey, articles, 15 * 60); // 15 min cache
      return articles;
    });
  }

  /**
   * 9. Mutual Funds (Search & Details)
   */
  async searchMutualFunds(query) {
    const cacheKey = `mf:search:${query.toLowerCase().trim()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    const results = await mutualFundProvider.searchSchemes(query);
    this.cache.set(cacheKey, results, 60 * 60);
    return results;
  }

  async getMutualFundDetails(schemeCode) {
    const cacheKey = `mf:detail:${schemeCode}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached.data;

    const details = await mutualFundProvider.getSchemeDetails(schemeCode);
    if (details) {
      this.cache.set(cacheKey, details, 12 * 60 * 60); // 12 hours
    }
    return details;
  }
}
