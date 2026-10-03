import { FormEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, ScanSearch, Sparkles } from 'lucide-react';

export default function ScreenerGateway() {
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const openSearch = (event?: FormEvent) => {
    if (event) event.preventDefault();
    const url = `/screener${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`;
    navigate(url);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
        <form className="screener-gateway__query" onSubmit={openSearch}>
          <ScanSearch size={19} />
          <label className="sr-only" htmlFor="gateway-screener-search">Search India’s listed universe</label>
          <input 
            id="gateway-screener-search" 
            value={query} 
            onChange={event => setQuery(event.target.value)} 
            placeholder="Search India’s listed universe (e.g. RELIANCE, TCS)" 
          />
          <button type="submit" aria-label="Open market screener">⌘ K</button>
        </form>
        <div className="screener-gateway__rows">
          <button 
            type="button" 
            onClick={() => { navigate('/screener?search=Reliance'); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Market capitalisation</b><em>Any</em>
          </button>
          <button 
            type="button" 
            onClick={() => { navigate('/screener?search=TCS'); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Price performance</b><em>1Y</em>
          </button>
          <button 
            type="button" 
            onClick={() => { navigate('/screener?search=Tata'); window.scrollTo({ top: 0, behavior: 'instant' }); }} 
            className="screener-gateway__row-btn"
          >
            <i /><b>Return on equity</b><em>≥ 15%</em>
          </button>
        </div>
        <div className="screener-gateway__scan" />
      </div>
    </section>
  );
}

