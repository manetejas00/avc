import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDownRight, ArrowUpRight, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTopGainers, getTopLosers, StockQuote } from '../services/financialApi';
import { getApiUrl } from '../services/apiClient';

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
  'INR=X': 'USD / INR',
  'USDINR=X': 'USD / INR',
  'GC=F': 'GOLD (COMEX)',
  'CL=F': 'CRUDE OIL (WTI)',
};

const marketSymbols = ['^NSEI', '^BSESN', '^GSPC', '^IXIC', 'INR=X', 'GC=F', 'CL=F'];
const indexSymbols = new Set(['^NSEI', '^BSESN', '^GSPC', '^IXIC']);
const isForex = (symbol: string) => symbol === 'INR=X' || symbol === 'USDINR=X';

// Formats value according to financial market conventions:
// Indices are point levels (no ₹ or $ prefix), Forex is ₹ exchange rate, Commodities are $ per unit.
export const formatMarketValue = (quote: { symbol: string; price: number; currency?: string }): string => {
  if (indexSymbols.has(quote.symbol)) {
    const isIndian = quote.symbol === '^NSEI' || quote.symbol === '^BSESN';
    return new Intl.NumberFormat(isIndian ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(quote.price);
  }

  if (isForex(quote.symbol)) {
    return `₹${quote.price.toFixed(2)}`;
  }

  if (quote.symbol === 'GC=F' || quote.symbol === 'CL=F') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(quote.price);
  }

  return new Intl.NumberFormat(quote.currency === 'INR' || !quote.currency ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: quote.currency || 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(quote.price);
};

export const formatValueOnly = (val: number, symbol: string): string => {
  if (indexSymbols.has(symbol)) {
    const isIndian = symbol === '^NSEI' || symbol === '^BSESN';
    return new Intl.NumberFormat(isIndian ? 'en-IN' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  }
  if (isForex(symbol)) return `₹${val.toFixed(2)}`;
  if (symbol === 'GC=F' || symbol === 'CL=F') {
    return `$${val.toFixed(2)}`;
  }
  return val.toFixed(2);
};

export const getSymbolUnit = (symbol: string): string => {
  if (indexSymbols.has(symbol)) return 'PTS';
  if (isForex(symbol)) return 'INR / USD';
  if (symbol === 'GC=F') return 'USD / OZ';
  if (symbol === 'CL=F') return 'USD / BBL';
  return '';
};

export const formatPointsChange = (quote: { symbol: string; change: number }): string => {
  const prefix = quote.change >= 0 ? '+' : '-';
  const absVal = Math.abs(quote.change);
  const isIndian = quote.symbol === '^NSEI' || quote.symbol === '^BSESN';
  const formatted = new Intl.NumberFormat(isIndian ? 'en-IN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absVal);

  if (indexSymbols.has(quote.symbol)) {
    return `${prefix}${formatted} pts`;
  }
  if (isForex(quote.symbol)) {
    return `${prefix}₹${formatted}`;
  }
  if (quote.symbol === 'GC=F' || quote.symbol === 'CL=F') {
    return `${prefix}$${formatted}`;
  }
  return `${prefix}${formatted}`;
};

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

  return (
    <div className="live-market__chart" aria-label="90 day closing-price chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="marketFill" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor={positive ? '#d4af37' : '#c96454'} stopOpacity=".28" />
            <stop offset="1" stopColor={positive ? '#d4af37' : '#c96454'} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="live-market__area" d={path ? `${path} L 100 100 L 0 100 Z` : ''} fill="url(#marketFill)" />
        <path className="live-market__line" d={path} fill="none" stroke={positive ? '#d4af37' : '#c96454'} vectorEffect="non-scaling-stroke" />
      </svg>
      {!path && <span>Awaiting price history</span>}
    </div>
  );
}

export default function LiveMarketOverview() {
  const sectionRef = useRef<HTMLElement>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [gainers, setGainers] = useState<StockQuote[]>([]);
  const [losers, setLosers] = useState<StockQuote[]>([]);
  const [activeTab, setActiveTab] = useState<'indices' | 'gainers' | 'losers'>('indices');
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('^NSEI');

  const loadChart = async (symbol: string, signal?: AbortSignal) => {
    const parsePoints = (payload: { chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> } }) => {
      const result = payload.chart?.result?.[0];
      const closes = result?.indicators?.quote?.[0]?.close ?? [];
      const timestamps = result?.timestamp ?? [];
      return closes
        .map((value, index) => (value === null ? null : { value, timestamp: new Date((timestamps[index] ?? 0) * 1000).toISOString() }))
        .filter((point): point is Point => point !== null);
    };

    try {
      const primary = await fetch(getApiUrl(`/api/market/chart?symbol=${encodeURIComponent(symbol)}`), { signal });
      if (primary.ok && primary.headers.get('content-type')?.includes('application/json')) {
        const history = (await primary.json()) as Point[];
        if (Array.isArray(history) && history.length) {
          setPoints(history);
          return;
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    }

    const fallback = await fetch(
      getApiUrl(
        import.meta.env.DEV
          ? `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`
          : `/api/yahoo.php?symbol=${encodeURIComponent(symbol)}&range=3mo&interval=1d`
      ),
      { signal }
    );
    if (!fallback.ok) throw new Error('Price history unavailable');
    setPoints(parsePoints(await fallback.json()));
  };

  const loadMarket = async (signal?: AbortSignal) => {
    setStatus(current => (current === 'ready' ? current : 'loading'));
    try {
      const dashboard = await fetch(getApiUrl('/api/market/dashboard'), { signal });
      if (!dashboard.ok) throw new Error('Dashboard unavailable');
      const liveQuotes: Quote[] = await dashboard.json();
      setQuotes(liveQuotes);
      await loadChart(selectedSymbol, signal);

      // Concurrently fetch Top Gainers and Losers
      try {
        const [gainersRes, losersRes] = await Promise.allSettled([
          getTopGainers(signal),
          getTopLosers(signal),
        ]);
        if (gainersRes.status === 'fulfilled' && Array.isArray(gainersRes.value)) {
          setGainers(gainersRes.value);
        }
        if (losersRes.status === 'fulfilled' && Array.isArray(losersRes.value)) {
          setLosers(losersRes.value);
        }
      } catch {
        // Gainers / losers are non-blocking secondary enhancements
      }

      const latestQuoteTime = liveQuotes.find(q => q.lastUpdated)?.lastUpdated;
      if (latestQuoteTime) {
        const parsed = new Date(latestQuoteTime);
        if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 2024 && parsed.getFullYear() <= 2030) {
          setUpdatedAt(parsed);
        } else {
          setUpdatedAt(new Date());
        }
      } else {
        setUpdatedAt(new Date());
      }
      setStatus('ready');
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      try {
        const responses = await Promise.all(
          marketSymbols.map(symbol =>
            fetch(
              getApiUrl(
                import.meta.env.DEV
                  ? `/api/yahoo/v8/finance/chart/${encodeURIComponent(symbol)}?range=3mo&interval=1d`
                  : `/api/yahoo.php?symbol=${encodeURIComponent(symbol)}&range=3mo&interval=1d`
              ),
              { signal }
            )
          )
        );
        if (responses.some(response => !response.ok)) throw new Error('Live market data unavailable');
        const payloads = await Promise.all(
          responses.map(response =>
            response.json() as Promise<{
              chart?: {
                result?: Array<{
                  meta?: Record<string, unknown>;
                  timestamp?: number[];
                  indicators?: { quote?: Array<{ close?: Array<number | null> }> };
                }>;
              };
            }>
          )
        );
        const liveQuotes = payloads
          .map((payload, index): Quote | null => {
            const result = payload.chart?.result?.[0];
            const meta = result?.meta ?? {};
            const price = Number(meta.regularMarketPrice ?? meta.previousClose);
            const previous = Number(meta.chartPreviousClose ?? meta.previousClose);
            if (!Number.isFinite(price) || !Number.isFinite(previous)) return null;
            const change = price - previous;
            return {
              symbol: marketSymbols[index],
              name: String(meta.shortName ?? labels[marketSymbols[index]]),
              price,
              change,
              changePercent: previous ? (change / previous) * 100 : 0,
              currency: String(meta.currency ?? 'INR'),
              lastUpdated: new Date().toISOString(),
            };
          })
          .filter((quote): quote is Quote => quote !== null);
        const nifty = payloads[0].chart?.result?.[0];
        const closes = nifty?.indicators?.quote?.[0]?.close ?? [];
        const timestamps = nifty?.timestamp ?? [];
        setQuotes(liveQuotes);
        setPoints(
          closes
            .map((value, index) => (value === null ? null : { value, timestamp: new Date((timestamps[index] ?? 0) * 1000).toISOString() }))
            .filter((point): point is Point => point !== null)
        );
        setUpdatedAt(new Date());
        setStatus('ready');
      } catch (fallbackError) {
        if ((fallbackError as Error).name !== 'AbortError') setStatus('unavailable');
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadMarket(controller.signal);
    const interval = window.setInterval(() => void loadMarket(), 15 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  const selectMarket = (symbol: string) => {
    setSelectedSymbol(symbol);
    void loadChart(symbol).catch(() => setStatus('unavailable'));
  };

  useGSAP(
    () => {
      const scope = sectionRef.current;
      if (!scope) return;
      const timeline = gsap.timeline({ scrollTrigger: { trigger: scope, start: 'top 78%', once: true } });
      timeline
        .fromTo('.live-market__eyebrow, .live-market__title', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.72, ease: 'power3.out' })
        .fromTo('.live-market__feature, .live-market__quote', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.09, duration: 0.78, ease: 'power3.out' }, '-=.38')
        .fromTo('.live-market__line', { strokeDasharray: 2, strokeDashoffset: 2 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, '-=.55');
    },
    { scope: sectionRef }
  );

  const featured = quotes.find(quote => quote.symbol === selectedSymbol) ?? quotes[0];
  const secondary = quotes.filter(quote => quote.symbol !== featured?.symbol);

  return (
    <section ref={sectionRef} id="market-overview" className="live-market" aria-labelledby="live-market-title">
      <div className="live-market__inner">
        <div className="live-market__heading">
          <p className="live-market__eyebrow">05 — LIVE MARKET OVERVIEW</p>
          <h2 id="live-market-title" className="live-market__title">
            See the market<br />in <em>motion.</em>
          </h2>
          <p className="live-market__copy">Live exchange quotes paired with a clean 90-day price view—built for a quick read, not a crowded terminal.</p>
        </div>
        <div className="live-market__status">
          <span className={status === 'ready' ? 'is-live' : ''} />
          {status === 'ready'
            ? `Live · updated ${updatedAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : status === 'loading'
              ? 'Connecting to market data'
              : 'Live data temporarily unavailable'}
          <button onClick={() => void loadMarket()} aria-label="Refresh market data">
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="live-market__grid">
          <article className="live-market__feature">
            <div className="live-market__feature-top">
              <div className="live-market__feature-title-wrap">
                <span>{featured ? labels[featured.symbol] ?? featured.name : 'NIFTY 50'}</span>
                {featured && getSymbolUnit(featured.symbol) && (
                  <span className="live-market__tag">{getSymbolUnit(featured.symbol)}</span>
                )}
              </div>
              <small>90D PRICE TRACE</small>
            </div>
            <div className="live-market__price">{featured ? formatMarketValue(featured) : '—'}</div>
            {featured && (
              <div className={`live-market__change ${featured.change >= 0 ? 'is-up' : 'is-down'}`}>
                {featured.change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                <strong>{formatPointsChange(featured)}</strong>
                <span>({featured.changePercent >= 0 ? '+' : ''}{featured.changePercent.toFixed(2)}%)</span>
                <span className="live-market__change-period">today</span>
              </div>
            )}
            {points.length >= 2 && featured && (
              <div className="live-market__feature-range">
                <span>90D Low: <em>{formatValueOnly(Math.min(...points.map(p => p.value)), featured.symbol)}</em></span>
                <span>90D High: <em>{formatValueOnly(Math.max(...points.map(p => p.value)), featured.symbol)}</em></span>
              </div>
            )}
            <Chart points={points} positive={(featured?.change ?? 0) >= 0} />
          </article>
          <div className="live-market__quotes-column">
            <div className="live-market__tabs" style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('indices')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: activeTab === 'indices' ? '#d4af37' : 'rgba(255,255,255,0.12)',
                  backgroundColor: activeTab === 'indices' ? 'rgba(212, 175, 55, 0.16)' : 'transparent',
                  color: activeTab === 'indices' ? '#d4af37' : '#999',
                  transition: 'all 0.2s',
                }}
              >
                Key Indices
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gainers')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: activeTab === 'gainers' ? '#22c55e' : 'rgba(255,255,255,0.12)',
                  backgroundColor: activeTab === 'gainers' ? 'rgba(34, 197, 94, 0.16)' : 'transparent',
                  color: activeTab === 'gainers' ? '#22c55e' : '#999',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowUpRight size={13} />
                Top Gainers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('losers')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: activeTab === 'losers' ? '#ef4444' : 'rgba(255,255,255,0.12)',
                  backgroundColor: activeTab === 'losers' ? 'rgba(239, 68, 68, 0.16)' : 'transparent',
                  color: activeTab === 'losers' ? '#ef4444' : '#999',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <ArrowDownRight size={13} />
                Top Losers
              </button>
            </div>

            <div className="live-market__quotes">
              {activeTab === 'indices' && secondary.map(quote => (
                <button
                  type="button"
                  className={`live-market__quote ${selectedSymbol === quote.symbol ? 'is-active' : ''}`}
                  key={quote.symbol}
                  onClick={() => selectMarket(quote.symbol)}
                  aria-label={`Show ${labels[quote.symbol] ?? quote.name} chart`}
                >
                  <div className="live-market__quote-info">
                    <small>{labels[quote.symbol] ?? quote.name}</small>
                    <strong>{formatMarketValue(quote)}</strong>
                  </div>
                  <div className="live-market__quote-meta">
                    <span className={quote.change >= 0 ? 'is-up' : 'is-down'}>
                      {quote.change >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </span>
                    <small className="live-market__quote-points">{formatPointsChange(quote)}</small>
                  </div>
                </button>
              ))}

              {activeTab === 'gainers' && gainers.map(stock => (
                <Link
                  to={`/company/${stock.symbol}`}
                  key={stock.symbol}
                  className="live-market__quote"
                  style={{ textDecoration: 'none' }}
                  title={`View ${stock.symbol} live intelligence & fundamentals`}
                >
                  <div className="live-market__quote-info">
                    <small style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stock.symbol} <ExternalLink size={10} style={{ opacity: 0.6 }} />
                    </small>
                    <strong>₹{stock.price.toFixed(2)}</strong>
                  </div>
                  <div className="live-market__quote-meta">
                    <span className="is-up">
                      +{stock.changePercent.toFixed(2)}%
                    </span>
                    <small className="live-market__quote-points">+{stock.change.toFixed(2)}</small>
                  </div>
                </Link>
              ))}

              {activeTab === 'losers' && losers.map(stock => (
                <Link
                  to={`/company/${stock.symbol}`}
                  key={stock.symbol}
                  className="live-market__quote"
                  style={{ textDecoration: 'none' }}
                  title={`View ${stock.symbol} live intelligence & fundamentals`}
                >
                  <div className="live-market__quote-info">
                    <small style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {stock.symbol} <ExternalLink size={10} style={{ opacity: 0.6 }} />
                    </small>
                    <strong>₹{stock.price.toFixed(2)}</strong>
                  </div>
                  <div className="live-market__quote-meta">
                    <span className="is-down">
                      {stock.changePercent.toFixed(2)}%
                    </span>
                    <small className="live-market__quote-points">{stock.change.toFixed(2)}</small>
                  </div>
                </Link>
              ))}

              {status === 'loading' &&
                Array.from({ length: 6 }, (_, index) => <div className="live-market__quote live-market__skeleton" key={index} />)}
            </div>
          </div>
        </div>
        <p className="live-market__note">Quotes are refreshed every 15 minutes. Data is informational and not investment advice.</p>
      </div>
    </section>
  );
}
