import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Info } from 'lucide-react';
import Input from './ui/Input';
import Card from './ui/Card';

interface MFScheme {
  schemeCode: number;
  schemeName: string;
}

interface MFDetail {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
  };
  data: {
    date: string;
    nav: string;
  }[];
}

const MutualFundExplorer = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MFScheme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<MFDetail | null>(null);
  const [loadingFund, setLoadingFund] = useState(false);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    if (val.length < 3) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/market/mutual-funds/search?q=${encodeURIComponent(val)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const fetchFundDetail = async (code: number) => {
    setLoadingFund(true);
    setSelectedFund(null);
    try {
      const res = await fetch(`/api/market/mutual-funds/${code}`);
      const data = await res.json();
      setSelectedFund(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFund(false);
    }
  };

  return (
    <section className="py-section-mobile md:py-section bg-background">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Mutual Fund Explorer</h2>
          <p className="text-text-muted max-w-2xl mx-auto">Discover and analyze Indian mutual funds with real-time NAV tracking.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-text-muted" size={20} />
            </div>
            <Input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search for mutual funds (e.g. Axis Bluechip, HDFC...)"
              className="rounded-full py-4 pl-12 pr-12"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {results.length > 0 && !selectedFund && (
            <div className="card-premium mb-8 overflow-hidden">
              <ul className="max-h-96 overflow-y-auto custom-scrollbar">
                {results.map(fund => (
                  <li 
                    key={fund.schemeCode}
                    onClick={() => fetchFundDetail(fund.schemeCode)}
                    className="border-b border-white/5 last:border-0 p-4 hover:bg-surface-elevated cursor-pointer transition-colors flex justify-between items-center"
                  >
                    <span className="font-medium">{fund.schemeName}</span>
                    <TrendingUp size={18} className="text-gold-primary opacity-50" />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loadingFund && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {selectedFund && (
            <Card className="relative p-6 md:p-8">
              <button 
                onClick={() => setSelectedFund(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-text text-sm underline"
              >
                Close
              </button>
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 pr-12">{selectedFund.meta.scheme_name}</h3>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-surface-elevated rounded-full text-text-muted">{selectedFund.meta.fund_house}</span>
                  <span className="px-3 py-1 bg-surface-elevated rounded-full text-text-muted">{selectedFund.meta.scheme_category}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-background rounded-xl p-6 border border-white/5">
                  <div className="text-text-muted text-sm mb-1">Current NAV</div>
                  <div className="text-4xl font-bold text-gold-primary flex items-baseline">
                    <span className="text-lg mr-1 text-gold-primary">₹</span>
                    {selectedFund.data[0]?.nav || 'N/A'}
                  </div>
                  <div className="text-xs text-text-muted mt-2 flex items-center">
                    <Info size={12} className="mr-1" />
                    As of {selectedFund.data[0]?.date}
                  </div>
                </div>
                
                <div className="bg-background rounded-xl p-6 border border-white/5 flex flex-col justify-center">
                  <p className="text-sm text-text-muted">
                    This data is sourced directly from AMFI (Association of Mutual Funds in India) via reliable open APIs.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default MutualFundExplorer;
