import React, { useEffect, useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  lastUpdated: string;
}

const MarketDashboard = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/market/dashboard');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setMarketData(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useGSAP(() => {
    if (loading || error) return;
    
    gsap.from('.market-card', {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out'
    });
  }, { dependencies: [loading, error, marketData], scope: containerRef });

  if (error) {
    return (
      <section className="py-section-mobile md:py-section bg-background">
        <div className="container-custom text-center">
          <p className="text-text-muted">Market data temporarily unavailable. Showing the latest available data.</p>
        </div>
      </section>
    );
  }

  const indianMarkets = marketData.filter(d => d.symbol === '^NSEI' || d.symbol === '^BSESN');
  const globalMarkets = marketData.filter(d => d.symbol === '^GSPC' || d.symbol === '^IXIC');
  const commoditiesForex = marketData.filter(d => ['INR=X', 'GC=F', 'CL=F'].includes(d.symbol));

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2
    }).format(price);
  };

  const renderCard = (data: MarketData) => {
    const isPositive = data.change >= 0;
    const nameMap: Record<string, string> = {
      '^NSEI': 'NIFTY 50',
      '^BSESN': 'SENSEX',
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      'INR=X': 'USD/INR',
      'GC=F': 'Gold',
      'CL=F': 'Crude Oil'
    };
    const displayName = nameMap[data.symbol] || data.name;

    return (
      <div key={data.symbol} className="market-card bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors group">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-text">{displayName}</h3>
          <span className={`flex items-center text-sm font-medium ${isPositive ? 'text-green' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
            {Math.abs(data.changePercent).toFixed(2)}%
          </span>
        </div>
        <div>
          <div className="text-2xl font-bold mb-1">
            {formatPrice(data.price, data.currency)}
          </div>
          <div className={`text-sm ${isPositive ? 'text-green' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{data.change.toFixed(2)}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center">
            <Clock size={12} className="mr-1" />
            {new Date(data.lastUpdated).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
            {data.marketState === 'REGULAR' ? 'Live (Delayed)' : 'Closed'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section ref={containerRef} className="py-section-mobile md:py-section bg-background overflow-hidden">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Live Market Snapshot</h2>
          <p className="text-text-muted max-w-2xl mx-auto">Get real-time insights into Indian and global markets, currencies, and commodities.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center"><span className="w-2 h-2 rounded-full bg-primary mr-3"></span>Indian Markets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {indianMarkets.map(renderCard)}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>Global Markets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {globalMarkets.map(renderCard)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6 flex items-center"><span className="w-2 h-2 rounded-full bg-gold mr-3"></span>Commodities & Forex</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {commoditiesForex.map(renderCard)}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MarketDashboard;
