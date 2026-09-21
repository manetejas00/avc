import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, TrendingUp, TrendingDown, Filter, X, ChevronDown, ChevronUp, Info, Star } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin();

interface Quote {
  symbol: string;
  shortName: string;
  exchange: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  marketCap: number;
  regularMarketVolume: number;
  trailingPE: number;
  priceToBook: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  regularMarketDayLow: number;
  regularMarketDayHigh: number;
  averageDailyVolume3Month: number;
  epsTrailingTwelveMonths: number;
}

const ScreenerPage = () => {
  const [stocks, setStocks] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [indices, setIndices] = useState<any[]>([]);
  
  const [selectedStock, setSelectedStock] = useState<Quote | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    exchange: 'ALL',
    marketCap: 'ALL',
    performance: 'ALL'
  });
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Quote; direction: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const mainRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('avc_watchlist');
    if (saved) setWatchlist(JSON.parse(saved));
    
    fetchDashboardIndices();
    fetchScreenerStocks();
  }, []);
  
  const fetchDashboardIndices = async () => {
    try {
      const res = await fetch('/api/market/dashboard');
      if (res.ok) {
        const data = await res.json();
        setIndices(data.filter((i: any) => ['^NSEI', '^BSESN'].includes(i.symbol)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchScreenerStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market/screener/stocks');
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || contentType.indexOf('application/json') === -1) {
        throw new Error('Market data is temporarily unavailable. (Check if backend server is restarted)');
      }
      const data = await res.json();
      setStocks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load market data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };
  
  const selectSearchResult = async (symbol: string) => {
    setSearchQuery('');
    setSearchResults([]);
    setLoading(true);
    try {
      const res = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(symbol)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSelectedStock(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = (symbol: string) => {
    const updated = watchlist.includes(symbol)
      ? watchlist.filter(s => s !== symbol)
      : [...watchlist, symbol];
    setWatchlist(updated);
    localStorage.setItem('avc_watchlist', JSON.stringify(updated));
  };
  
  const handleSort = (key: keyof Quote) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const formatNumber = (num: number, suffix = '') => {
    if (num === null || num === undefined) return '-';
    if (num >= 1e7) return (num / 1e7).toFixed(2) + ' Cr';
    if (num >= 1e5) return (num / 1e5).toFixed(2) + ' L';
    return num.toLocaleString() + suffix;
  };
  
  const formatCurrency = (num: number, cur = '₹') => {
    if (num === null || num === undefined) return '-';
    return `${cur} ${num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
  };
  
  // Filtering Logic
  const filteredStocks = stocks.filter(stock => {
    if (filters.exchange !== 'ALL' && !stock.symbol.includes(filters.exchange)) return false;
    if (filters.marketCap === 'LARGE' && stock.marketCap < 20000 * 1e7) return false;
    if (filters.marketCap === 'MID' && (stock.marketCap > 20000 * 1e7 || stock.marketCap < 5000 * 1e7)) return false;
    if (filters.marketCap === 'SMALL' && stock.marketCap > 5000 * 1e7) return false;
    
    if (filters.performance === 'GAINERS' && stock.regularMarketChangePercent <= 0) return false;
    if (filters.performance === 'LOSERS' && stock.regularMarketChangePercent >= 0) return false;
    
    return true;
  });
  
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key] || 0;
    const bVal = b[sortConfig.key] || 0;
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
  
  const paginatedStocks = sortedStocks.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sortedStocks.length / itemsPerPage);

  // GSAP Animations
  useGSAP(() => {
    gsap.from('.hero-elem', {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2
    });
    gsap.from('.index-card', {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.6
    });
  }, { scope: mainRef });

  return (
    <div className="min-h-screen bg-background font-sans text-text pt-24" ref={mainRef}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-primary/10 via-bg-primary to-bg-primary -z-10" />
        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="hero-elem text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Market <span className="text-gold-primary">Screener</span>
            </h1>
            <p className="hero-elem text-text-muted md:text-lg">
              Discover investment opportunities with powerful filters and real-time market insights.
            </p>
          </div>
          
          {/* Global Search */}
          <div className="hero-elem max-w-2xl mx-auto relative mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search stocks by company name or symbol..."
                className="w-full bg-surface-elevated border border-white/10 rounded-full py-4 pl-12 pr-4 text-text focus:outline-none focus:border-gold-primary transition-all shadow-lg"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                {searchResults.map(res => (
                  <button
                    key={res.symbol}
                    onClick={() => selectSearchResult(res.symbol)}
                    className="w-full text-left px-6 py-4 hover:bg-surface-elevated border-b border-white/5 last:border-0 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <div className="font-semibold">{res.shortName || res.longName}</div>
                      <div className="text-xs text-text-muted">{res.symbol} • {res.exchDisp}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Indices Overview */}
          {indices.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {indices.map(index => {
                const isPositive = index.change >= 0;
                return (
                  <div key={index.symbol} className="index-card card-premium p-4 md:p-6 flex flex-col">
                    <span className="text-sm text-text-muted font-medium mb-1">{index.name}</span>
                    <span className="text-xl md:text-2xl font-bold mb-2">{formatCurrency(index.price, '')}</span>
                    <div className={`flex items-center text-sm font-semibold ${isPositive ? 'text-green-primary' : 'text-red-500'}`}>
                      {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                      {isPositive ? '+' : ''}{index.changePercent?.toFixed(2)}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Screener Section */}
      <section className="pb-24">
        <div className="container-custom flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 bg-surface-elevated px-4 py-2 rounded-lg border border-white/10"
            >
              <Filter size={18} /> Filters {isFilterOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* Filters Sidebar */}
          <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
            <div className="bg-surface border border-white/5 rounded-2xl p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2"><Filter size={18} /> Filters</h3>
                <button 
                  onClick={() => setFilters({ exchange: 'ALL', marketCap: 'ALL', performance: 'ALL' })}
                  className="text-xs text-gold-secondary hover:underline"
                >
                  Reset
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-text-muted mb-3">Exchange</h4>
                  <div className="flex flex-wrap gap-2">
                    {['ALL', 'NS', 'BO'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => setFilters({...filters, exchange: ex})}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${filters.exchange === ex ? 'bg-gold-primary/20 border-gold-primary text-gold-secondary' : 'border-white/10 text-text-muted hover:border-white/30'}`}
                      >
                        {ex === 'NS' ? 'NSE' : ex === 'BO' ? 'BSE' : 'All'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-text-muted mb-3">Market Cap</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'ALL', label: 'All Caps' },
                      { val: 'LARGE', label: 'Large Cap (> 20K Cr)' },
                      { val: 'MID', label: 'Mid Cap (5K - 20K Cr)' },
                      { val: 'SMALL', label: 'Small Cap (< 5K Cr)' }
                    ].map(mc => (
                      <label key={mc.val} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.marketCap === mc.val ? 'bg-gold-primary border-gold-primary' : 'border-white/20 group-hover:border-gold-primary/50'}`}>
                          {filters.marketCap === mc.val && <div className="w-2 h-2 bg-background rounded-sm" />}
                        </div>
                        <span className={`text-sm ${filters.marketCap === mc.val ? 'text-white' : 'text-text-muted'}`}>{mc.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-muted mb-3">Performance</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'ALL', label: 'All' },
                      { val: 'GAINERS', label: 'Top Gainers' },
                      { val: 'LOSERS', label: 'Top Losers' }
                    ].map(pf => (
                      <label key={pf.val} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.performance === pf.val ? 'bg-gold-primary border-gold-primary' : 'border-white/20 group-hover:border-gold-primary/50'}`}>
                          {filters.performance === pf.val && <div className="w-2 h-2 bg-background rounded-sm" />}
                        </div>
                        <span className={`text-sm ${filters.performance === pf.val ? 'text-white' : 'text-text-muted'}`}>{pf.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="flex-1">
            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center text-text-muted">
                  <div className="w-8 h-8 border-4 border-gold-primary border-t-transparent rounded-full animate-spin mb-4" />
                  Loading market data...
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <div className="text-red-400 mb-2">⚠️ {error}</div>
                  <button onClick={fetchScreenerStocks} className="text-gold-secondary text-sm hover:underline">Try Again</button>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-surface-elevated border-b border-white/10">
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Company</th>
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('regularMarketPrice')}>
                            Price {sortConfig?.key === 'regularMarketPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('regularMarketChangePercent')}>
                            Change % {sortConfig?.key === 'regularMarketChangePercent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('marketCap')}>
                            Market Cap {sortConfig?.key === 'marketCap' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                          </th>
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">P/E</th>
                          <th className="p-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStocks.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-text-muted">No stocks match your filters.</td>
                          </tr>
                        ) : (
                          paginatedStocks.map(stock => {
                            const isPositive = stock.regularMarketChange >= 0;
                            const isWatchlisted = watchlist.includes(stock.symbol);
                            return (
                              <tr key={stock.symbol} className="border-b border-white/5 hover:bg-surface-elevated/50 transition-colors group">
                                <td className="p-4">
                                  <button onClick={() => setSelectedStock(stock)} className="text-left focus:outline-none">
                                    <div className="font-semibold text-white group-hover:text-gold-secondary transition-colors">{stock.shortName || stock.symbol}</div>
                                    <div className="text-xs text-text-muted">{stock.symbol}</div>
                                  </button>
                                </td>
                                <td className="p-4 font-medium">{formatCurrency(stock.regularMarketPrice, stock.currency === 'INR' ? '₹' : '')}</td>
                                <td className="p-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${isPositive ? 'bg-green-primary/10 text-green-primary' : 'bg-red-500/10 text-red-500'}`}>
                                    {isPositive ? '↑' : '↓'} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
                                  </span>
                                </td>
                                <td className="p-4 text-sm text-gray-300">{formatNumber(stock.marketCap)}</td>
                                <td className="p-4 text-sm text-gray-300">{stock.trailingPE ? stock.trailingPE.toFixed(2) : '-'}</td>
                                <td className="p-4">
                                  <button 
                                    onClick={() => toggleWatchlist(stock.symbol)}
                                    className={`p-2 rounded-lg transition-colors ${isWatchlisted ? 'text-gold-primary bg-gold-primary/10' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                                    title="Watchlist"
                                  >
                                    <Star size={18} fill={isWatchlisted ? 'currentColor' : 'none'} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col">
                    {paginatedStocks.length === 0 ? (
                      <div className="p-8 text-center text-text-muted">No stocks match your filters.</div>
                    ) : (
                      paginatedStocks.map(stock => {
                        const isPositive = stock.regularMarketChange >= 0;
                        const isWatchlisted = watchlist.includes(stock.symbol);
                        return (
                          <div key={stock.symbol} className="p-4 border-b border-white/5 last:border-0 hover:bg-surface-elevated/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <button onClick={() => setSelectedStock(stock)} className="text-left focus:outline-none">
                                <div className="font-semibold text-white">{stock.shortName || stock.symbol}</div>
                                <div className="text-xs text-text-muted">{stock.symbol}</div>
                              </button>
                              <button 
                                onClick={() => toggleWatchlist(stock.symbol)}
                                className={`p-1.5 rounded-lg transition-colors ${isWatchlisted ? 'text-gold-primary bg-gold-primary/10' : 'text-text-muted'}`}
                              >
                                <Star size={16} fill={isWatchlisted ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="font-medium text-lg">{formatCurrency(stock.regularMarketPrice, stock.currency === 'INR' ? '₹' : '')}</div>
                                <div className={`text-xs font-bold ${isPositive ? 'text-green-primary' : 'text-red-500'}`}>
                                  {isPositive ? '↑' : '↓'} {Math.abs(stock.regularMarketChangePercent).toFixed(2)}%
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-text-muted mb-0.5">MCap: {formatNumber(stock.marketCap)}</div>
                                <div className="text-xs text-text-muted">P/E: {stock.trailingPE ? stock.trailingPE.toFixed(2) : '-'}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between">
                      <div className="text-sm text-text-muted">
                        Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, filteredStocks.length)} of {filteredStocks.length}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={page === 1}
                          onClick={() => setPage(p => p - 1)}
                          className="px-3 py-1 bg-surface-elevated rounded border border-white/10 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <button 
                          disabled={page === totalPages}
                          onClick={() => setPage(p => p + 1)}
                          className="px-3 py-1 bg-surface-elevated rounded border border-white/10 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stock Details Modal */}
      {selectedStock && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedStock(null)} />
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setSelectedStock(null)}
              className="absolute top-4 right-4 p-2 bg-surface-elevated rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{selectedStock.shortName || selectedStock.symbol}</h2>
                  <div className="text-text-muted font-mono">{selectedStock.symbol} • {selectedStock.exchange}</div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl font-bold text-white mb-1">
                    {formatCurrency(selectedStock.regularMarketPrice, selectedStock.currency === 'INR' ? '₹' : '')}
                  </div>
                  <div className={`flex items-center text-sm font-bold ${selectedStock.regularMarketChange >= 0 ? 'text-green-primary' : 'text-red-500'}`}>
                    {selectedStock.regularMarketChange >= 0 ? '+' : ''}{selectedStock.regularMarketChange?.toFixed(2)} 
                    ({selectedStock.regularMarketChangePercent?.toFixed(2)}%)
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-sm text-text-muted mb-1">Previous Close</div>
                  <div className="font-semibold">{formatCurrency(selectedStock.regularMarketPreviousClose, '')}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Open</div>
                  <div className="font-semibold">{formatCurrency(selectedStock.regularMarketOpen, '')}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Day's Range</div>
                  <div className="font-semibold">{selectedStock.regularMarketDayLow} - {selectedStock.regularMarketDayHigh}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">52W Range</div>
                  <div className="font-semibold">{selectedStock.fiftyTwoWeekLow} - {selectedStock.fiftyTwoWeekHigh}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Volume</div>
                  <div className="font-semibold">{formatNumber(selectedStock.regularMarketVolume)}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Avg Vol (3m)</div>
                  <div className="font-semibold">{formatNumber(selectedStock.averageDailyVolume3Month)}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Market Cap</div>
                  <div className="font-semibold">{formatNumber(selectedStock.marketCap)}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">P/E Ratio (TTM)</div>
                  <div className="font-semibold">{selectedStock.trailingPE?.toFixed(2) || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">EPS (TTM)</div>
                  <div className="font-semibold">{selectedStock.epsTrailingTwelveMonths?.toFixed(2) || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Dividend Yield</div>
                  <div className="font-semibold">{selectedStock.dividendYield ? (selectedStock.dividendYield * 100).toFixed(2) + '%' : '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-text-muted mb-1">Price to Book</div>
                  <div className="font-semibold">{selectedStock.priceToBook?.toFixed(2) || '-'}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-surface-elevated p-4 rounded-xl">
                <div className="flex items-center text-sm text-text-muted">
                  <Info size={16} className="mr-2" /> Data may be delayed.
                </div>
                <button 
                  onClick={() => toggleWatchlist(selectedStock.symbol)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${watchlist.includes(selectedStock.symbol) ? 'bg-white/10 text-white' : 'bg-gold-primary text-bg-primary hover:bg-gold-secondary'}`}
                >
                  {watchlist.includes(selectedStock.symbol) ? (
                    <><Star size={16} fill="currentColor" /> Watchlisted</>
                  ) : (
                    <><Star size={16} /> Add to Watchlist</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Disclaimer */}
      <div className="border-t border-white/5 py-8 bg-surface text-center px-4">
        <p className="text-xs text-text-muted max-w-4xl mx-auto">
          Market data is provided for informational purposes only and may be delayed depending on the data provider. This information does not constitute investment advice. Verify information independently before making investment decisions. <br/>
          Data provided by Yahoo Finance.
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default ScreenerPage;
