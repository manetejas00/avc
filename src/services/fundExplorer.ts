import { getApiUrl } from './apiClient';
import type { Fund } from '../utils/fundComparison';
const cache = new Map<string, { until: number; value: unknown }>();
export type Scheme = { schemeCode: number; schemeName: string };
async function request<T>(params: string, signal?: AbortSignal): Promise<T> {
  const cached = cache.get(params);
  if (cached && cached.until > Date.now()) return cached.value as T;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timer = window.setTimeout(abort, 20000);
  let data;
  try {
    const response = await fetch(getApiUrl(`/api/mutual-funds.php?${params}`), { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('Mutual fund data unavailable. Please try again later.');
    data = await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw Error('Mutual fund data unavailable. Please try again later.');
  } finally { window.clearTimeout(timer); signal?.removeEventListener('abort', abort); }

  if (data.error) throw Error('Mutual fund data unavailable. Please try again later.');
  if (cache.size >= 40) cache.delete(cache.keys().next().value);
  cache.set(params, { until: Date.now() + 15 * 60000, value: data });
  return data as T;
}
export async function searchFunds(query: string, signal?: AbortSignal) {
  const data = await request<Scheme[]>(`action=search&q=${encodeURIComponent(query)}`, signal);
  if (!Array.isArray(data)) throw Error('Search data unavailable.');
  return data.filter(item => Number.isInteger(item.schemeCode) && typeof item.schemeName === 'string');
}
export async function loadFund(code: number, signal?: AbortSignal) {
  const fund = await request<Fund>(`code=${code}`, signal);
  if (!fund.meta?.scheme_name || !Array.isArray(fund.data)) throw Error('NAV data unavailable for this scheme.');
  return fund;
}
