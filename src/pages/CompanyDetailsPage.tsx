import { useEffect, useRef } from 'react';
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
          <p className="mt-4 max-w-3xl text-text-muted">Price activity, key market statistics, charts, financial statements, earnings and valuation information for this BSE-listed company.</p>
        </div>
        <section className="mb-6 overflow-hidden rounded-card border border-white/10 bg-surface p-3 shadow-xl md:p-4" aria-label="Company market summary">
          <TradingViewWidget name="symbol-info" symbol={symbol} height={180} />
        </section>
        <section className="mb-6 overflow-hidden rounded-card border border-white/10 bg-surface p-3 shadow-xl md:p-4" aria-label="Company price chart">
          <h2 className="mb-4 px-1 text-xl font-semibold">Price chart</h2>
          <TradingViewWidget name="advanced-chart" symbol={symbol} height={560} />
        </section>
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
