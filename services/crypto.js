import axios from 'axios';
import express from 'express';

const CACHE_KEY = 'crypto:market-snapshot';
const CACHE_TTL_SECONDS = 5 * 60;
const COIN_IDS = ['bitcoin', 'ethereum', 'tether', 'binancecoin'];

const isFiniteNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isSafeImageUrl = (value) => {
  try {
    return ['https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const normalizeCoins = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload
    .filter((coin) => coin && typeof coin.id === 'string' && typeof coin.name === 'string' && isFiniteNumber(coin.current_price))
    .map((coin) => ({
      id: coin.id,
      name: coin.name.slice(0, 80),
      symbol: typeof coin.symbol === 'string' ? coin.symbol.toUpperCase().slice(0, 12) : '',
      image: isSafeImageUrl(coin.image) ? coin.image : null,
      priceUsd: coin.current_price,
      change24h: isFiniteNumber(coin.price_change_percentage_24h) ? coin.price_change_percentage_24h : null,
      marketCapUsd: isFiniteNumber(coin.market_cap) ? coin.market_cap : null,
      rank: Number.isInteger(coin.market_cap_rank) ? coin.market_cap_rank : null
    }))
    .slice(0, COIN_IDS.length);
};

const readCache = (db, allowStale = false) => {
  const row = db.prepare('SELECT data, expires_at, updated_at FROM market_cache WHERE key = ?').get(CACHE_KEY);
  if (!row || (!allowStale && new Date(row.expires_at) <= new Date())) return null;
  try {
    const coins = normalizeCoins(JSON.parse(row.data));
    return coins.length ? { coins, updatedAt: row.updated_at, stale: new Date(row.expires_at) <= new Date() } : null;
  } catch {
    return null;
  }
};

const writeCache = (db, coins) => {
  const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();
  db.prepare(`INSERT INTO market_cache (key, data, expires_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET data = excluded.data, expires_at = excluded.expires_at, updated_at = CURRENT_TIMESTAMP`)
    .run(CACHE_KEY, JSON.stringify(coins), expiresAt);
};

const logSync = (db, status, message) => {
  db.prepare('INSERT INTO api_sync_logs (provider, status, message) VALUES (?, ?, ?)')
    .run('coingecko', status, message.slice(0, 500));
};

export const createCryptoRouter = (db) => {
  const router = express.Router();

  router.get('/market-snapshot', async (_req, res) => {
    const cached = readCache(db);
    if (cached) return res.json({ ...cached, provider: 'CoinGecko' });

    const apiKey = process.env.COINGECKO_DEMO_API_KEY;
    if (!apiKey) {
      const stale = readCache(db, true);
      if (stale) return res.json({ ...stale, provider: 'CoinGecko' });
      return res.status(503).json({ error: 'Crypto market data is temporarily unavailable.' });
    }

    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: { vs_currency: 'usd', ids: COIN_IDS.join(','), order: 'market_cap_desc', per_page: COIN_IDS.length, page: 1, sparkline: false },
        headers: { 'x-cg-demo-api-key': apiKey },
        timeout: 8000,
        validateStatus: (status) => status >= 200 && status < 300
      });
      const coins = normalizeCoins(response.data);
      if (!coins.length) throw new Error('CoinGecko returned no valid market records');
      writeCache(db, coins);
      logSync(db, 'success', `Fetched ${coins.length} crypto market records`);
      return res.json({ coins, updatedAt: new Date().toISOString(), stale: false, provider: 'CoinGecko' });
    } catch (error) {
      logSync(db, 'error', error instanceof Error ? error.message : 'Unknown CoinGecko error');
      const stale = readCache(db, true);
      if (stale) return res.json({ ...stale, provider: 'CoinGecko' });
      return res.status(502).json({ error: 'Crypto market data is temporarily unavailable.' });
    }
  });

  return router;
};
