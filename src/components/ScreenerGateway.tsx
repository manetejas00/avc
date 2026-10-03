import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ScanSearch, Sparkles } from 'lucide-react';
import { Company, fallbackCompanies, fetchCompanyDirectory } from '../data/companyDirectory';

export default function ScreenerGateway() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(fallbackCompanies);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const directory = await fetchCompanyDirectory(controller.signal);
      if (!controller.signal.aborted) setCompanies(directory);
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const suggestions = query.trim()
    ? companies.filter(c => `${c.ticker} ${c.name}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  const selectCompany = (company: Company) => {
    setQuery(company.name);
    setShowSuggestions(false);
    navigate(`/screener?company=${encodeURIComponent(`${company.exchange}:${company.ticker}`)}`);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const openSearch = (event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!query.trim()) {
      navigate('/screener');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    const exact = companies.find(
      c => c.ticker.toLowerCase() === query.trim().toLowerCase() || c.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (exact) {
      selectCompany(exact);
    } else if (suggestions.length > 0) {
      selectCompany(suggestions[0]);
    } else {
      navigate(`/screener?search=${encodeURIComponent(query.trim())}`);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return;
    gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 76%', once: true } })
      .fromTo('.screener-gateway__copy > *, .screener-gateway__panel', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .1, duration: .8, ease: 'power3.out' })
      .fromTo('.screener-gateway__scan', { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, '-=.45');
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="screener-gateway" id="screener">
      <div className="screener-gateway__copy">
        <p className="v1-index">06 — PREMIUM MARKET SCREENER</p>
        <h2>See what the<br /><em>market is hiding.</em></h2>
        <p>Move from headline-level information to a focused workspace for filtering, comparing, and investigating BSE-listed companies.</p>
        <Link 
          to="/screener" 
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} 
          className="screener-gateway__cta"
        >
          Enter the screener <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="screener-gateway__panel">
        <div className="screener-gateway__panel-top">
          <span><i /> LIVE DISCOVERY</span>
          <Sparkles size={16} />
        </div>
        <form ref={containerRef} className="screener-gateway__query" onSubmit={openSearch} autoComplete="off">
          <ScanSearch size={19} />
          <label className="sr-only" htmlFor="gateway-screener-search">Search India’s listed universe</label>
          <input 
            id="gateway-screener-search" 
            value={query} 
            onChange={event => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }} 
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search India’s listed universe (e.g. RELIANCE, TCS)" 
            autoComplete="off"
          />
          <button type="submit" aria-label="Open company screener details">⌘ K</button>

          {showSuggestions && query.trim() && (
            <div className="screener-gateway__suggestions" role="listbox">
              {suggestions.length ? (
                suggestions.map(company => (
                  <button
                    key={`${company.exchange}:${company.ticker}`}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => selectCompany(company)}
                  >
                    <span>
                      {company.name}
                      <small>{company.ticker}</small>
                    </span>
                    <b>{company.exchange}</b>
                  </button>
                ))
              ) : (
                <div style={{ padding: '14px 16px', color: '#aaa', fontSize: '12px' }}>
                  No company found. Try TCS or Reliance.
                </div>
              )}
            </div>
          )}
        </form>
        <div className="screener-gateway__rows">
          <button 
            type="button" 
            onClick={() => {
              const rel = companies.find(c => c.ticker === 'RELIANCE') || { ticker: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'BSE' as const };
              selectCompany(rel);
            }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Market capitalisation</b><em>Reliance · BSE</em>
          </button>
          <button 
            type="button" 
            onClick={() => {
              const tcs = companies.find(c => c.ticker === 'TCS') || { ticker: 'TCS', name: 'Tata Consultancy Services Limited', exchange: 'BSE' as const };
              selectCompany(tcs);
            }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Price performance</b><em>TCS · BSE</em>
          </button>
          <button 
            type="button" 
            onClick={() => {
              const tata = companies.find(c => c.ticker === 'TATASTEEL') || { ticker: 'TATASTEEL', name: 'Tata Steel Limited', exchange: 'BSE' as const };
              selectCompany(tata);
            }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Return on equity</b><em>Tata Steel · BSE</em>
          </button>
        </div>
        <div className="screener-gateway__scan" />
      </div>
    </section>
  );
}
