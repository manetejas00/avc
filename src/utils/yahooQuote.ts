export function parseYahooQuote(symbol: string, result: any) {
  const meta = result?.meta ?? {};
  const price = Number(meta.regularMarketPrice);
  const time = Number(meta.regularMarketTime);
  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(time) || time <= 0) return null;
  const sessionDay = (timestamp: number) => Math.floor((timestamp + Number(meta.gmtoffset || 0)) / 86400);
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const timestamps: number[] = result?.timestamp ?? [];
  let previousIndex = -1; timestamps.forEach((timestamp, index) => { if (sessionDay(timestamp) < sessionDay(time) && Number.isFinite(closes[index]) && closes[index] > 0) previousIndex = index; });
  const previous = Number(meta.previousClose ?? meta.regularMarketPreviousClose ?? (previousIndex >= 0 ? closes[previousIndex] : NaN));
  const reportedChange = meta.regularMarketChange ?? meta.fulldayChange;
  const change = reportedChange != null ? Number(reportedChange) : price - previous;
  const baseline = reportedChange != null ? price - change : previous;
  if (!Number.isFinite(change) || !Number.isFinite(baseline) || baseline <= 0) return null;
  return { symbol, name: String(meta.shortName ?? symbol), price, change, changePercent: change / baseline * 100, currency: String(meta.currency ?? 'INR'), lastUpdated: new Date(time * 1000).toISOString() };
}
