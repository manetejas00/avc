import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import axios from 'axios';
import { DatabaseSync } from 'node:sqlite';
import { createCryptoRouter } from '../services/crypto.js';
import { invalidateNewsCache } from '../services/newsApi.js';

test('crypto cached and stale snapshots remain readable without duplicate provider calls', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE market_cache (key TEXT PRIMARY KEY, data TEXT, expires_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE api_sync_logs (id INTEGER PRIMARY KEY, provider TEXT, status TEXT, message TEXT);`);
  const app = express();
  app.use('/crypto', createCryptoRouter(db));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const originalGet = axios.get;
  const originalKey = process.env.COINGECKO_DEMO_API_KEY;
  let calls = 0;
  axios.get = async () => { calls++; return { data: [{ id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 100, image: 'https://example.test/icon.png', price_change_percentage_24h: 2 }] }; };
  process.env.COINGECKO_DEMO_API_KEY = 'isolated-fixture';
  const url = `http://127.0.0.1:${server.address().port}/crypto/market-snapshot`;
  try {
    const first = await (await fetch(url)).json();
    assert.equal(first.coins[0].priceUsd, 100);
    const cached = await (await fetch(url)).json();
    assert.deepEqual(cached.coins, first.coins);
    assert.equal(calls, 1);
    db.prepare('UPDATE market_cache SET expires_at = ?').run('2000-01-01T00:00:00.000Z');
    process.env.COINGECKO_DEMO_API_KEY = '';
    const stale = await (await fetch(url)).json();
    assert.equal(stale.stale, true);
    assert.equal(stale.coins[0].priceUsd, 100);
    assert.equal(calls, 1);
    db.prepare('INSERT INTO market_cache (key, data, expires_at) VALUES (?, ?, ?)').run('news:1:9:all:', '{}', '2099-01-01');
    invalidateNewsCache(db);
    assert.equal(db.prepare("SELECT COUNT(*) AS count FROM market_cache WHERE key LIKE 'news:%'").get().count, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM market_cache').get().count, 1);
  } finally {
    axios.get = originalGet;
    if (originalKey === undefined) delete process.env.COINGECKO_DEMO_API_KEY;
    else process.env.COINGECKO_DEMO_API_KEY = originalKey;
    await new Promise(resolve => server.close(resolve));
    db.close();
  }
});
