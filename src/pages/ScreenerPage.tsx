import { FormEvent, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ScreenerPage() {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');

  const searchStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    window.open(`https://in.tradingview.com/search/?query=${encodeURIComponent(term)}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;

    container.replaceChildren();
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.text = JSON.stringify({
      width: '100%',
      height: 720,
      defaultColumn: 'overview',
      screener_type: 'stock',
      displayCurrency: 'INR',
      colorTheme: 'dark',
      locale: 'in',
      isTransparent: true,
      market: 'india',
      showToolbar: true
    });
    container.appendChild(script);

    return () => { container.replaceChildren(); };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 font-sans text-text">
      <Navbar />
      <main className="container-custom py-10 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow mb-4">Live market intelligence</p>
          <h1 className="text-4xl font-bold md:text-6xl">Market <span className="text-gold-primary">Screener</span></h1>
          <p className="mt-5 text-text-muted md:text-lg">Explore live Indian market data, sort stocks, and apply filters directly in the screener.</p>
        </div>
        <form onSubmit={searchStock} className="mx-auto mb-8 flex max-w-2xl gap-3 rounded-2xl border border-white/10 bg-surface p-2 shadow-lg">
          <label htmlFor="stock-search" className="sr-only">Search stocks</label>
          <input
            id="stock-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a company or ticker, e.g. Reliance or TCS"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-gold-primary"
          />
          <button type="submit" className="btn-primary shrink-0 !px-5 !py-3" disabled={!query.trim()}>Search</button>
        </form>
        <section className="overflow-hidden rounded-card border border-white/10 bg-surface p-2 shadow-xl md:p-4" aria-label="Live Indian stock screener">
          <div ref={widgetRef} className="tradingview-widget-container min-h-[720px]" />
        </section>
        <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-text-muted">Live data is supplied by TradingView and may be delayed. It is for informational purposes only and is not investment advice.</p>
      </main>
      <Footer />
    </div>
  );
}
