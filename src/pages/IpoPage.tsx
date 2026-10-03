import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  HelpCircle,
  Info,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';
import RegulatoryDisclaimer from '../components/RegulatoryDisclaimer';
import { fetchIpoList, fetchIpoStats, IPO, IPOStats } from '../services/ipoService';

type TabType = 'upcoming' | 'open' | 'closed' | 'listed_7days' | 'all';

export default function IpoPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = (searchParams.get('tab') as TabType) || 'open';
  
  const [activeTab, setActiveTab] = useState<TabType>(activeTabParam);
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'mainboard' | 'sme'>('all');
  const [exchangeFilter, setExchangeFilter] = useState<'all' | 'nse' | 'bse'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [stats, setStats] = useState<IPOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const pageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync state with URL params
  useEffect(() => {
    if (activeTabParam !== activeTab) {
      setActiveTab(activeTabParam);
    }
  }, [activeTabParam]);

  const handleTabChange = (newTab: TabType) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Fetch IPO Data from backend service
  const loadData = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [listData, statsData] = await Promise.all([
        fetchIpoList({
          tab: activeTab,
          segment: segmentFilter,
          exchange: exchangeFilter,
          search: searchQuery
        }, signal),
        fetchIpoStats(signal)
      ]);

      if (!signal?.aborted) {
        setIpos(listData);
        setStats(statsData);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        console.error('Failed to load IPOs:', err);
        setError('Unable to fetch live IPO data right now. Please verify your connection or click retry.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [activeTab, segmentFilter, exchangeFilter, searchQuery]);

  // Update dynamic SEO Metadata
  useEffect(() => {
    let title = 'Live IPO Tracker in India – Upcoming, Open & Listed IPOs | AVC Dhanam';
    if (activeTab === 'upcoming') title = 'Upcoming IPOs in India – Expected Dates, Price Bands & Prospectus | AVC Dhanam';
    else if (activeTab === 'open') title = 'Current Open IPOs – Live Bidding & Subscription Status | AVC Dhanam';
    else if (activeTab === 'closed') title = 'Recently Closed IPOs – Allotment & Listing Track | AVC Dhanam';
    else if (activeTab === 'listed_7days') title = 'Recently Listed IPOs in India (Last 7 Days) – Listing Gains & CMP | AVC Dhanam';

    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Track live Mainboard and SME IPOs in India. Real-time updates on upcoming IPOs, open subscriptions, recently closed issues, listing gains, and detailed DRHP documents.');
    }
  }, [activeTab]);

  // GSAP Animations
  useGSAP(() => {
    const scope = pageRef.current;
    if (!scope) return;
    gsap.timeline().fromTo(
      '.ipo-hero__badge, .ipo-hero__title, .ipo-hero__subtitle',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out' }
    ).fromTo(
      '.ipo-stat-card',
      { y: 25, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.06, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    );
  }, { scope: pageRef });

  useGSAP(() => {
    if (!listRef.current || loading) return;
    gsap.fromTo(
      '.ipo-card-item',
      { y: 15, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out' }
    );
  }, [ipos, loading]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-background font-sans text-text">
      <V1Nav />

      {/* Main Page Container */}
      <main className="container-custom pt-24 pb-20 sm:pt-28">
        
        {/* SEO Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/" className="transition-colors hover:text-gold-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-text-secondary font-medium">IPOs</span>
        </nav>

        {/* Hero Section */}
        <header className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-surface-elevated/80 to-surface/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold-primary/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-3xl">
            <div className="ipo-hero__badge inline-flex items-center gap-2 rounded-full border border-gold-primary/30 bg-gold-primary/10 px-3.5 py-1 text-xs font-semibold text-gold-secondary mb-4">
              <Sparkles size={14} /> Live Indian IPO Dashboard
            </div>
            
            <h1 className="ipo-hero__title text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight">
              India <span className="gradient-gold-text">IPO Center</span> & Analytics
            </h1>
            
            <p className="ipo-hero__subtitle mt-3 text-sm text-text-secondary sm:text-base leading-relaxed">
              Real-time tracking for Indian Mainboard & SME Initial Public Offerings. Inspect upcoming bidding dates, price bands, minimum investments, live subscription figures, and listing performance.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <button
              onClick={() => handleTabChange('open')}
              className={`ipo-stat-card flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${activeTab === 'open' ? 'border-gold-primary bg-gold-primary/10 shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'border-white/10 bg-surface/60 hover:border-white/20'}`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Open for Bidding</span>
                <Clock size={16} className="text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {stats ? stats.open : '--'}
              </div>
              <span className="mt-1 text-[11px] text-emerald-400 font-medium">Currently Available</span>
            </button>

            <button
              onClick={() => handleTabChange('upcoming')}
              className={`ipo-stat-card flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${activeTab === 'upcoming' ? 'border-gold-primary bg-gold-primary/10 shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'border-white/10 bg-surface/60 hover:border-white/20'}`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Upcoming IPOs</span>
                <Calendar size={16} className="text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {stats ? stats.upcoming : '--'}
              </div>
              <span className="mt-1 text-[11px] text-amber-400 font-medium">Expected Soon</span>
            </button>

            <button
              onClick={() => handleTabChange('closed')}
              className={`ipo-stat-card flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${activeTab === 'closed' ? 'border-gold-primary bg-gold-primary/10 shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'border-white/10 bg-surface/60 hover:border-white/20'}`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Recently Closed</span>
                <Layers size={16} className="text-blue-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {stats ? stats.closed : '--'}
              </div>
              <span className="mt-1 text-[11px] text-blue-400 font-medium">Allotment Awaited</span>
            </button>

            <button
              onClick={() => handleTabChange('listed_7days')}
              className={`ipo-stat-card flex flex-col rounded-2xl border p-4 text-left transition-all duration-200 ${activeTab === 'listed_7days' ? 'border-gold-primary bg-gold-primary/10 shadow-[0_0_20px_rgba(197,160,89,0.15)]' : 'border-white/10 bg-surface/60 hover:border-white/20'}`}
            >
              <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
                <span>Listed (Last 7 Days)</span>
                <TrendingUp size={16} className="text-gold-secondary" />
              </div>
              <div className="mt-2 text-2xl font-bold text-gold-secondary sm:text-3xl">
                {stats ? stats.listed7Days : '--'}
              </div>
              <span className="mt-1 text-[11px] text-gold-primary font-medium">Dynamic 7-Day Window</span>
            </button>
          </div>
        </header>

        {/* Tabs & Controls Section */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            {/* Primary Category Tabs */}
            <div className="flex overflow-x-auto rounded-2xl border border-white/10 bg-surface/80 p-1.5 scrollbar-none shadow-lg">
              <button
                type="button"
                onClick={() => handleTabChange('open')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'open' ? 'bg-gold-primary text-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Open IPOs
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('upcoming')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'upcoming' ? 'bg-gold-primary text-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Upcoming IPOs
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('closed')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'closed' ? 'bg-gold-primary text-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Recently Closed
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('listed_7days')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'listed_7days' ? 'bg-gold-primary text-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                Listed in Last 7 Days
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === 'all' ? 'bg-gold-primary text-black shadow-md' : 'text-text-secondary hover:text-white'}`}
              >
                All Issues
              </button>
            </div>

            {/* Refresh button & Search / Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search company or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface/90 py-2 pl-9 pr-4 text-xs text-white placeholder-text-muted transition-colors focus:border-gold-primary focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                    <XCircle size={14} />
                  </button>
                )}
              </div>

              {/* Segment Filter */}
              <div className="relative">
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value as any)}
                  className="appearance-none rounded-xl border border-white/10 bg-surface/90 py-2 pl-3.5 pr-8 text-xs font-medium text-text-secondary transition-colors focus:border-gold-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Segments</option>
                  <option value="mainboard">Mainboard</option>
                  <option value="sme">SME</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>

              {/* Exchange Filter */}
              <div className="relative">
                <select
                  value={exchangeFilter}
                  onChange={(e) => setExchangeFilter(e.target.value as any)}
                  className="appearance-none rounded-xl border border-white/10 bg-surface/90 py-2 pl-3.5 pr-8 text-xs font-medium text-text-secondary transition-colors focus:border-gold-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Exchanges</option>
                  <option value="nse">NSE</option>
                  <option value="bse">BSE</option>
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={() => loadData()}
                disabled={loading}
                title="Refresh Live Data"
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface/90 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-gold-primary hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-gold-primary' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-text-muted px-1">
            <span>
              Showing {ipos.length} {activeTab === 'listed_7days' ? 'IPOs listed in the last 7 calendar days' : 'IPOs'}
            </span>
            <span>Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </section>

        {/* Error State Banner */}
        {error && (
          <div className="mb-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200 sm:flex-row shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle size={22} className="shrink-0 text-red-400" />
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => loadData()}
              className="rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500/30"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="animate-pulse rounded-2xl border border-white/10 bg-surface/40 p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/10" />
                  <div className="h-5 w-20 rounded-full bg-white/10" />
                </div>
                <div className="mt-4 h-6 w-3/4 rounded-md bg-white/10" />
                <div className="mt-2 h-4 w-1/2 rounded-md bg-white/5" />
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                  <div className="h-8 rounded bg-white/5" />
                  <div className="h-8 rounded bg-white/5" />
                </div>
                <div className="mt-4 h-10 w-full rounded-xl bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && ipos.length === 0 && (
          <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-surface/40 p-12 text-center shadow-xl backdrop-blur-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold-primary/20 bg-gold-primary/10 text-gold-primary mb-4">
              <Info size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">No IPOs Found</h3>
            <p className="mt-2 max-w-md text-xs text-text-secondary leading-relaxed">
              {activeTab === 'listed_7days'
                ? 'No Indian IPOs were listed during the last 7 calendar days. Check back soon or view all historical IPOs.'
                : 'No IPOs match your selected tab or filter criteria. Try resetting filters or searching for another company name.'}
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSegmentFilter('all');
                setExchangeFilter('all');
                setSearchQuery('');
              }}
              className="mt-6 rounded-xl border border-gold-primary/30 bg-gold-primary/10 px-5 py-2.5 text-xs font-semibold text-gold-secondary transition-all hover:bg-gold-primary hover:text-black"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* IPO Cards Grid */}
        {!loading && !error && ipos.length > 0 && (
          <div ref={listRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ipos.map((ipo) => {
              const isListed = ipo.status === 'listed';
              const isOpen = ipo.status === 'open';
              const isUpcoming = ipo.status === 'upcoming';
              const isClosed = ipo.status === 'closed';

              return (
                <div
                  key={ipo.id}
                  className="ipo-card-item group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface/90 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gold-primary/40 hover:shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={ipo.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ipo.name)}&background=1A2234&color=C5A059`}
                          alt={ipo.name}
                          className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-contain p-1 bg-surface-elevated"
                          onError={(e) => {
                            (e.target as HTMLElement).setAttribute('src', `https://ui-avatars.com/api/?name=${encodeURIComponent(ipo.name)}&background=1A2234&color=C5A059`);
                          }}
                        />
                        <div>
                          <h3 className="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-gold-secondary">
                            {ipo.name}
                          </h3>
                          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-text-muted font-medium">
                            <span>{ipo.symbol || 'IPO'}</span>
                            <span>•</span>
                            <span className="text-text-secondary">{ipo.exchanges.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isOpen
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : isUpcoming
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : isClosed
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-gold-primary/15 text-gold-secondary border border-gold-primary/30'
                        }`}
                      >
                        {isOpen && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {ipo.status}
                      </span>
                    </div>

                    {/* Segment & Key Attributes Pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-surface-elevated/70 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                        {ipo.issueType}
                      </span>
                      {ipo.issueSizeCr ? (
                        <span className="rounded-lg border border-white/10 bg-surface-elevated/70 px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                          Issue: ₹{ipo.issueSizeCr} Cr
                        </span>
                      ) : null}
                    </div>

                    {/* Pricing & Lot Details */}
                    <div className="mt-5 rounded-xl border border-white/5 bg-background/60 p-3.5">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-text-muted">Price Band</span>
                          <p className="mt-0.5 font-bold text-white">
                            {ipo.minPrice === ipo.maxPrice
                              ? `₹${ipo.minPrice}`
                              : `₹${ipo.minPrice} - ₹${ipo.maxPrice}`}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-text-muted">Min Investment</span>
                          <p className="mt-0.5 font-bold text-gold-secondary">
                            {formatCurrency(ipo.minInvestment)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-text-muted">Lot Size</span>
                          <p className="mt-0.5 font-semibold text-text">
                            {ipo.lotSize ? `${ipo.lotSize} Shares` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] text-text-muted">Total Subscription</span>
                          <p className="mt-0.5 font-semibold text-emerald-400">
                            {ipo.subscription?.total ? `${ipo.subscription.total}x` : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline dates grid */}
                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-text-muted">Bidding Dates:</span>
                        <span className="font-medium text-white">
                          {formatDate(ipo.openDate)} – {formatDate(ipo.closeDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="text-text-muted">Listing Date:</span>
                        <span className="font-medium text-white">
                          {formatDate(ipo.listingDate)}
                        </span>
                      </div>
                    </div>

                    {/* Listed Gains Performance Box (For Listed IPOs) */}
                    {isListed && ipo.listingGainPercent !== undefined && (
                      <div className="mt-4 rounded-xl border border-gold-primary/20 bg-gold-primary/5 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-muted">Issue → Listing Gain</span>
                          <span className={`font-bold ${ipo.listingGainPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {ipo.listingGainPercent >= 0 ? `+${ipo.listingGainPercent}%` : `${ipo.listingGainPercent}%`}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-text-secondary">
                          <span>Listing: ₹{ipo.listingPrice || 'N/A'}</span>
                          {ipo.currentPrice ? (
                            <span>CMP: <strong className="text-white">₹{ipo.currentPrice}</strong></span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action */}
                  <div className="mt-6 border-t border-white/5 pt-4">
                    <Link
                      to={`/ipo/${ipo.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-primary/30 bg-gold-primary/10 py-2.5 text-xs font-bold text-gold-secondary transition-all duration-200 hover:bg-gold-primary hover:text-black shadow-md"
                    >
                      <span>View Full IPO Profile</span>
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dynamic FAQ Section */}
        <section className="mt-20 border-t border-white/10 pt-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-primary/30 bg-gold-primary/10 px-3 py-1 text-xs font-semibold text-gold-secondary">
                <HelpCircle size={14} /> Knowledge Hub
              </span>
              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                Frequently Asked Questions about Indian IPOs
              </h2>
              <p className="mt-2 text-xs text-text-secondary sm:text-sm">
                Essential concepts for investing in Mainboard and SME Initial Public Offerings in India.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <FAQAccordionItem
                question="What is the difference between a Mainboard IPO and an SME IPO?"
                answer="Mainboard IPOs are issued by large, established companies raising higher capital (minimum post-issue paid-up capital of ₹10 Crores) listed on BSE and NSE main platforms. SME IPOs are issued by Small and Medium Enterprises with lower capital requirements listed on specialized SME platforms (BSE SME or NSE Emerge). SME IPOs typically have higher lot sizes and minimum investment amounts (around ₹1 Lakh to ₹1.4 Lakhs)."
              />
              <FAQAccordionItem
                question="How is the 'Listed in Last 7 Days' section calculated?"
                answer="Our platform dynamically calculates the listing window by verifying if an IPO's official listing_date falls between (today - 7 calendar days) and today. When an IPO passes seven days since listing, it automatically shifts to historical listed records without manual intervention."
              />
              <FAQAccordionItem
                question="What are QIB, NII/HNI, and Retail investor quotas in Indian IPOs?"
                answer="Under SEBI regulations for profitable companies: QIB (Qualified Institutional Buyers) are allocated up to 50% of the net issue; NII (Non-Institutional Investors/HNIs applying above ₹2 Lakhs) are allocated at least 15%; and Retail Individual Investors (applying up to ₹2 Lakhs) are allocated at least 35% of the issue."
              />
              <FAQAccordionItem
                question="What is Lot Size and Cut-Off Price in an IPO application?"
                answer="Lot Size is the minimum fixed number of shares an investor must bid for in a single application. The Cut-Off Price is the highest price within the price band selected by an applicant, ensuring your bid remains valid regardless of the final issue price fixed by the issuer."
              />
              <FAQAccordionItem
                question="Where can I find official DRHP and RHP documents?"
                answer="Draft Red Herring Prospectus (DRHP) and Red Herring Prospectus (RHP) documents are filed with SEBI and stock exchanges. You can access direct links to prospectus documents on each company's detailed IPO page on AVC Dhanam."
              />
            </div>
          </div>
        </section>

        {/* Regulatory Disclaimer */}
        <div className="mt-16">
          <RegulatoryDisclaimer />
        </div>

      </main>

      <V1Footer />
    </div>
  );
}

// Simple Accordion Component for FAQs
function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/80 shadow-md transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-white sm:p-5"
      >
        <span>{question}</span>
        <ChevronDown size={18} className={`shrink-0 text-gold-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-white/5 px-4 py-4 text-xs text-text-secondary sm:px-5 sm:text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
