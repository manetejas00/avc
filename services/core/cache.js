/**
 * SQLite-backed cache with in-flight request deduplication and stale-while-revalidate support.
 */
export class FinancialCache {
  constructor(db) {
    this.db = db;
    this.inFlightRequests = new Map();
  }

  get(key, allowStale = false) {
    try {
      const row = this.db.prepare('SELECT data, expires_at, updated_at FROM market_cache WHERE key = ?').get(key);
      if (!row) return null;

      const isExpired = new Date(row.expires_at) <= new Date();
      if (isExpired && !allowStale) return null;

      const parsed = JSON.parse(row.data);
      return {
        data: parsed,
        updatedAt: row.updated_at,
        isStale: isExpired
      };
    } catch {
      return null;
    }
  }

  set(key, data, ttlSeconds = 300) {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
      this.db.prepare(`
        INSERT INTO market_cache (key, data, expires_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET
          data = excluded.data,
          expires_at = excluded.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `).run(key, JSON.stringify(data), expiresAt);
    } catch (err) {
      console.warn(`Cache write failure for key ${key}:`, err.message);
    }
  }

  delete(key) {
    try {
      this.db.prepare('DELETE FROM market_cache WHERE key = ?').run(key);
    } catch {}
  }

  /**
   * Request deduplication: wrap an async producer to guarantee only one live request
   * runs concurrently for the same key.
   * @template T
   * @param {string} dedupeKey
   * @param {() => Promise<T>} producer
   * @returns {Promise<T>}
   */
  async dedupe(dedupeKey, producer) {
    if (this.inFlightRequests.has(dedupeKey)) {
      return this.inFlightRequests.get(dedupeKey);
    }

    const promise = producer().finally(() => {
      this.inFlightRequests.delete(dedupeKey);
    });

    this.inFlightRequests.set(dedupeKey, promise);
    return promise;
  }
}
