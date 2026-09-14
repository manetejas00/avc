import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Search, TrendingUp, AlertCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Scheme {
  schemeCode: number;
  schemeName: string;
}

interface NavData {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: Array<{
    date: string;
    nav: string;
  }>;
}

const MutualFundNav = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNav, setSelectedNav] = useState<NavData | null>(null);
  const [error, setError] = useState('');

  useGSAP(() => {
    gsap.from('.nav-tool', {
      y: 50, opacity: 0, duration: 0.8, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' }
    });
  }, { scope: sectionRef });

  const searchFunds = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSelectedNav(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_MFAPI_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.slice(0, 10)); // Limit to 10 results
    } catch (err) {
      setError('Failed to fetch mutual funds. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getLatestNav = async (schemeCode: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_MFAPI_BASE_URL}/${schemeCode}/latest`);
      const data = await res.json();
      setSelectedNav(data);
    } catch (err) {
      setError('Failed to fetch NAV details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={sectionRef} id="markets" className="py-24 bg-surface border-t border-border/50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Live Mutual Fund NAV Tracker</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Search for any Indian mutual fund scheme to get the latest Net Asset Value (NAV) instantly.
          </p>
        </div>

        <div className="nav-tool max-w-3xl mx-auto bg-background rounded-card border border-border p-8 shadow-xl">
          <div className="flex gap-4 mb-8">
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchFunds()}
                placeholder="Search by scheme name (e.g., HDFC, SBI)..."
                className="w-full bg-surface border border-border rounded-full px-6 py-4 outline-none focus:border-primary transition-colors text-text placeholder:text-text-muted/50"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            </div>
            <button 
              onClick={searchFunds}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-6 bg-red-500/10 p-4 rounded-lg">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          {selectedNav ? (
            <div className="bg-surface rounded-2xl p-6 border border-border relative overflow-hidden">
              <div className="absolute -right-10 -top-10 text-primary/10">
                <TrendingUp size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-semibold text-primary mb-1 uppercase tracking-wider">{selectedNav.meta.fund_house}</h3>
                <h4 className="text-xl font-medium text-text mb-6 pr-12">{selectedNav.meta.scheme_name}</h4>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-text-muted text-sm mb-1">Latest NAV ({selectedNav.data[0]?.date})</p>
                    <p className="text-4xl font-bold text-text">₹{selectedNav.data[0]?.nav}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNav(null)}
                  className="mt-8 text-sm font-medium text-text-muted hover:text-primary transition-colors"
                >
                  &larr; Back to results
                </button>
              </div>
            </div>
          ) : (
            results.length > 0 && (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {results.map((scheme) => (
                  <button
                    key={scheme.schemeCode}
                    onClick={() => getLatestNav(scheme.schemeCode)}
                    className="w-full text-left bg-surface hover:bg-surface-ii border border-border hover:border-primary/30 rounded-xl p-4 transition-all group flex justify-between items-center"
                  >
                    <span className="text-text font-medium group-hover:text-primary transition-colors line-clamp-1 pr-4">{scheme.schemeName}</span>
                    <TrendingUp size={18} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default MutualFundNav;
