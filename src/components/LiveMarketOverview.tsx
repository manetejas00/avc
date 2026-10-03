import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';

type Quote = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  lastUpdated?: string;
};

type Point = { timestamp: string; value: number };

const labels: Record<string, string> = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'SENSEX',
  '^GSPC': 'S&P 500',
  '^IXIC': 'NASDAQ',
  'GC=F': 'GOLD',
  'INR=X': 'USD / INR',
};
const marketSymbols = ['^NSEI', '^BSESN', '^GSPC', '^IXIC', 'GC=F', 'INR=X'];

const money = (value: number, currency?: string) => new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: 'currency',
  currency: currency === 'INR' ? 'INR' : 'USD',
}).format(value);

function Chart({ points, positive }: { points: Point[]; positive: boolean }) {
  const path = useMemo(() => {
    if (points.length < 2) return '';
    const values = points.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return points.map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 90 - ((point.value - min) / range) * 76;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');
  }, [points]);

  return <div className="live-market__chart" aria-label="90 day closing-price chart">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
      <defs><linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1"><stop stopColor={positive ? '#d4af37' : '#c96454'} stopOpacity=".28" /><stop offset="1" stopColor={positive ? '#d4af37' : '#c96454'} stopOpacity="0" /></linearGradient></defs>
      <path className="live-market__area" d={path ? `${path} L 100 100 L 0 100 Z` : ''} fill="url(#marketFill)" />
      <path className="live-market__line" d={path} fill="none" stroke={positive ? '#d4af37' : '#c96454'} vectorEffect="non-scaling-stroke" />
    </svg>
    {!path && <span>Awaiting price history</span>}
  </div>;
}

export default function LiveMarketOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadMarket = async (signal?: AbortSignal) => {
    setStatus(current => current === 'ready' ? current : 'loading');
    try {
      const dashboard = await fetch('/api/market/dashboard', { signal });
      if (!dashboard.ok) throw new Error('Dashboard unavailable');
      const liveQuotes: Quote[] = await dashboard.json();
      setQuotes(liveQuotes);
      const chart = await fetch('/api/market/chart?symbol=%5ENSEI', { signal });
      if (chart.ok) {
        const history: Point[] = await chart.json();
        setPoints(history);
      }
      setUpdatedAt(new Date());
      setStatus('ready');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      try {
        const responses = await Promise.all(marketSymbols.map(symbol => fetch(`/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`, { signal })));
        if (responses.some(response => !response.ok)) throw new Error('Live market data unavailable');
        const payloads = await Promise.all(responses.map(response => response.json() as Promise<{ chart?: { result?: Array<{ meta?: Record<string, unknown>; timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } }>));
        const liveQuotes = payloads.map((payload, index): Quote | null => {
          const result = payload.chart?.result?.[0]; const meta = result?.meta ?? {}; const price = Number(meta.regularMarketPrice ?? meta.previousClose);
          const previous = Number(meta.chartPreviousClose ?? meta.previousClose); if (!Number.isFinite(price) || !Number.isFinite(previous)) return null;
          const change = price - previous; return { symbol: marketSymbols[index], name: String(meta.shortName ?? labels[marketSymbols[index]]), price, change, changePercent: previous ? (change / previous) * 100 : 0, currency: String(meta.currency ?? 'INR'), lastUpdated: new Date().toISOString() };
        }).filter((quote): quote is Quote => quote !== null);
        const nifty = payloads[0].chart?.result?.[0]; const closes = nifty?.indicators?.quote?.[0]?.close ?? []; const timestamps = nifty?.timestamp ?? [];
        setQuotes(liveQuotes); setPoints(closes.map((value, index) => value === null ? null : { value, timestamp: new Date((timestamps[index] ?? 0) * 1000).toISOString() }).filter((point): point is Point => point !== null)); setUpdatedAt(new Date()); setStatus('ready');
      } catch (fallbackError) {
        if ((fallbackError as Error).name !== 'AbortError') setStatus('unavailable');
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadMarket(controller.signal);
    const interval = window.setInterval(() => void loadMarket(), 15 * 60 * 1000);
    return () => { controller.abort(); window.clearInterval(interval); };
  }, []);

  useGSAP(() => {
    const scope = sectionRef.current;
    if (!scope) return;
    const timeline = gsap.timeline({ scrollTrigger: { trigger: scope, start: 'top 78%', once: true } });
    timeline.fromTo('.live-market__eyebrow, .live-market__title', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1, duration: .72, ease: 'power3.out' })
      .fromTo('.live-market__feature, .live-market__quote', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .09, duration: .78, ease: 'power3.out' }, '-=.38')
      .fromTo('.live-market__line', { strokeDasharray: 2, strokeDashoffset: 2 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=.55');
  }, { scope: sectionRef });

  const featured = quotes.find(quote => quote.symbol === '^NSEI') ?? quotes[0];
  const secondary = quotes.filter(quote => quote.symbol !== featured?.symbol).slice(0, 5);

  return <section ref={sectionRef} id="market-overview" className="live-market" aria-labelledby="live-market-title">
    <div className="live-market__inner">
      <div className="live-market__heading">
        <p className="live-market__eyebrow">05 — LIVE MARKET OVERVIEW</p>
        <h2 id="live-market-title" className="live-market__title">See the market<br />in <em>motion.</em></h2>
        <p className="live-market__copy">Live exchange quotes paired with a clean 90-day price view—built for a quick read, not a crowded terminal.</p>
      </div>
      <div className="live-market__status"><span className={status === 'ready' ? 'is-live' : ''} />{status === 'ready' ? `Live · updated ${updatedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : status === 'loading' ? 'Connecting to market data' : 'Live data temporarily unavailable'}<button onClick={() => void loadMarket()} aria-label="Refresh market data"><RefreshCw size={14} /></button></div>
      <div className="live-market__grid">
        <article className="live-market__feature">
          <div className="live-market__feature-top"><span>{featured ? (labels[featured.symbol] ?? featured.name) : 'NIFTY 50'}</span><small>90D PRICE TRACE</small></div>
          <div className="live-market__price">{featured ? money(featured.price, featured.currency) : '—'}</div>
          {featured && <div className={`live-market__change ${featured.changePercent >= 0 ? 'is-up' : 'is-down'}`}>{featured.changePercent >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}{Math.abs(featured.changePercent).toFixed(2)}% <span>today</span></div>}
          <Chart points={points} positive={(featured?.changePercent ?? 0) >= 0} />
        </article>
        <div className="live-market__quotes">
          {secondary.map(quote => <article className="live-market__quote" key={quote.symbol}>
            <div><small>{labels[quote.symbol] ?? quote.name}</small><strong>{money(quote.price, quote.currency)}</strong></div>
            <span className={quote.changePercent >= 0 ? 'is-up' : 'is-down'}>{quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%</span>
          </article>)}
          {status === 'loading' && Array.from({ length: 5 }, (_, index) => <div className="live-market__quote live-market__skeleton" key={index} />)}
        </div>
      </div>
      <p className="live-market__note">Quotes are refreshed every 15 minutes. Data is informational and not investment advice.</p>
    </div>
  </section>;
}
