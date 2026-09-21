import { getJson } from './apiClient';

export type CryptoAsset = { id: string; name: string; symbol: string; image: string | null; priceUsd: number; change24h: number | null; marketCapUsd: number | null; rank: number | null };
export type CryptoSnapshot = { coins: CryptoAsset[]; updatedAt: string; stale: boolean; provider: string };

const validSnapshot = (value: unknown): value is CryptoSnapshot => {
  const snapshot = value as Partial<CryptoSnapshot>;
  return Array.isArray(snapshot?.coins) && typeof snapshot.updatedAt === 'string' && snapshot.coins.every((coin) => typeof coin?.id === 'string' && typeof coin?.priceUsd === 'number');
};

export async function getCryptoSnapshot(signal?: AbortSignal): Promise<CryptoSnapshot> {
  const data = await getJson<unknown>('/api/crypto/market-snapshot', { signal, timeoutMs: 9000 });
  if (!validSnapshot(data)) throw new Error('Invalid crypto market response');
  return data;
}
