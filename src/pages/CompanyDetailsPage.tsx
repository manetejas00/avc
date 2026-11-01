import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';
import RegulatoryDisclaimer from '../components/RegulatoryDisclaimer';

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
    const widgetTheme = 'dark';
    script.text = JSON.stringify({
      symbol,
      width: '100%',
      height,
      colorTheme: widgetTheme,
      locale: 'in',
      isTransparent: true,
      ...(name === 'advanced-chart' ? {
        interval: 'D',
        timezone: 'Asia/Kolkata',
        theme: widgetTheme,
        style: '1',
        locale: 'in',
        enable_publishing: false,
        allow_symbol_change: true,
        calendar: true,
        support_host: 'https://www.tradingview.com',
        studies: [
          'STD;RSI',
          'STD;MACD',
          'STD;EMA'
        ],
        show_popup_button: true,
        popup_width: '1000',
        popup_height: '650',
        withdateranges: true,
        hide_side_toolbar: false
      } : {}),
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
  if (!value) return 'Not supplied';
  const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
  return Number.isNaN(date.valueOf()) ? 'Not supplied' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function DividendCard({ title, event, upcoming }: { title: string; event: DividendEvent | null; upcoming?: boolean }) {
  const hasData = event && (event.exDate || event.paymentDate || event.amount || event.yield);
  return <article className="company-premium__dividend-card">
    <p>{title}</p>
    {hasData ? <div className="company-premium__dividend-data">
      <div><small>Ex-dividend date</small><strong>{formatDate(event.exDate)}</strong></div><div><small>Payment date</small><strong>{formatDate(event.paymentDate)}</strong></div><div><small>Amount per share</small><strong>{event.amount !== null ? `₹${event.amount.toLocaleString('en-IN')}` : 'Not supplied'}</strong></div><div><small>Dividend yield</small><strong>{event.yield !== null ? `${event.yield.toFixed(2)}%` : 'Not supplied'}</strong></div>
    </div> : <span className="company-premium__empty">{upcoming ? 'No upcoming dividend record in this provider feed. Check exchange announcements.' : 'No recent dividend record in this provider feed. Check exchange announcements.'}</span>}
    {hasData && event.frequency && <small className="company-premium__frequency">Frequency: {event.frequency}</small>}
  </article>;
}

function DividendCalendar({ symbol }: { symbol: string }) {
  const [upcoming, setUpcoming] = useState<DividendEvent | null>(null);
  const [recent, setRecent] = useState<DividendEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [checkedAt, setCheckedAt] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const loadDividends = async () => {
      setLoading(true); setFailed(false); setCheckedAt(''); setUpcoming(null); setRecent(null);
      try {
        const [exchange, ticker] = symbol.split(':');
        const payload = await getJson<{ values: Record<string, unknown>; checkedAt: string }>(`/api/company-data.php?symbol=${encodeURIComponent(ticker)}&exchange=${exchange}&mode=dividends`, { signal: controller.signal, timeoutMs: 12000 });
        const keys = ['dividend_ex_date_upcoming', 'dividend_payment_date_upcoming', 'dividend_amount_upcoming', 'dividend_yield_upcoming', 'dividend_frequency_upcoming', 'dividend_ex_date_recent', 'dividend_payment_date_recent', 'dividend_amount_recent', 'dividend_yield_recent', 'dividend_frequency_recent'];
        const values = keys.map(key => payload.values[key]);
        setCheckedAt(payload.checkedAt);
        setUpcoming(toDividendEvent(values.slice(0, 5)));
        setRecent(toDividendEvent(values.slice(5, 10)));
      } catch (error) {
        if (!controller.signal.aborted) { setFailed(true); console.warn('Could not load dividend dates.', error); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadDividends();
    return () => controller.abort();
  }, [symbol, retry]);

  return <section className="company-premium__panel company-premium__dividends" aria-label="Dividend calendar">
    <div className="company-premium__panel-heading"><div><p>Shareholder returns</p><h2>Dividend calendar</h2></div><span>Ex-date · payment · amount · yield</span></div>
    {loading ? <p className="company-premium__loading">Loading dividend dates…</p> : failed ? <p className="company-data__message">The dividend feed could not be reached. <button type="button" className="underline" onClick={() => setRetry(value => value + 1)}>Retry</button> or check the company’s exchange announcements.</p> : <div className="company-premium__dividend-grid"><DividendCard title="Upcoming dividend" event={upcoming} upcoming /><DividendCard title="Most recent dividend" event={recent} /></div>}<p className="company-data__footnote">Source: TradingView dividend calendar.{checkedAt && <> Feed checked {new Date(checkedAt).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})} IST.</>} Dates are announcements in the provider feed, not a guarantee of payment.</p>
  </section>;
}

import { getJson } from '../services/apiClient';
import { CompanyProfile, parseCompanyProfile } from '../utils/companyData';
import { Activity, ExternalLink, Globe, Layers, TrendingUp } from 'lucide-react';

function StockLiveIntelligence({ ticker, exchange }: { ticker: string; exchange: 'NSE' | 'BSE' }) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setProfile(null);
    void getJson(`/api/company-data.php?symbol=${encodeURIComponent(ticker)}&exchange=${exchange}`, { signal: controller.signal, timeoutMs: 12000 })
      .then(payload => { if (!controller.signal.aborted) setProfile(parseCompanyProfile(payload, `${exchange}:${ticker}`)); })
      .catch(() => { if (!controller.signal.aborted) setError('The company feed could not be refreshed. Try again, or use the provider widgets below.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ticker, exchange, attempt]);
  const time = profile ? new Date(profile.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' IST' : '';
  return <section className="company-premium__panel company-data" aria-label="Company data" aria-busy={loading}>
    <div className="company-premium__panel-heading company-data__heading"><div>
      <p className="company-data__eyebrow">Additional market data</p><h2>Company data</h2>
      {profile && <p className="company-data__source">{profile.symbol} · {profile.name}<br />Source: {profile.source} · Quote as of {time}<br />{profile.delay}. Values may reflect the last trading session.</p>}
    </div><span className="company-data__status">{loading ? 'Loading' : profile ? exchange : 'Connection issue'}</span></div>
    {loading && <p className="company-data__message" role="status">Loading dated company metrics…</p>}
    {error && <p className="company-data__message" role="status">{error} <button type="button" className="underline" onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}
    {profile && <div className="company-data__grid">
      <article className="company-data__card"><div><span><Activity size={16} />RSI (14-day)</span><small>TradingView</small></div><strong>{profile.rsi === null ? 'Not reported' : profile.rsi.toFixed(1)}</strong><p>{profile.rsi === null ? 'The provider did not supply an RSI for this record.' : 'Source-calculated indicator. It is not a buy or sell recommendation.'}</p></article>
      <article className="company-data__card"><div><span><TrendingUp size={16} />P/E ratio (TTM)</span><small>TradingView</small></div><strong>{profile.pe === null ? 'Not reported' : `${profile.pe.toFixed(2)}×`}</strong><p>{profile.pe === null ? 'The provider did not supply a P/E for this record.' : 'Price relative to trailing 12-month earnings. This is not a sector comparison.'}</p></article>
      <article className="company-data__card"><div><span><Layers size={16} />Sector</span><small>Provider classification</small></div><strong className="company-data__sector">{profile.sector || 'Not classified'}</strong><p>{profile.industry || 'The provider has not classified this industry.'}</p></article>
      <article className="company-data__card"><div><span><Globe size={16} />52-week range</span><small>TradingView</small></div><strong className="company-data__range">{profile.low !== null && profile.high !== null ? `₹${profile.low.toLocaleString('en-IN')} – ₹${profile.high.toLocaleString('en-IN')}` : 'Not reported'}</strong><p>Low to high over the provider’s 52-week window. Currency: INR.</p></article>
    </div>}
    <p className="company-data__footnote">Check the exchange and quote time before using these figures. <a href={`https://www.tradingview.com/symbols/${exchange}-${encodeURIComponent(ticker)}/`} target="_blank" rel="noreferrer">Open the provider’s symbol page <ExternalLink size={12} /></a></p>
  </section>;
}

export function CompanyDetailsContent({ ticker = '', exchange = 'BSE' }: { ticker?: string; exchange?: 'NSE' | 'BSE' }) {
  const cleanTicker = /^[a-z0-9._&-]+$/i.test(ticker.trim()) ? ticker.trim().toUpperCase() : '';
  const safeExchange = exchange === 'NSE' ? 'NSE' : 'BSE';
  const symbol = `${safeExchange}:${cleanTicker || 'RELIANCE'}`;
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.title = cleanTicker ? `${cleanTicker} Company Research | AVC Dhanam` : 'Company not found | AVC Dhanam';
  }, [cleanTicker]);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const scope = pageRef.current;
    if (!scope) return;
    gsap.timeline().fromTo('.company-premium__back, .company-premium__eyebrow, .company-premium__title, .company-premium__copy', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .08, duration: .72, ease: 'power3.out' })
      .fromTo('.company-premium__panel', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1, duration: .8, ease: 'power3.out' }, '-=.32');
  }, { scope: pageRef });

  if (!cleanTicker) return <main className="min-h-screen grid place-content-center gap-4 p-8 text-center"><h1>Company not found</h1><Link to="/screener">Back to screener</Link></main>;

  return (
    <div ref={pageRef} className="company-premium">
      <V1Nav />
      <main id="main-content" className="company-premium__main">
        <Link to="/screener" className="company-premium__back"><ArrowLeft size={16} /> Back to screener</Link>
        <header className="company-premium__hero"><p className="company-premium__eyebrow">06 — EQUITY RESEARCH & ANALYSIS · {safeExchange}</p><h1 className="company-premium__title">{cleanTicker || 'RELIANCE'} <em>In Focus.</em></h1><p className="company-premium__copy">Price activity, market statistics, charts, and financials for {cleanTicker || 'RELIANCE'} on {safeExchange}.</p></header>
        
        {/* Real-time Multi-Provider Intelligence Panel */}
        <StockLiveIntelligence ticker={cleanTicker} exchange={safeExchange} />

        <section className="company-premium__panel company-premium__summary" aria-label="Company market summary"><div className="company-premium__panel-kicker">LIVE MARKET SUMMARY <ArrowUpRight size={14} /></div>
          <TradingViewWidget name="symbol-info" symbol={symbol} height={180} />
        </section>
        <section className="company-premium__panel" aria-label="Company price chart"><div className="company-premium__panel-heading"><div><p>Market movement</p><h2>Price chart</h2></div><span>Daily view</span></div>
          <TradingViewWidget name="advanced-chart" symbol={symbol} height={560} />
        </section>
        <DividendCalendar symbol={symbol} />
        <section className="company-premium__panel" aria-label="Company financials"><div className="company-premium__panel-heading"><div><p>Fundamental research</p><h2>Financials and valuation</h2></div><span>Live statements</span></div>
          <TradingViewWidget name="financials" symbol={symbol} height={760} />
        </section>
        <RegulatoryDisclaimer />
      </main>
      <V1Footer />
    </div>
  );
}

export default function CompanyDetailsPage() {
  const { ticker = '' } = useParams();
  const [params] = useSearchParams();
  const exchange = params.get('exchange') === 'NSE' ? 'NSE' : 'BSE';
  return <CompanyDetailsContent ticker={ticker} exchange={exchange} />;
}
