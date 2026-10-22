/**
 * Data normalization helpers for consistent financial models across providers.
 */

const toNumber = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const normalizeQuote = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  open,
  high,
  low,
  previousClose,
  volume,
  currency = 'INR',
  exchange = 'NSE',
  provider = 'unknown',
  timestamp = new Date().toISOString()
}) => ({
  symbol: String(symbol || '').toUpperCase(),
  name: name || symbol,
  price: toNumber(price) ?? 0,
  change: toNumber(change) ?? 0,
  changePercent: toNumber(changePercent) ?? 0,
  open: toNumber(open),
  high: toNumber(high),
  low: toNumber(low),
  previousClose: toNumber(previousClose),
  volume: toNumber(volume),
  currency: currency || 'INR',
  exchange: exchange || 'NSE',
  provider,
  timestamp: typeof timestamp === 'string' ? timestamp : new Date(timestamp).toISOString()
});

export const normalizeCandle = ({ timestamp, open, high, low, close, volume }) => ({
  timestamp: typeof timestamp === 'string' ? timestamp : new Date(timestamp).toISOString(),
  open: toNumber(open) ?? 0,
  high: toNumber(high) ?? 0,
  low: toNumber(low) ?? 0,
  close: toNumber(close) ?? 0,
  volume: toNumber(volume) ?? 0
});

export const normalizeTechnicals = ({
  symbol,
  rsi = null,
  macd = null,
  sma = null,
  ema = null,
  provider = 'unknown',
  timestamp = new Date().toISOString()
}) => {
  const parsedRsi = toNumber(rsi);
  return {
    symbol: String(symbol || '').toUpperCase(),
    rsi: parsedRsi !== null ? Math.round(parsedRsi * 100) / 100 : null,
    macd: macd ? {
      macd: toNumber(macd.macd),
      signal: toNumber(macd.signal),
      histogram: toNumber(macd.histogram)
    } : null,
    sma: toNumber(sma),
    ema: toNumber(ema),
    provider,
    timestamp: typeof timestamp === 'string' ? timestamp : new Date(timestamp).toISOString()
  };
};

export const normalizeFundamentals = ({
  symbol,
  name,
  description,
  sector,
  industry,
  marketCap,
  peRatio,
  pbRatio,
  eps,
  dividendYield,
  fiftyTwoWeekHigh,
  fiftyTwoWeekLow,
  website,
  provider = 'unknown'
}) => ({
  symbol: String(symbol || '').toUpperCase(),
  name: name || symbol,
  description: description || '',
  sector: sector || 'Financial Services',
  industry: industry || 'Wealth Management',
  marketCap: toNumber(marketCap),
  peRatio: toNumber(peRatio),
  pbRatio: toNumber(pbRatio),
  eps: toNumber(eps),
  dividendYield: toNumber(dividendYield),
  fiftyTwoWeekHigh: toNumber(fiftyTwoWeekHigh),
  fiftyTwoWeekLow: toNumber(fiftyTwoWeekLow),
  website: website || '',
  provider
});

export const normalizeNewsArticle = ({
  id,
  title,
  summary,
  url,
  image,
  source,
  category = 'Markets',
  publishedAt,
  provider = 'unknown'
}) => {
  const sourceName = typeof source === 'object' && source !== null && source.name
    ? source.name
    : (typeof source === 'string' && source ? source : 'Market Intelligence');

  return {
    id: id || `${url}_${title}`.slice(0, 100),
    title: (title || '').trim(),
    summary: (summary || title || '').trim(),
    url: url || '#',
    image: image || '/assets/news/news-indian-equities.webp',
    source: sourceName,
    category: category || 'Markets',
    publishedAt: publishedAt ? (typeof publishedAt === 'string' ? publishedAt : new Date(publishedAt).toISOString()) : new Date().toISOString(),
    provider
  };
};
