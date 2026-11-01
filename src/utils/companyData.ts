export type CompanyProfile = {
  symbol: string; source: string; timestamp: string; delay: string; name: string;
  price: number | null; rsi: number | null; pe: number | null; sector: string | null; industry: string | null;
  high: number | null; low: number | null; volume: number | null;
};
export function parseCompanyProfile(payload: any, expected: string): CompanyProfile {
  const v = payload?.values;
  if (payload?.symbol !== expected || !v || v.currency !== 'INR' || v.exchange !== expected.split(':')[0] || typeof v.update_time !== 'number' || !Number.isFinite(v.update_time) || v.update_time <= 0) throw new Error('The company feed did not return a dated record for this exchange.');
  const numeric = (value: unknown, positive = false) => typeof value === 'number' && Number.isFinite(value) && (!positive || value > 0) ? value : null;
  const delay = /^delayed_streaming_(\d+)$/.exec(String(v.update_mode));
  return { symbol: expected, source: 'TradingView', timestamp: new Date(v.update_time * 1000).toISOString(), delay: delay ? `Source delay: ${Number(delay[1]) / 60} minutes` : v.update_mode === 'endofday' ? 'End-of-day data' : 'Exact delay not stated by source', name: String(v.description || v.name), price: numeric(v.close, true), rsi: typeof v.RSI === 'number' && v.RSI >= 0 && v.RSI <= 100 ? v.RSI : null, pe: numeric(v.price_earnings_ttm), sector: typeof v.sector === 'string' && v.sector ? v.sector : null, industry: typeof v.industry === 'string' && v.industry ? v.industry : null, high: numeric(v.price_52_week_high, true), low: numeric(v.price_52_week_low, true), volume: numeric(v.volume) };
}
