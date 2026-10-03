import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Minus,
  PieChart,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Users,
  XCircle
} from 'lucide-react';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';
import RegulatoryDisclaimer from '../components/RegulatoryDisclaimer';
import { fetchIpoDetail, IPO } from '../services/ipoService';

export default function IpoDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const [ipo, setIpo] = useState<IPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Investment Calculator State
  const [investorCategory, setInvestorCategory] = useState<'retail' | 'snii' | 'bnii'>('retail');
  const [selectedLots, setSelectedLots] = useState(1);
  const [estimatedGainPercent, setEstimatedGainPercent] = useState(25);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await fetchIpoDetail(id, controller.signal);
        if (!controller.signal.aborted) {
          setIpo(data);
          // Set sensible default lot limits
          if (data.lotSize) {
            setSelectedLots(1);
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError('Unable to load IPO profile details. It may not exist or the service is temporarily unreachable.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [id]);

  // SEO Metadata Update
  useEffect(() => {
    if (ipo) {
      document.title = `${ipo.name} IPO – Price, Dates, Lot Size & Details | AVC Dhanam`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Detailed analysis for ${ipo.name} IPO. Price band ₹${ipo.minPrice}-₹${ipo.maxPrice}, Lot size ${ipo.lotSize}, Bidding dates ${ipo.openDate} to ${ipo.closeDate}, live subscription rates and DRHP documents.`
        );
      }
    }
  }, [ipo]);

  // GSAP Animations
  useGSAP(() => {
    if (!pageRef.current || loading || !ipo) return;
    gsap.fromTo(
      '.ipo-detail-anim',
      { y: 20, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: 'power3.out' }
    );
  }, [loading, ipo]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background font-sans text-text">
        <V1Nav />
        <main className="container-custom pt-28 pb-20">
          <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
            <div className="h-6 w-32 rounded bg-white/10" />
            <div className="h-48 rounded-3xl bg-surface/40 border border-white/10" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64 rounded-2xl bg-surface/40 border border-white/10" />
              <div className="h-64 rounded-2xl bg-surface/40 border border-white/10" />
            </div>
          </div>
        </main>
        <V1Footer />
      </div>
    );
  }

  if (error || !ipo) {
    return (
      <div className="min-h-screen bg-background font-sans text-text">
        <V1Nav />
        <main className="container-custom pt-28 pb-20 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="rounded-3xl border border-red-500/30 bg-surface/80 p-10 text-center max-w-md shadow-2xl backdrop-blur-xl">
            <XCircle size={40} className="mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-bold text-white">IPO Profile Not Found</h2>
            <p className="mt-2 text-xs text-text-secondary">{error || 'The requested IPO does not exist or has been removed.'}</p>
            <Link
              to="/ipo"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-primary px-5 py-2.5 text-xs font-bold text-black hover:bg-gold-secondary transition-all"
            >
              <ArrowLeft size={16} /> Back to IPO Dashboard
            </Link>
          </div>
        </main>
        <V1Footer />
      </div>
    );
  }

  // Derived Calculations
  const cutOffPrice = ipo.maxPrice || ipo.minPrice;
  const sharesPerLot = ipo.lotSize || 1;
  const totalShares = selectedLots * sharesPerLot;
  const totalInvestmentAmount = totalShares * cutOffPrice;
  const estimatedGainAmount = (totalInvestmentAmount * estimatedGainPercent) / 100;
  const estimatedTotalValue = totalInvestmentAmount + estimatedGainAmount;

  const maxRetailLots = Math.max(1, Math.floor(200000 / (sharesPerLot * cutOffPrice)));

  // Timeline items
  const timelineEvents = [
    { label: 'IPO Open Date', date: ipo.openDate, done: true },
    { label: 'IPO Close Date', date: ipo.closeDate, done: ipo.status !== 'upcoming' },
    { label: 'Basis of Allotment', date: ipo.allotmentDate, done: ipo.status === 'closed' || ipo.status === 'listed' },
    { label: 'Initiation of Refunds', date: ipo.refundDate, done: ipo.status === 'listed' },
    { label: 'Credit to Demat', date: ipo.dematCreditDate, done: ipo.status === 'listed' },
    { label: 'IPO Listing Date', date: ipo.listingDate, done: ipo.status === 'listed' }
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-background font-sans text-text">
      <V1Nav />

      <main className="container-custom pt-24 pb-20 sm:pt-28">
        {/* Breadcrumb navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/" className="transition-colors hover:text-gold-primary">Home</Link>
          <ChevronRight size={12} />
          <Link to="/ipo" className="transition-colors hover:text-gold-primary">IPOs</Link>
          <ChevronRight size={12} />
          <span className="text-text-secondary font-medium truncate max-w-[200px]">{ipo.name}</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/ipo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gold-secondary transition-colors hover:text-gold-primary"
          >
            <ArrowLeft size={15} /> Back to All IPOs
          </Link>
        </div>

        {/* Hero Profile Header */}
        <header className="ipo-detail-anim relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-surface-elevated/90 to-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <img
                src={ipo.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(ipo.name)}&background=1A2234&color=C5A059`}
                alt={ipo.name}
                className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-surface-elevated p-2 object-contain shadow-md"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', `https://ui-avatars.com/api/?name=${encodeURIComponent(ipo.name)}&background=1A2234&color=C5A059`);
                }}
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-gold-primary/30 bg-gold-primary/10 px-3 py-0.5 text-[11px] font-bold text-gold-secondary uppercase tracking-wider">
                    {ipo.issueType} IPO
                  </span>
                  <span className="rounded-full border border-white/10 bg-surface-elevated px-2.5 py-0.5 text-[11px] font-medium text-text-secondary">
                    {ipo.exchanges.join(' & ')}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      ipo.status === 'open'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : ipo.status === 'upcoming'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : ipo.status === 'closed'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gold-primary/20 text-gold-secondary border border-gold-primary/30'
                    }`}
                  >
                    {ipo.status}
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
                  {ipo.name}
                </h1>
                <p className="mt-1 text-xs text-text-muted font-medium">
                  Symbol: <span className="text-text-secondary">{ipo.symbol || 'N/A'}</span>
                </p>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap gap-3">
              {ipo.documents?.rhpUrl || ipo.documents?.drhpUrl ? (
                <a
                  href={ipo.documents?.rhpUrl || ipo.documents?.drhpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-elevated px-4 py-2.5 text-xs font-semibold text-white hover:border-gold-primary hover:text-gold-secondary transition-all"
                >
                  <FileText size={15} />
                  <span>View RHP Document</span>
                  <ExternalLink size={13} />
                </a>
              ) : null}
              {ipo.documents?.allotmentUrl ? (
                <a
                  href={ipo.documents.allotmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gold-primary/40 bg-gold-primary/10 px-4 py-2.5 text-xs font-bold text-gold-secondary hover:bg-gold-primary hover:text-black transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Check Allotment Status</span>
                  <ExternalLink size={13} />
                </a>
              ) : null}
            </div>
          </div>

          {/* Listed Performance Summary (If Listed) */}
          {ipo.status === 'listed' && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Listing & Market Performance Overview
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-background/50 p-3">
                  <span className="text-[11px] text-text-muted">Issue Price</span>
                  <p className="mt-0.5 text-lg font-bold text-white">₹{ipo.issuePrice || ipo.maxPrice}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/50 p-3">
                  <span className="text-[11px] text-text-muted">Listing Price</span>
                  <p className="mt-0.5 text-lg font-bold text-white">₹{ipo.listingPrice || 'N/A'}</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/50 p-3">
                  <span className="text-[11px] text-text-muted">Listing Gain / Loss</span>
                  <p className={`mt-0.5 text-lg font-bold ${ipo.listingGainPercent !== undefined && ipo.listingGainPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ipo.listingGainPercent !== undefined ? (ipo.listingGainPercent >= 0 ? `+${ipo.listingGainPercent}%` : `${ipo.listingGainPercent}%`) : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/50 p-3">
                  <span className="text-[11px] text-text-muted">Current Market Price (CMP)</span>
                  <p className="mt-0.5 text-lg font-bold text-gold-secondary">
                    {ipo.currentPrice ? `₹${ipo.currentPrice}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content Layout Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Left / Main Column (2 cols) */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* 1. Important Dates Timeline */}
            <section className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Calendar size={18} className="text-gold-secondary" />
                <h2>IPO Timeline & Key Dates</h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {timelineEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="flex flex-col justify-between rounded-xl border border-white/5 bg-background/60 p-3.5 transition-colors hover:border-white/20"
                  >
                    <span className="text-[11px] font-medium text-text-muted">{ev.label}</span>
                    <span className="mt-2 text-sm font-bold text-white">
                      {formatDate(ev.date)}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Price Band & Lot Details */}
            <section className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <PieChart size={18} className="text-gold-secondary" />
                <h2>Price & Lot Size Breakdown</h2>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs text-text-secondary">
                  <tbody className="divide-y divide-white/5 bg-background/40">
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-muted">Price Band</td>
                      <td className="px-4 py-3 font-bold text-white">
                        {ipo.minPrice === ipo.maxPrice ? `₹${ipo.minPrice}` : `₹${ipo.minPrice} - ₹${ipo.maxPrice}`} per share
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-muted">Face Value</td>
                      <td className="px-4 py-3 font-bold text-white">
                        {ipo.faceValue ? `₹${ipo.faceValue} per share` : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-muted">Lot Size</td>
                      <td className="px-4 py-3 font-bold text-white">{ipo.lotSize} Shares</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-muted">Minimum Retail Investment</td>
                      <td className="px-4 py-3 font-bold text-gold-secondary">
                        {formatCurrency(ipo.minInvestment)} (1 Lot)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-text-muted">Maximum Retail Lots</td>
                      <td className="px-4 py-3 font-bold text-white">
                        {maxRetailLots} Lots ({maxRetailLots * sharesPerLot} shares, {formatCurrency(maxRetailLots * sharesPerLot * cutOffPrice)})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. Interactive Investment Calculator */}
            <section className="ipo-detail-anim rounded-3xl border border-gold-primary/30 bg-gradient-to-b from-gold-primary/10 to-surface/90 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles size={18} className="text-gold-secondary" />
                  <h2>Interactive Investment & Listing Gain Calculator</h2>
                </div>
                <span className="text-[11px] font-semibold text-gold-secondary">Calculated at Cut-Off Price ₹{cutOffPrice}</span>
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Investor Category</label>
                    <div className="mt-2 flex rounded-xl border border-white/10 bg-background/60 p-1">
                      <button
                        type="button"
                        onClick={() => { setInvestorCategory('retail'); setSelectedLots(1); }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${investorCategory === 'retail' ? 'bg-gold-primary text-black' : 'text-text-muted hover:text-white'}`}
                      >
                        Retail (up to ₹2L)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setInvestorCategory('snii'); setSelectedLots(Math.ceil(200000 / (sharesPerLot * cutOffPrice))); }}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${investorCategory === 'snii' ? 'bg-gold-primary text-black' : 'text-text-muted hover:text-white'}`}
                      >
                        sHNI (₹2L - ₹10L)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary">Select Number of Lots</span>
                      <span className="font-bold text-white">{selectedLots} Lot{selectedLots > 1 ? 's' : ''}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedLots(Math.max(1, selectedLots - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface-elevated text-white hover:border-gold-primary"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="range"
                        min="1"
                        max={investorCategory === 'retail' ? maxRetailLots : 50}
                        value={selectedLots}
                        onChange={(e) => setSelectedLots(Number(e.target.value))}
                        className="h-2 flex-1 accent-gold-primary bg-white/10 rounded-lg cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedLots(selectedLots + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface-elevated text-white hover:border-gold-primary"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-text-secondary">Hypothetical Listing Gain Scenario (%)</label>
                    <div className="mt-2 flex gap-2">
                      {[10, 25, 50, 75, 100].map((gain) => (
                        <button
                          key={gain}
                          type="button"
                          onClick={() => setEstimatedGainPercent(gain)}
                          className={`flex-1 rounded-lg border py-1 text-xs font-semibold transition-all ${estimatedGainPercent === gain ? 'border-gold-primary bg-gold-primary/20 text-gold-secondary' : 'border-white/10 bg-background/50 text-text-muted hover:text-white'}`}
                        >
                          +{gain}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-background/80 p-5 shadow-inner">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Total Shares Bid</span>
                      <span className="font-bold text-white">{totalShares} Shares</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Required Capital</span>
                      <span className="font-bold text-gold-secondary text-base">{formatCurrency(totalInvestmentAmount)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                      <span className="text-text-muted">Estimated Gain ({estimatedGainPercent}%)</span>
                      <span className="font-bold text-emerald-400">+{formatCurrency(estimatedGainAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                    <span className="text-[11px] text-emerald-300 font-medium">Estimated Total Value on Listing</span>
                    <p className="mt-0.5 text-xl font-black text-emerald-400">{formatCurrency(estimatedTotalValue)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Issue Size & Structure */}
            <section className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Layers size={18} className="text-gold-secondary" />
                <h2>Issue Size & Shareholding Structure</h2>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                  <span className="text-[11px] text-text-muted">Total Issue Size</span>
                  <p className="mt-1 text-base font-bold text-white">
                    {ipo.issueSizeCr ? `₹${ipo.issueSizeCr} Cr` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                  <span className="text-[11px] text-text-muted">Fresh Issue Portion</span>
                  <p className="mt-1 text-base font-bold text-emerald-400">
                    {ipo.freshIssueCr !== undefined ? `₹${ipo.freshIssueCr} Cr` : 'N/A'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-background/50 p-4">
                  <span className="text-[11px] text-text-muted">Offer For Sale (OFS)</span>
                  <p className="mt-1 text-base font-bold text-amber-400">
                    {ipo.ofsCr !== undefined ? `₹${ipo.ofsCr} Cr` : 'N/A'}
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Subscription Status */}
            {ipo.subscription && (
              <section className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <Users size={18} className="text-gold-secondary" />
                    <h2>Subscription Status Demand</h2>
                  </div>
                  {ipo.subscription.total ? (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 text-xs font-extrabold text-emerald-400">
                      Total Subscribed {ipo.subscription.total}x
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 space-y-4">
                  <SubscriptionBar label="QIB Category" value={ipo.subscription.qib} color="bg-purple-500" />
                  <SubscriptionBar label="NII / HNI Category" value={ipo.subscription.nii} color="bg-blue-500" />
                  <SubscriptionBar label="Retail Individual Investors" value={ipo.subscription.retail} color="bg-emerald-500" />
                  {ipo.subscription.employee !== undefined && (
                    <SubscriptionBar label="Employee Portion" value={ipo.subscription.employee} color="bg-amber-500" />
                  )}
                </div>
              </section>
            )}

            {/* 6. Company Description & Financials */}
            <section className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Building2 size={18} className="text-gold-secondary" />
                <h2>Company Background & Financial Track Record</h2>
              </div>

              <p className="mt-4 text-xs text-text-secondary sm:text-sm leading-relaxed">
                {ipo.companyDescription || `${ipo.name} is a leading enterprise in its sector preparing for public listing on Indian exchanges.`}
              </p>

              {/* Financials Table */}
              {ipo.financials && ipo.financials.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-white mb-3">Key Financial Overview (₹ in Crores)</h3>
                  <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-surface-elevated text-text-muted font-semibold border-b border-white/5">
                        <tr>
                          <th className="px-4 py-2.5">Financial Year</th>
                          <th className="px-4 py-2.5">Total Revenue</th>
                          <th className="px-4 py-2.5">Profit After Tax (PAT)</th>
                          <th className="px-4 py-2.5">Net Worth</th>
                          <th className="px-4 py-2.5">Total Assets</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 bg-background/40 font-medium text-white">
                        {ipo.financials.map((fin, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 text-gold-secondary font-bold">{fin.year}</td>
                            <td className="px-4 py-2.5">{fin.revenueCr ? `₹${fin.revenueCr} Cr` : 'N/A'}</td>
                            <td className="px-4 py-2.5">{fin.patCr ? `₹${fin.patCr} Cr` : 'N/A'}</td>
                            <td className="px-4 py-2.5">{fin.netWorthCr ? `₹${fin.netWorthCr} Cr` : 'N/A'}</td>
                            <td className="px-4 py-2.5">{fin.assetsCr ? `₹${fin.assetsCr} Cr` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>

          </div>

          {/* Right Sidebar (1 col) */}
          <div className="space-y-6">
            
            {/* Registrar Information */}
            <div className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck size={18} className="text-gold-secondary" />
                <h3>Registrar Details</h3>
              </div>

              <div className="mt-4 space-y-3 text-xs text-text-secondary">
                <div>
                  <span className="text-[11px] text-text-muted">Registrar Name</span>
                  <p className="mt-0.5 font-bold text-white">{ipo.registrar?.name || 'N/A'}</p>
                </div>
                {ipo.registrar?.phone && (
                  <div>
                    <span className="text-[11px] text-text-muted">Phone Number</span>
                    <p className="mt-0.5 font-medium text-text">{ipo.registrar.phone}</p>
                  </div>
                )}
                {ipo.registrar?.email && (
                  <div>
                    <span className="text-[11px] text-text-muted">Email</span>
                    <p className="mt-0.5 font-medium text-gold-secondary truncate">{ipo.registrar.email}</p>
                  </div>
                )}
                {ipo.registrar?.website && (
                  <div className="pt-2">
                    <a
                      href={ipo.registrar.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-primary hover:underline"
                    >
                      <span>Visit Registrar Portal</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Managers */}
            {ipo.leadManagers && ipo.leadManagers.length > 0 && (
              <div className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Award size={18} className="text-gold-secondary" />
                  <h3>Lead Managers</h3>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-text-secondary">
                  {ipo.leadManagers.map((lm, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-primary shrink-0" />
                      <span className="font-medium text-white">{lm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Official Documents Downloads */}
            <div className="ipo-detail-anim rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <FileText size={18} className="text-gold-secondary" />
                <h3>Official Documents</h3>
              </div>

              <div className="mt-4 space-y-3">
                {ipo.documents?.drhpUrl ? (
                  <a
                    href={ipo.documents.drhpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-background/50 p-3 text-xs text-text-secondary hover:border-gold-primary hover:text-white transition-all"
                  >
                    <span>Draft Prospectus (DRHP)</span>
                    <Download size={14} className="text-gold-secondary" />
                  </a>
                ) : null}
                {ipo.documents?.rhpUrl ? (
                  <a
                    href={ipo.documents.rhpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-background/50 p-3 text-xs text-text-secondary hover:border-gold-primary hover:text-white transition-all"
                  >
                    <span>Red Herring Prospectus (RHP)</span>
                    <Download size={14} className="text-gold-secondary" />
                  </a>
                ) : null}
                {!ipo.documents?.drhpUrl && !ipo.documents?.rhpUrl && (
                  <p className="text-xs text-text-muted italic">No direct document links provided for this issue.</p>
                )}
              </div>
            </div>

            {/* Internal links to other tools */}
            <div className="ipo-detail-anim rounded-3xl border border-gold-primary/20 bg-gold-primary/5 p-6 backdrop-blur-md">
              <h4 className="text-xs font-bold text-gold-secondary uppercase tracking-wider">Explore AVC Dhanam Tools</h4>
              <p className="mt-2 text-xs text-text-secondary">
                Search stock metrics or simulate wealth growth with our interactive financial suite.
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link
                  to="/screener"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-2.5 text-xs font-semibold text-white hover:border-gold-primary"
                >
                  <span>Stock Screener & Analytics</span>
                  <ArrowUpRight size={14} />
                </Link>
                <Link
                  to="/#calculators"
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-2.5 text-xs font-semibold text-white hover:border-gold-primary"
                >
                  <span>SIP & Investment Calculators</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Regulatory Disclaimer */}
        <div className="mt-16">
          <RegulatoryDisclaimer />
        </div>

      </main>

      <V1Footer />
    </div>
  );
}

// Subscription progress bar component
function SubscriptionBar({ label, value, color }: { label: string; value?: number; color: string }) {
  const displayVal = value !== undefined ? `${value}x` : 'N/A';
  const widthPercent = value ? Math.min(100, (value / 50) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-bold text-white">{displayVal}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500 rounded-full`} style={{ width: `${widthPercent}%` }} />
      </div>
    </div>
  );
}
