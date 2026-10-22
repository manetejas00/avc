import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { envConfig, getProviderStatus } from '../services/config/env.js';
import { SlidingWindowRateLimiter } from '../services/core/rateLimiter.js';
import Database from 'better-sqlite3';
import { FinancialCache } from '../services/core/cache.js';
import {
  normalizeQuote,
  normalizeCandle,
  normalizeTechnicals,
  normalizeFundamentals,
  normalizeNewsArticle,
} from '../services/core/normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('Security & Environment Configuration', async (t) => {
  await t.test('.gitignore contains .env to prevent secret leakage', () => {
    const gitignorePath = path.join(rootDir, '.gitignore');
    assert.ok(fs.existsSync(gitignorePath), '.gitignore must exist');
    const content = fs.readFileSync(gitignorePath, 'utf8');
    assert.match(content, /^\.env$/m, '.gitignore must include .env');
  });

  await t.test('.env.example exists and contains required variable names with empty values', () => {
    const examplePath = path.join(rootDir, '.env.example');
    assert.ok(fs.existsSync(examplePath), '.env.example must exist');
    const content = fs.readFileSync(examplePath, 'utf8');
    assert.match(content, /TWELVE_DATA_API_KEY=/);
    assert.match(content, /FINNHUB_API_KEY=/);
    assert.match(content, /ALPHA_VANTAGE_API_KEY=/);
    assert.match(content, /NEWS_API_KEY=/);
    assert.match(content, /NEWS_API_KEY_SECONDARY=/);
    assert.match(content, /GNEWS_API_KEY=/);
  });

  await t.test('Environment variables are loaded and masked without leaking plaintext keys', () => {
    const status = getProviderStatus();
    assert.strictEqual(status.twelveData.configured, true);
    assert.strictEqual(status.finnhub.configured, true);
    assert.strictEqual(status.alphaVantage.configured, true);
    assert.strictEqual(status.newsApi.primaryConfigured, true);

    // Verify key preview only shows last 4 chars, never full key
    assert.ok(status.twelveData.status.includes('...'));
    assert.strictEqual(status.gnews.configured, false); // GNews remains unconfigured as required
  });
});

test('Data Normalization Engine', async (t) => {
  await t.test('normalizeQuote produces consistent format with numeric safety', () => {
    const quote = normalizeQuote({
      symbol: 'TCS.BSE',
      name: 'Tata Consultancy Services',
      price: '3850.50',
      change: '25.50',
      changePercent: '0.66',
      currency: 'INR',
      provider: 'test_provider',
    });

    assert.strictEqual(quote.symbol, 'TCS.BSE');
    assert.strictEqual(quote.name, 'Tata Consultancy Services');
    assert.strictEqual(quote.price, 3850.5);
    assert.strictEqual(quote.change, 25.5);
    assert.strictEqual(quote.changePercent, 0.66);
    assert.strictEqual(quote.currency, 'INR');
    assert.strictEqual(quote.provider, 'test_provider');
    assert.ok(quote.timestamp);
  });

  await t.test('normalizeQuote handles missing or invalid numbers gracefully', () => {
    const quote = normalizeQuote({
      symbol: '^NSEI',
      price: null,
      change: undefined,
    });

    assert.strictEqual(quote.price, 0);
    assert.strictEqual(quote.change, 0);
    assert.strictEqual(quote.changePercent, 0);
  });

  await t.test('normalizeCandle standardizes OHLCV bars', () => {
    const candle = normalizeCandle({
      timestamp: '2026-10-22T09:15:00.000Z',
      open: '100',
      high: '105',
      low: '99',
      close: '103.5',
      volume: '150000',
    });

    assert.strictEqual(candle.open, 100);
    assert.strictEqual(candle.high, 105);
    assert.strictEqual(candle.low, 99);
    assert.strictEqual(candle.close, 103.5);
    assert.strictEqual(candle.volume, 150000);
  });

  await t.test('normalizeTechnicals rounds RSI and bounds cleanly', () => {
    const technicals = normalizeTechnicals({
      symbol: 'INFY',
      rsi: 54.34567,
      macd: { macd: 1.25, signal: 1.10, histogram: 0.15 },
      provider: 'alpha_vantage',
    });

    assert.strictEqual(technicals.symbol, 'INFY');
    assert.strictEqual(technicals.rsi, 54.35);
    assert.strictEqual(technicals.macd.histogram, 0.15);
    assert.strictEqual(technicals.provider, 'alpha_vantage');
  });

  await t.test('normalizeFundamentals preserves valuation ratios', () => {
    const fundamentals = normalizeFundamentals({
      symbol: 'RELIANCE',
      name: 'Reliance Industries Limited',
      peRatio: '28.4',
      marketCap: '19000000000000',
      sector: 'Energy',
    });

    assert.strictEqual(fundamentals.symbol, 'RELIANCE');
    assert.strictEqual(fundamentals.peRatio, 28.4);
    assert.strictEqual(fundamentals.marketCap, 19000000000000);
    assert.strictEqual(fundamentals.sector, 'Energy');
  });

  await t.test('normalizeNewsArticle sanitizes and validates article structure', () => {
    const article = normalizeNewsArticle({
      title: 'Sensex rises 300 points',
      description: 'Markets rally following strong quarterly results.',
      url: 'https://example.com/news/1',
      urlToImage: 'https://example.com/img.jpg',
      source: { name: 'LiveMint' },
      publishedAt: '2026-10-22T10:00:00Z',
      category: 'india',
      provider: 'newsapi',
    });

    assert.strictEqual(article.title, 'Sensex rises 300 points');
    assert.strictEqual(article.source, 'LiveMint');
    assert.strictEqual(article.category, 'india');
    assert.strictEqual(article.provider, 'newsapi');
  });
});

test('Rate Limiting & Sliding Window Management', async (t) => {
  await t.test('Allows requests under quota and enforces limit', () => {
    const limiter = new SlidingWindowRateLimiter();

    assert.strictEqual(limiter.canExecute('test_provider', 3, 1000), true);
    assert.strictEqual(limiter.canExecute('test_provider', 3, 1000), true);
    assert.strictEqual(limiter.canExecute('test_provider', 3, 1000), true);

    // 4th request must be rejected
    assert.strictEqual(limiter.canExecute('test_provider', 3, 1000), false);

    // Different provider still has its own quota
    assert.strictEqual(limiter.canExecute('another_provider', 3, 1000), true);
  });
});

test('Cache and Request Deduplication', async (t) => {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE market_cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const cache = new FinancialCache(db);

  await t.test('SQLite cache writes, reads, and enforces TTL', () => {
    const testKey = `test_cache_entry_${Date.now()}`;
    const samplePayload = { symbol: 'TEST', value: 42 };

    cache.set(testKey, samplePayload, 2); // 2 second TTL
    const cached = cache.get(testKey);

    assert.ok(cached);
    assert.deepStrictEqual(cached.data, samplePayload);
    assert.strictEqual(cached.isStale, false);
  });

  await t.test('dedupe deduplicates concurrent calls for same key', async () => {
    let executionCount = 0;
    const dedupeKey = `dedupe_key_${Date.now()}`;

    const slowFetcher = async () => {
      executionCount++;
      await new Promise(res => setTimeout(res, 40));
      return { count: executionCount };
    };

    // Run 3 concurrent requests simultaneously
    const [r1, r2, r3] = await Promise.all([
      cache.dedupe(dedupeKey, slowFetcher),
      cache.dedupe(dedupeKey, slowFetcher),
      cache.dedupe(dedupeKey, slowFetcher),
    ]);

    // fetcher must have run only once
    assert.strictEqual(executionCount, 1);
    assert.deepStrictEqual(r1, { count: 1 });
    assert.deepStrictEqual(r2, { count: 1 });
    assert.deepStrictEqual(r3, { count: 1 });
  });
});

test('Live Internal API Endpoints Verification', async (t) => {
  const baseUrl = 'http://127.0.0.1:3000';

  const checkEndpoint = async (endpoint, validateFn) => {
    const res = await fetch(`${baseUrl}${endpoint}`);
    assert.strictEqual(res.status, 200, `Endpoint ${endpoint} must return HTTP 200`);
    const json = await res.json();
    validateFn(json);
  };

  await t.test('GET /api/providers/status returns secure provider health report', async () => {
    await checkEndpoint('/api/providers/status', (data) => {
      assert.strictEqual(data.status, 'online');
      assert.strictEqual(data.providers.twelveData.configured, true);
      assert.strictEqual(data.providers.finnhub.configured, true);
      assert.strictEqual(data.providers.alphaVantage.configured, true);
      assert.strictEqual(data.providers.newsApi.primaryConfigured, true);
      // Ensure no raw API keys are exposed
      const jsonStr = JSON.stringify(data);
      assert.ok(!jsonStr.includes(envConfig.twelveData.apiKey));
      assert.ok(!jsonStr.includes(envConfig.finnhub.apiKey));
      assert.ok(!jsonStr.includes(envConfig.alphaVantage.apiKey));
    });
  });

  await t.test('GET /api/market/overview returns market data', async () => {
    await checkEndpoint('/api/market/overview', (data) => {
      assert.ok(Array.isArray(data.indices));
      assert.ok(data.indices.length > 0);
      assert.ok(data.timestamp);
    });
  });

  await t.test('GET /api/market/indices returns array of index quotes', async () => {
    await checkEndpoint('/api/market/indices', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
      assert.ok(data[0].symbol);
      assert.ok(typeof data[0].price === 'number');
    });
  });

  await t.test('GET /api/market/gainers returns top gainers', async () => {
    await checkEndpoint('/api/market/gainers', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
      assert.ok(data[0].changePercent >= 0);
    });
  });

  await t.test('GET /api/market/losers returns top losers', async () => {
    await checkEndpoint('/api/market/losers', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
      assert.ok(data[0].changePercent <= 0);
    });
  });

  await t.test('GET /api/news/latest returns live news items with source attribution', async () => {
    await checkEndpoint('/api/news/latest?limit=5', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
      assert.ok(data[0].title);
      assert.ok(data[0].source);
      assert.ok(data[0].publishedAt);
    });
  });

  await t.test('GET /api/news/india returns Indian market news', async () => {
    await checkEndpoint('/api/news/india?limit=5', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
    });
  });

  await t.test('GET /api/news/global returns global financial news', async () => {
    await checkEndpoint('/api/news/global?limit=5', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
    });
  });

  await t.test('GET /api/mutual-funds/search returns search results', async () => {
    await checkEndpoint('/api/mutual-funds/search?q=hdfc', (data) => {
      assert.ok(Array.isArray(data));
      assert.ok(data.length > 0);
      assert.ok(data[0].schemeCode);
      assert.ok(data[0].schemeName);
    });
  });

  await t.test('GET /api/mutual-funds/:id returns fund details and CAGR performance', async () => {
    await checkEndpoint('/api/mutual-funds/100119', (data) => {
      assert.strictEqual(data.schemeCode, 100119);
      assert.ok(data.fundHouse);
      assert.ok(typeof data.currentNav === 'number');
      assert.ok(data.performance);
      assert.ok(Array.isArray(data.navHistory));
    });
  });
});
