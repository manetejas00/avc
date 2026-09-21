import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type WidgetName = 'symbol-info' | 'advanced-chart' | 'financials';

function TradingViewWidget({ name, symbol, height }: { name: WidgetName; symbol: string; height: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();
    const script = document.createElement('script');
    script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${name}.js`;
    script.async = true;
    script.text = JSON.stringify({
      symbol,
      width: '100%',
      height,
      colorTheme: 'dark',
      locale: 'in',
      isTransparent: true,
      ...(name === 'advanced-chart' ? { interval: 'D', allow_symbol_change: false, calendar: false, support_host: 'https://www.tradingview.com' } : {}),
      ...(name === 'financials' ? { displayMode: 'regular', largeChartUrl: '' } : {})
    });
    container.appendChild(script);
    return () => container.replaceChildren();
  }, [name, symbol, height]);

  return <div ref={containerRef} className="tradingview-widget-container" />;
}

type DividendEvent = { exDate: number | null; paymentDate: number | null; amount: number | null; yield: number | null; frequency: string | null };

function toDividendEvent(values: unknown[]): DividendEvent {
  const asNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;
  return { exDate: asNumber(values[0]), paymentDate: asNumber(values[1]), amount: asNumber(values[2]), yield: asNumber(values[3]), frequency: typeof values[4] === 'string' ? values[4] : null };
}

function formatDate(value: number | null) {
  if (!value) return 'Not announced';
  const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
  return Number.isNaN(date.valueOf()) ? 'Not announced' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function DividendCard({ title, event, upcoming }: { title: string; event: DividendEvent | null; upcoming?: boolean }) {
  const hasData = event && (event.exDate || event.paymentDate || event.amount || event.yield);
  return <article className="rounded-2xl border border-white/10 bg-background/60 p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-primary">{title}</p>
    {hasData ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div><p className="text-xs text-text-muted">Ex-dividend date</p><p className="mt-1 font-semibold">{formatDate(event.exDate)}</p></div>
      <div><p className="text-xs text-text-muted">Payment date</p><p className="mt-1 font-semibold">{formatDate(event.paymentDate)}</p></div>
      <div><p className="text-xs text-text-muted">Amount per share</p><p className="mt-1 font-semibold">{event.amount !== null ? `₹${event.amount.toLocaleString('en-IN')}` : 'Not announced'}</p></div>
      <div><p className="text-xs text-text-muted">Dividend yield</p><p className="mt-1 font-semibold">{event.yield !== null ? `${event.yield.toFixed(2)}%` : 'Not announced'}</p></div>
    </div> : <p className="mt-3 text-sm text-text-muted">{upcoming ? 'No upcoming dividend has been announced for this company.' : 'No recent dividend data is available for this company.'}</p>}
    {hasData && event.frequency && <p className="mt-4 text-xs text-text-muted">Frequency: {event.frequency}</p>}
  </article>;
}

function DividendCalendar({ symbol }: { symbol: string }) {
  const [upcoming, setUpcoming] = useState<DividendEvent | null>(null);
  const [recent, setRecent] = useState<DividendEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadDividends = async () => {
      try {
        const response = await fetch('https://scanner.tradingview.com/india/scan', {
          method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({
            symbols: { tickers: [symbol] },
            columns: ['dividend_ex_date_upcoming', 'dividend_payment_date_upcoming', 'dividend_amount_upcoming', 'dividend_yield_upcoming', 'dividend_frequency_upcoming', 'dividend_ex_date_recent', 'dividend_payment_date_recent', 'dividend_amount_recent', 'dividend_yield_recent', 'dividend_frequency_recent']
          })
        });
        if (!response.ok) throw new Error('Dividend data unavailable');
        const result = await response.json() as { data?: Array<{ d?: unknown[] }> };
        const values = result.data?.[0]?.d ?? [];
        setUpcoming(toDividendEvent(values.slice(0, 5)));
        setRecent(toDividendEvent(values.slice(5, 10)));
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Could not load dividend dates.', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadDividends();
    return () => controller.abort();
  }, [symbol]);

  return <section className="mb-6 rounded-card border border-white/10 bg-surface p-4 shadow-xl md:p-6" aria-label="Dividend calendar">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow mb-2">Shareholder returns</p><h2 className="text-xl font-semibold">Dividend calendar</h2></div><span className="text-xs text-text-muted">Ex-date, payment date, amount and yield</span></div>
    {loading ? <p className="py-8 text-center text-sm text-text-muted">Loading dividend dates…</p> : <div className="grid gap-4"><DividendCard title="Upcoming dividend" event={upcoming} upcoming /><DividendCard title="Most recent dividend" event={recent} /></div>}
  </section>;
}

export function CompanyDetailsContent({ ticker = '', exchange = 'BSE' }: { ticker?: string; exchange?: 'NSE' | 'BSE' }) {
  const cleanTicker = ticker.replace(/[^a-z0-9._-]/gi, '').toUpperCase();
  const safeExchange = exchange === 'NSE' ? 'NSE' : 'BSE';
  const symbol = `${safeExchange}:${cleanTicker || 'RELIANCE'}`;

  return (
    <div className="min-h-screen bg-background pt-24 font-sans text-text">
      <Navbar />
      <main className="container-custom py-10 md:py-16">
        <Link to="/screener" className="mb-8 inline-flex text-sm font-medium text-gold-primary hover:text-gold-light">← Back to Screener</Link>
        <div className="mb-8">
          <p className="eyebrow mb-3">Company research</p>
          <h1 className="text-3xl font-bold md:text-5xl">{cleanTicker || 'RELIANCE'} <span className="text-gold-primary">Company Details</span></h1>
          <p className="mt-4 max-w-3xl text-text-muted">Price activity, key market statistics, charts, financial statements, dividend dates, earnings and valuation information for this {safeExchange}-listed company.</p>
        </div>
        <section className="mb-6 overflow-hidden rounded-card border border-white/10 bg-surface p-3 shadow-xl md:p-4" aria-label="Company market summary">
          <TradingViewWidget name="symbol-info" symbol={symbol} height={180} />
        </section>
        <section className="mb-6 overflow-hidden rounded-card border border-white/10 bg-surface p-3 shadow-xl md:p-4" aria-label="Company price chart">
          <h2 className="mb-4 px-1 text-xl font-semibold">Price chart</h2>
          <TradingViewWidget name="advanced-chart" symbol={symbol} height={560} />
        </section>
        <DividendCalendar symbol={symbol} />
        <section className="overflow-hidden rounded-card border border-white/10 bg-surface p-3 shadow-xl md:p-4" aria-label="Company financials">
          <h2 className="mb-4 px-1 text-xl font-semibold">Financials and valuation</h2>
          <TradingViewWidget name="financials" symbol={symbol} height={760} />
        </section>
        <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-text-muted">Data is supplied by TradingView and may be delayed. It is for informational purposes only and is not investment advice.</p>
      </main>
      <Footer />
    </div>
  );
}

export default function CompanyDetailsPage() {
  const { ticker = '' } = useParams();
  return <CompanyDetailsContent ticker={ticker} />;
}
