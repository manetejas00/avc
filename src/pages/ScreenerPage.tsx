import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Search } from 'lucide-react';
import { CompanyDetailsContent } from './CompanyDetailsPage';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';

type Company = { ticker: string; name: string; exchange: 'NSE' | 'BSE' };
const fallbackCompanies: Company[] = [
  ['RELIANCE', 'Reliance Industries Limited'], ['TCS', 'Tata Consultancy Services Limited'], ['TATASTEEL', 'Tata Steel Limited'], ['TATAMOTORS', 'Tata Motors Limited'], ['TATAPOWER', 'Tata Power Company Limited'], ['TITAN', 'Titan Company Limited'], ['HDFCBANK', 'HDFC Bank Limited'], ['ICICIBANK', 'ICICI Bank Limited'], ['SBIN', 'State Bank of India'], ['BHARTIARTL', 'Bharti Airtel Limited'], ['INFY', 'Infosys Limited'], ['HCLTECH', 'HCL Technologies Limited'], ['ITC', 'ITC Limited'], ['SUNPHARMA', 'Sun Pharmaceutical Industries Limited'], ['BAJFINANCE', 'Bajaj Finance Limited'], ['ADANIENT', 'Adani Enterprises Limited']
].map(([ticker, name]) => ({ ticker, name, exchange: 'BSE' as const }));

export default function ScreenerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyReference = searchParams.get('company');
  const requestedSearch = searchParams.get('search') ?? '';
  const [selectedExchange, companyTicker] = companyReference?.match(/^(NSE|BSE):(.+)$/i) ? [companyReference.slice(0, 3).toUpperCase() as 'NSE' | 'BSE', companyReference.slice(4)] : ['BSE' as const, companyReference];
  const pageRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(requestedSearch);
  const [showSuggestions, setShowSuggestions] = useState(Boolean(requestedSearch));
  const [companies, setCompanies] = useState<Company[]>(fallbackCompanies);
  const [directoryLoading, setDirectoryLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [companyReference, requestedSearch]);

  useGSAP(() => {
    const scope = pageRef.current;
    if (!scope) return;
    gsap.timeline().fromTo('.screener-premium__eyebrow, .screener-premium__title, .screener-premium__copy', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .09, duration: .75, ease: 'power3.out' })
      .fromTo('.screener-premium__search, .screener-premium__metrics > div, .screener-premium__workspace', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .08, duration: .76, ease: 'power3.out' }, '-=.35');
  }, { scope: pageRef });

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('https://scanner.tradingview.com/india/scan', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ filter: [{ left: 'type', operation: 'equal', right: 'stock' }, { left: 'exchange', operation: 'in_range', right: ['BSE'] }], options: { lang: 'en' }, symbols: { query: { types: [] }, tickers: [] }, columns: ['name', 'description', 'exchange'], sort: { sortBy: 'name', sortOrder: 'asc' }, range: [0, 10000] }) });
        if (!response.ok) throw new Error('Company directory unavailable');
        const result = await response.json() as { data?: Array<{ s?: string; d?: unknown[] }> };
        const listed = (result.data ?? []).map(row => { const [ticker, name, exchange] = row.d ?? []; const resolved = exchange === 'NSE' || exchange === 'BSE' ? exchange : row.s?.split(':')[0]; return typeof ticker === 'string' && typeof name === 'string' && (resolved === 'NSE' || resolved === 'BSE') ? { ticker, name, exchange: resolved } : null; }).filter((company): company is Company => company !== null);
        if (listed.length) setCompanies(listed);
      } catch { /* The supplied fallback directory remains searchable. */ }
      finally { if (!controller.signal.aborted) setDirectoryLoading(false); }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => { if (requestedSearch) { setQuery(requestedSearch); setShowSuggestions(true); } }, [requestedSearch]);

  useEffect(() => {
    const container = widgetRef.current;
    if (!container) return;
    container.replaceChildren();
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.text = JSON.stringify({ width: '100%', height: 720, defaultColumn: 'overview', screener_type: 'stock', displayCurrency: 'INR', colorTheme: 'dark', locale: 'in', isTransparent: true, market: 'india', showToolbar: true });
    container.appendChild(script);
    return () => { container.replaceChildren(); };
  }, []);

  const suggestions = query.trim() ? companies.filter(company => `${company.ticker} ${company.name}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 10) : [];
  const select = (company: Company) => { setQuery(company.name); setShowSuggestions(false); navigate(`/screener?company=${encodeURIComponent(`${company.exchange}:${company.ticker}`)}`); };
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const exact = companies.find(company => company.ticker.toLowerCase() === query.trim().toLowerCase() || company.name.toLowerCase() === query.trim().toLowerCase()); if (exact) select(exact); else setShowSuggestions(true); };
  if (companyTicker) return <CompanyDetailsContent ticker={companyTicker} exchange={selectedExchange} />;

  return <div ref={pageRef} className="screener-premium">
    <V1Nav />
    <main className="screener-premium__main">
      <header className="screener-premium__hero"><p className="screener-premium__eyebrow">06 — MARKET RESEARCH & EQUITY SCREENER</p><h1 className="screener-premium__title">BSE Market Research & <em>Equity Discovery.</em></h1><p className="screener-premium__copy">Focused equity workspace for BSE-listed companies in India.</p></header>
      <form onSubmit={submit} className="screener-premium__search"><Search size={18} /><label htmlFor="stock-search" className="sr-only">Search BSE listed companies</label><input id="stock-search" value={query} onChange={event => { setQuery(event.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} placeholder="Search a BSE company or ticker (e.g. RELIANCE, TCS)" autoComplete="off" /><button type="submit">Open company <ArrowUpRight size={17} /></button>{showSuggestions && query.trim() && <div className="screener-premium__suggestions">{suggestions.length ? suggestions.map(company => <button key={`${company.exchange}:${company.ticker}`} type="button" onMouseDown={event => event.preventDefault()} onClick={() => select(company)}><span>{company.name}<small>{company.ticker}</small></span><b>{company.exchange}</b></button>) : <p>{directoryLoading ? 'Loading the BSE company directory…' : 'No company found. Try a ticker such as TCS.'}</p>}</div>}</form>
      <div className="screener-premium__metrics"><div><small>UNIVERSE</small><strong>BSE-listed equities</strong></div><div><small>DATA MODE</small><strong>Live market scan</strong></div><div><small>WORKSPACE</small><strong>Filter · compare · investigate</strong></div></div>
      <section className="screener-premium__workspace" aria-label="Live BSE stock screener"><div className="screener-premium__workspace-bar"><span><i /> LIVE DISCOVERY</span><span>India · INR · BSE</span></div><div ref={widgetRef} className="tradingview-widget-container screener-premium__widget" /></section>
      <p className="screener-premium__disclaimer">Live BSE market data is powered by TradingView for educational research. Information presented here does not constitute financial advice or stock recommendations.</p>
    </main>
    <V1Footer />
  </div>;
}
