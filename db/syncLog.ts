import { drizzle } from 'drizzle-orm/netlify-db';
import { syncLogs } from './schema.js';
export async function recordApiResult(provider: string, status: number) {
  try {
    await drizzle().insert(syncLogs).values({ provider, status: status < 400 ? 'success' : 'error', message: `HTTP ${status}` });
  } catch { /* Logging must not interrupt market data delivery. */ }
}
