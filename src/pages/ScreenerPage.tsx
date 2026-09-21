import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CompanyDetailsContent } from './CompanyDetailsPage';

const companies = [
  ['RELIANCE', 'Reliance Industries Limited'], ['TCS', 'Tata Consultancy Services Limited'], ['TATASTEEL', 'Tata Steel Limited'],
  ['TATAMOTORS', 'Tata Motors Limited'], ['TATAPOWER', 'Tata Power Company Limited'], ['TATACONSUM', 'Tata Consumer Products Limited'],
  ['TATACAP', 'Tata Capital Limited'], ['TATATECH', 'Tata Technologies Limited'], ['TITAN', 'Titan Company Limited'],
  ['HDFCBANK', 'HDFC Bank Limited'], ['ICICIBANK', 'ICICI Bank Limited'], ['SBIN', 'State Bank of India'],
  ['BHARTIARTL', 'Bharti Airtel Limited'], ['INFY', 'Infosys Limited'], ['HCLTECH', 'HCL Technologies Limited'],
  ['WIPRO', 'Wipro Limited'], ['TECHM', 'Tech Mahindra Limited'], ['LT', 'Larsen & Toubro Limited'],
  ['ITC', 'ITC Limited'], ['HINDUNILVR', 'Hindustan Unilever Limited'], ['MARUTI', 'Maruti Suzuki India Limited'],
  ['SUNPHARMA', 'Sun Pharmaceutical Industries Limited'], ['BAJFINANCE', 'Bajaj Finance Limited'], ['ADANIENT', 'Adani Enterprises Limited'],
  ['ADANIPORTS', 'Adani Ports & Special Economic Zone Limited'], ['AXISBANK', 'Axis Bank Limited'], ['KOTAKBANK', 'Kotak Mahindra Bank Limited']
] as const;

export default function ScreenerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyTicker = searchParams.get('company');
  const widgetRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    const match = companies.find(([ticker, name]) => ticker.toLowerCase() === term.toLowerCase() || name.toLowerCase() === term.toLowerCase());
    if (match) navigate(`/screener?company=${encodeURIComponent(match[0])}`);
    else setShowSuggestions(true);
  };

  const suggestions = query.trim().length < 1 ? [] : companies.filter(([ticker, name]) => `${ticker} ${name}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8);

  const selectCompany = (ticker: string, name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    navigate(`/screener?company=${encodeURIComponent(ticker)}`);
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

  if (companyTicker) return <CompanyDetailsContent ticker={companyTicker} />;

  return (
    <div className="min-h-screen bg-background pt-24 font-sans text-text">
      <Navbar />
      <main className="container-custom py-10 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow mb-4">Live market intelligence</p>
          <h1 className="text-4xl font-bold md:text-6xl">Market <span className="text-gold-primary">Screener</span></h1>
          <p className="mt-5 text-text-muted md:text-lg">Explore live Indian market data, sort stocks, and apply filters directly in the screener.</p>
        </div>
        <form onSubmit={searchStock} className="relative mx-auto mb-8 flex max-w-2xl gap-3 rounded-2xl border border-white/10 bg-surface p-2 shadow-lg">
          <label htmlFor="stock-search" className="sr-only">Search stocks</label>
          <input
            id="stock-search"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search a company or ticker, e.g. Tata or TCS"
            className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-gold-primary"
          />
          <button type="submit" className="btn-primary shrink-0 !px-5 !py-3" disabled={!query.trim()}>Search</button>
          {showSuggestions && query.trim() && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-xl border border-white/10 bg-[#151515] text-left shadow-2xl">
              {suggestions.length > 0 ? suggestions.map(([ticker, name]) => (
                <button key={ticker} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectCompany(ticker, name)} className="flex w-full items-center justify-between gap-4 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-0">
                  <span className="min-w-0 truncate text-sm font-medium text-text">{name}</span><span className="shrink-0 text-xs font-semibold text-gold-primary">{ticker}</span>
                </button>
              )) : <p className="px-4 py-3 text-sm text-text-muted">No matching company found. Try a ticker such as TCS or RELIANCE.</p>}
            </div>
          )}
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
