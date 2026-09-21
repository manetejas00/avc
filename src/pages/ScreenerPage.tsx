import { FormEvent, useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ScreenerPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [stocks, setStocks] = useState<Array<{ symbol: string; name: string; price: number | null; change: number | null; volume: number | null; marketCap: number | null; sector: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const searchStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://scanner.tradingview.com/india/scan', {
      method: 'POST', signal: controller.signal,
      body: JSON.stringify({
        filter: [{ left: 'type', operation: 'in_range', right: ['stock'] }, { left: 'subtype', operation: 'in_range', right: ['common'] }],
        options: { lang: 'en' }, symbols: { query: { types: [] }, tickers: [] },
        columns: ['name', 'description', 'close', 'change', 'volume', 'market_cap_basic', 'sector'],
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' }, range: [0, 199]
      })
    }).then(async (response) => {
      if (!response.ok) throw new Error();
      const payload = await response.json() as { data?: Array<{ s: string; d: Array<string | number | null> }> };
      setStocks((payload.data || []).map(({ s, d }) => ({
        symbol: String(d[0] || s.split(':').pop() || ''), name: String(d[1] || d[0] || ''),
        price: typeof d[2] === 'number' ? d[2] : null, change: typeof d[3] === 'number' ? d[3] : null,
        volume: typeof d[4] === 'number' ? d[4] : null, marketCap: typeof d[5] === 'number' ? d[5] : null, sector: String(d[6] || '—')
      })));
    }).catch((cause) => { if (cause.name !== 'AbortError') setError('Live market data is temporarily unavailable. Please try again shortly.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const visibleStocks = useMemo(() => {
    const term = submittedQuery.trim().toLowerCase();
    return term ? stocks.filter((stock) => `${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase().includes(term)) : stocks;
  }, [stocks, submittedQuery]);

  return (
    <div className="min-h-screen bg-background pt-24 font-sans text-text">
      <Navbar />
      <main className="container-custom py-10 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow mb-4">Live market intelligence</p>
          <h1 className="text-4xl font-bold md:text-6xl">Market <span className="text-gold-primary">Screener</span></h1>
          <p className="mt-5 text-text-muted md:text-lg">Search and filter live Indian stocks directly in the table.</p>
        </div>
        <form onSubmit={searchStock} className="mx-auto mb-8 flex max-w-2xl gap-3 rounded-2xl border border-white/10 bg-surface p-2 shadow-lg">
          <label htmlFor="stock-search" className="sr-only">Search stocks</label>
          <input
            id="stock-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a company or ticker, e.g. Tata or TCS"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-gold-primary"
          />
          <button type="submit" className="btn-primary shrink-0 !px-5 !py-3">Search</button>
        </form>
        <section className="overflow-hidden rounded-card border border-white/10 bg-surface p-2 shadow-xl md:p-4" aria-label="Live Indian stock screener">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-3 text-sm text-text-muted">
            <span>{loading ? 'Loading live market data…' : submittedQuery ? `${visibleStocks.length} matching stocks` : `${stocks.length} live stocks`}</span>
            {submittedQuery && <button type="button" onClick={() => { setQuery(''); setSubmittedQuery(''); }} className="text-gold-primary hover:text-gold-light">Clear search</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-text-muted"><tr><th className="px-3 py-4">Stock</th><th className="px-3 py-4 text-right">Price</th><th className="px-3 py-4 text-right">Change</th><th className="px-3 py-4 text-right">Volume</th><th className="px-3 py-4 text-right">Market cap</th><th className="px-3 py-4">Sector</th></tr></thead>
              <tbody>
                {loading && <tr><td colSpan={6} className="px-3 py-16 text-center text-text-muted">Loading live stock data…</td></tr>}
                {error && <tr><td colSpan={6} className="px-3 py-16 text-center text-red-400">{error}</td></tr>}
                {!loading && !error && visibleStocks.map((stock) => <tr key={stock.symbol} className="border-b border-white/5 transition hover:bg-white/[0.03]"><td className="px-3 py-4"><p className="font-semibold text-gold-light">{stock.symbol}</p><p className="max-w-[240px] truncate text-xs text-text-muted">{stock.name}</p></td><td className="px-3 py-4 text-right font-medium">{stock.price === null ? '—' : `₹${stock.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}</td><td className={`px-3 py-4 text-right font-medium ${(stock.change || 0) > 0 ? 'text-emerald-400' : (stock.change || 0) < 0 ? 'text-red-400' : 'text-text-muted'}`}>{stock.change === null ? '—' : `${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%`}</td><td className="px-3 py-4 text-right">{stock.volume === null ? '—' : stock.volume.toLocaleString('en-IN', { notation: 'compact' })}</td><td className="px-3 py-4 text-right">{stock.marketCap === null ? '—' : `₹${stock.marketCap.toLocaleString('en-IN', { notation: 'compact', maximumFractionDigits: 2 })}`}</td><td className="px-3 py-4 text-text-muted">{stock.sector}</td></tr>)}
                {!loading && !error && visibleStocks.length === 0 && <tr><td colSpan={6} className="px-3 py-16 text-center text-text-muted">No stocks in the current table match “{submittedQuery}”. Try a ticker or a shorter company name.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-text-muted">Live data is supplied by TradingView and may be delayed. It is for informational purposes only and is not investment advice.</p>
      </main>
      <Footer />
    </div>
  );
}
