import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CompanyDetailsContent } from './CompanyDetailsPage';

type Company = { ticker: string; name: string; exchange: 'NSE' | 'BSE' };

const fallbackCompanies: Company[] = [
  ['RELIANCE', 'Reliance Industries Limited'], ['TCS', 'Tata Consultancy Services Limited'], ['TATASTEEL', 'Tata Steel Limited'],
  ['TATAMOTORS', 'Tata Motors Limited'], ['TATAPOWER', 'Tata Power Company Limited'], ['TATACONSUM', 'Tata Consumer Products Limited'],
  ['TATACAP', 'Tata Capital Limited'], ['TATATECH', 'Tata Technologies Limited'], ['TITAN', 'Titan Company Limited'],
  ['HDFCBANK', 'HDFC Bank Limited'], ['ICICIBANK', 'ICICI Bank Limited'], ['SBIN', 'State Bank of India'],
  ['BHARTIARTL', 'Bharti Airtel Limited'], ['INFY', 'Infosys Limited'], ['HCLTECH', 'HCL Technologies Limited'],
  ['WIPRO', 'Wipro Limited'], ['TECHM', 'Tech Mahindra Limited'], ['LT', 'Larsen & Toubro Limited'],
  ['ITC', 'ITC Limited'], ['HINDUNILVR', 'Hindustan Unilever Limited'], ['MARUTI', 'Maruti Suzuki India Limited'],
  ['SUNPHARMA', 'Sun Pharmaceutical Industries Limited'], ['BAJFINANCE', 'Bajaj Finance Limited'], ['ADANIENT', 'Adani Enterprises Limited'],
  ['ADANIPORTS', 'Adani Ports & Special Economic Zone Limited'], ['AXISBANK', 'Axis Bank Limited'], ['KOTAKBANK', 'Kotak Mahindra Bank Limited']
].map(([ticker, name]) => ({ ticker, name, exchange: 'NSE' as const }));

export default function ScreenerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyTicker = searchParams.get('company');
  const selectedExchange = searchParams.get('exchange') === 'NSE' ? 'NSE' : 'BSE';
  const widgetRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(fallbackCompanies);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const loadCompanyDirectory = async () => {
      try {
        const response = await fetch('https://scanner.tradingview.com/india/scan', {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({
            filter: [
              { left: 'type', operation: 'equal', right: 'stock' },
              { left: 'exchange', operation: 'in_range', right: ['NSE', 'BSE'] }
            ],
            options: { lang: 'en' },
            symbols: { query: { types: [] }, tickers: [] },
            columns: ['name', 'description', 'exchange'],
            sort: { sortBy: 'name', sortOrder: 'asc' },
            range: [0, 6000]
          })
        });
        if (!response.ok) throw new Error('Company directory unavailable');
        const result = await response.json() as { data?: Array<{ s?: string; d?: unknown[] }> };
        const listedCompanies = (result.data ?? []).map((row) => {
          const [ticker, name, exchange] = row.d ?? [];
          const resolvedExchange = exchange === 'NSE' || exchange === 'BSE' ? exchange : row.s?.split(':')[0];
          return typeof ticker === 'string' && typeof name === 'string' && (resolvedExchange === 'NSE' || resolvedExchange === 'BSE')
            ? { ticker, name, exchange: resolvedExchange }
            : null;
        }).filter((company): company is Company => company !== null);
        if (listedCompanies.length) setCompanies(listedCompanies);
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Could not load the full NSE/BSE directory.', error);
      } finally {
        if (!controller.signal.aborted) setDirectoryLoading(false);
      }
    };

    loadCompanyDirectory();
    return () => controller.abort();
  }, []);

  const searchStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    const match = companies.find((company) => company.ticker.toLowerCase() === term.toLowerCase() || company.name.toLowerCase() === term.toLowerCase());
    if (match) navigate(`/screener?company=${encodeURIComponent(match.ticker)}&exchange=${match.exchange}`);
    else setShowSuggestions(true);
  };

  const suggestions = query.trim().length < 1 ? [] : companies.filter((company) => `${company.ticker} ${company.name}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 12);

  const selectCompany = (company: Company) => {
    setQuery(company.name);
    setShowSuggestions(false);
    navigate(`/screener?company=${encodeURIComponent(company.ticker)}&exchange=${company.exchange}`);
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

  if (companyTicker) return <CompanyDetailsContent ticker={companyTicker} exchange={selectedExchange} />;

  return (
    <div className="min-h-screen bg-background pt-24 font-sans text-text">
      <Navbar />
      <main className="container-custom py-10 md:py-16">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow mb-4">Live market intelligence</p>
          <h1 className="text-4xl font-bold md:text-6xl">Market <span className="text-gold-primary">Screener</span></h1>
          <p className="mt-5 text-text-muted md:text-lg">Explore NSE and BSE listed Indian stocks, sort results, and apply filters directly in the screener.</p>
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
              {suggestions.length > 0 ? suggestions.map((company) => (
                <button key={`${company.exchange}:${company.ticker}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectCompany(company)} className="flex w-full items-center justify-between gap-4 border-b border-white/5 px-4 py-3 transition hover:bg-white/5 last:border-0">
                  <span className="min-w-0 truncate text-sm font-medium text-text">{company.name}</span><span className="shrink-0 text-xs font-semibold text-gold-primary">{company.ticker} · {company.exchange}</span>
                </button>
              )) : <p className="px-4 py-3 text-sm text-text-muted">{directoryLoading ? 'Loading the NSE and BSE company directory…' : 'No NSE or BSE company found. Try a ticker such as TCS or RELIANCE.'}</p>}
            </div>
          )}
        </form>
        <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between gap-3 text-xs text-text-muted">
          <span>Indian stock universe</span>
          <span className="rounded-full border border-gold-primary/40 bg-gold-primary/10 px-3 py-1 font-semibold text-gold-primary">NSE &amp; BSE listed stocks only</span>
        </div>
        <section className="overflow-hidden rounded-card border border-white/10 bg-surface p-2 shadow-xl md:p-4" aria-label="Live NSE and BSE stock screener">
          <div ref={widgetRef} className="tradingview-widget-container min-h-[720px]" />
        </section>
        <p className="mx-auto mt-5 max-w-4xl text-center text-xs leading-5 text-text-muted">The screener is set to the India market (NSE and BSE listings). Live data is supplied by TradingView and may be delayed. It is for informational purposes only and is not investment advice.</p>
      </main>
      <Footer />
    </div>
  );
}
