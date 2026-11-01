import { parseYahooQuote } from './yahooQuote';
export const watchlistSymbols = ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','ICICIBANK.NS','INFY.NS','ITC.NS','SBIN.NS','BHARTIARTL.NS','HINDUNILVR.NS','KOTAKBANK.NS','AXISBANK.NS','HCLTECH.NS'];
export function parseWatchlist(payload: { data?: Array<{ symbol: string; result: any }> }) {
  const seen = new Set<string>();
  const quotes = (Array.isArray(payload?.data) ? payload.data : []).flatMap(({symbol,result}) => {
    if (!watchlistSymbols.includes(symbol) || result?.meta?.symbol !== symbol || seen.has(symbol) || result?.meta?.currency !== 'INR') return [];
    const quote = parseYahooQuote(symbol, result);
    if (!quote) return [];
    seen.add(symbol);
    return [{ ...quote, symbol: symbol.replace(/\.NS$/, ''), provider: 'Yahoo Finance', exchange: 'NSE', timestamp: quote.lastUpdated }];
  });
  return { count: quotes.length, gainers: quotes.filter(q=>q.changePercent>0).sort((a,b)=>b.changePercent-a.changePercent).slice(0,6), losers: quotes.filter(q=>q.changePercent<0).sort((a,b)=>a.changePercent-b.changePercent).slice(0,6) };
}
