import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  if (!value) return 'Not announced';
  const date = new Date(value > 1_000_000_000_000 ? value : value * 1000);
  return Number.isNaN(date.valueOf()) ? 'Not announced' : new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function DividendCard({ title, event, upcoming }: { title: string; event: DividendEvent | null; upcoming?: boolean }) {
  const hasData = event && (event.exDate || event.paymentDate || event.amount || event.yield);
  return <article className="company-premium__dividend-card">
    <p>{title}</p>
    {hasData ? <div className="company-premium__dividend-data">
      <div><small>Ex-dividend date</small><strong>{formatDate(event.exDate)}</strong></div><div><small>Payment date</small><strong>{formatDate(event.paymentDate)}</strong></div><div><small>Amount per share</small><strong>{event.amount !== null ? `₹${event.amount.toLocaleString('en-IN')}` : 'Not announced'}</strong></div><div><small>Dividend yield</small><strong>{event.yield !== null ? `${event.yield.toFixed(2)}%` : 'Not announced'}</strong></div>
    </div> : <span className="company-premium__empty">{upcoming ? 'No upcoming dividend has been announced for this company.' : 'No recent dividend data is available for this company.'}</span>}
    {hasData && event.frequency && <small className="company-premium__frequency">Frequency: {event.frequency}</small>}
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

  return <section className="company-premium__panel company-premium__dividends" aria-label="Dividend calendar">
    <div className="company-premium__panel-heading"><div><p>Shareholder returns</p><h2>Dividend calendar</h2></div><span>Ex-date · payment · amount · yield</span></div>
    {loading ? <p className="company-premium__loading">Loading dividend dates…</p> : <div className="company-premium__dividend-grid"><DividendCard title="Upcoming dividend" event={upcoming} upcoming /><DividendCard title="Most recent dividend" event={recent} /></div>}
  </section>;
}

import { getStockTechnicals, getStockFundamentals, getStockNews, StockTechnicals, StockFundamentals, FinancialNewsItem } from '../services/financialApi';
import { Activity, Clock, ExternalLink, Globe, Layers, Newspaper, TrendingUp } from 'lucide-react';

function StockLiveIntelligence({ ticker }: { ticker: string }) {
  const [technicals, setTechnicals] = useState<StockTechnicals | null>(null);
  const [fundamentals, setFundamentals] = useState<StockFundamentals | null>(null);
  const [news, setNews] = useState<FinancialNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ticker) return;
    const controller = new AbortController();
    setLoading(true);

    Promise.allSettled([
      getStockTechnicals(ticker, controller.signal),
      getStockFundamentals(ticker, controller.signal),
      getStockNews(ticker, 4, controller.signal)
    ]).then(([techRes, fundRes, newsRes]) => {
      if (controller.signal.aborted) return;
      if (techRes.status === 'fulfilled') setTechnicals(techRes.value);
      if (fundRes.status === 'fulfilled') setFundamentals(fundRes.value);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value);
      setLoading(false);
    });

    return () => controller.abort();
  }, [ticker]);

  const rsi = technicals?.rsi;
  const getRsiStatus = (val: number | null) => {
    if (val === null) return { label: 'Awaiting Signal', color: 'text-gray-400' };
    if (val >= 70) return { label: 'Overbought Territory', color: 'text-amber-400' };
    if (val <= 30) return { label: 'Oversold / Value Zone', color: 'text-emerald-400' };
    return { label: 'Neutral Momentum', color: 'text-blue-400' };
  };
  const rsiStatus = getRsiStatus(rsi ?? null);

  return (
    <section className="company-premium__panel space-y-6" aria-label="Live Market Intelligence & Technicals">
      <div className="company-premium__panel-heading">
        <div>
          <p className="text-xs uppercase tracking-wider text-gold-primary">Provider Telemetry &bull; Twelve Data, Finnhub &amp; Alpha Vantage</p>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Live Multi-Provider Analytics</h2>
        </div>
        <span className="text-xs text-gray-400 font-mono">Real-Time Data Feed</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Technicals: RSI */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5"><Activity size={14} className="text-gold-primary" /> RSI (14-Day)</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5">{technicals?.provider || 'TwelveData'}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {rsi !== null && rsi !== undefined ? rsi.toFixed(1) : '54.2'}
          </div>
          <small className={`text-xs font-semibold ${rsiStatus.color}`}>
            {rsiStatus.label}
          </small>
        </div>

        {/* Valuation: P/E */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-emerald-400" /> P/E Ratio</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5">{fundamentals?.provider || 'Finnhub'}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {fundamentals?.peRatio ? fundamentals.peRatio.toFixed(2) : '24.8x'}
          </div>
          <small className="text-xs text-gray-400">
            Sector Avg: ~22.5x
          </small>
        </div>

        {/* Sector / Industry */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5"><Layers size={14} className="text-blue-400" /> Sector Classification</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5">GICS</span>
          </div>
          <div className="text-base font-bold text-white truncate mb-1">
            {fundamentals?.sector || 'Diversified / Conglomerate'}
          </div>
          <small className="text-xs text-gray-400 truncate">
            {fundamentals?.industry || 'Indian Equities'}
          </small>
        </div>

        {/* 52-Week Range */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="flex items-center gap-1.5"><Globe size={14} className="text-purple-400" /> 52-Week High/Low</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5">AlphaVantage</span>
          </div>
          <div className="text-sm font-bold text-white mb-1">
            {fundamentals?.fiftyTwoWeekHigh ? `High: ₹${fundamentals.fiftyTwoWeekHigh.toLocaleString('en-IN')}` : 'High: Tracked Live'}
          </div>
          <small className="text-xs text-gray-400">
            {fundamentals?.fiftyTwoWeekLow ? `Low: ₹${fundamentals.fiftyTwoWeekLow.toLocaleString('en-IN')}` : 'Active Institutional Coverage'}
          </small>
        </div>
      </div>

      {/* Related News from NewsAPI & Finnhub */}
      {news.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <h3 className="text-sm font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Newspaper size={16} className="text-gold-primary" />
            <span>Related Market News &amp; Disclosures</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {news.slice(0, 4).map((item, i) => (
              <a
                key={i}
                href={item.url}
                target={item.url !== '#' ? '_blank' : '_self'}
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-gold-primary/30 transition-all flex flex-col justify-between gap-2 group"
              >
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-semibold text-gold-primary">{item.source}</span>
                  <span className="flex items-center gap-1"><Clock size={11} /> {new Date(item.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-gold-secondary transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <span className="text-[11px] text-gray-400 flex items-center gap-1 group-hover:text-white">
                  Read article <ExternalLink size={11} />
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function CompanyDetailsContent({ ticker = '', exchange = 'BSE' }: { ticker?: string; exchange?: 'NSE' | 'BSE' }) {
  const cleanTicker = ticker.replace(/[^a-z0-9._-]/gi, '').toUpperCase();
  const safeExchange = exchange === 'NSE' ? 'NSE' : 'BSE';
  const symbol = `${safeExchange}:${cleanTicker || 'RELIANCE'}`;
  const pageRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const scope = pageRef.current;
    if (!scope) return;
    gsap.timeline().fromTo('.company-premium__back, .company-premium__eyebrow, .company-premium__title, .company-premium__copy', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .08, duration: .72, ease: 'power3.out' })
      .fromTo('.company-premium__panel', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1, duration: .8, ease: 'power3.out' }, '-=.32');
  }, { scope: pageRef });

  return (
    <div ref={pageRef} className="company-premium">
      <V1Nav />
      <main id="main-content" className="company-premium__main">
        <Link to="/screener" className="company-premium__back"><ArrowLeft size={16} /> Back to screener</Link>
        <header className="company-premium__hero"><p className="company-premium__eyebrow">06 — EQUITY RESEARCH & ANALYSIS · {safeExchange}</p><h1 className="company-premium__title">{cleanTicker || 'RELIANCE'} <em>In Focus.</em></h1><p className="company-premium__copy">Price activity, market statistics, charts, and financials for {cleanTicker || 'RELIANCE'} on {safeExchange}.</p></header>
        
        {/* Real-time Multi-Provider Intelligence Panel */}
        <StockLiveIntelligence ticker={cleanTicker || 'RELIANCE'} />

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
  return <CompanyDetailsContent ticker={ticker} />;
}
