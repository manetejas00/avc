import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Award, BarChart3, Building2, Calculator, CheckCircle2, ChevronLeft, ChevronRight, ExternalLink, Layers3, LockKeyhole, MapPin, RefreshCw, ShieldCheck, Sparkles, Target, TrendingUp, X } from 'lucide-react';
import TradingViewTicker from './TradingViewTicker';
import ContactFormModal from './ContactFormModal';
import LiveMarketOverview from './LiveMarketOverview';
import HomeEbooksSection from './HomeEbooksSection';
import ScreenerGateway from './ScreenerGateway';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import { V1Footer, V1Nav } from './V1SiteChrome';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getApiUrl } from '../services/apiClient';

type Service = readonly [string, React.ElementType, string];
const tools: readonly Service[] = [
  ['Investment & Wealth Services', BarChart3, 'Comprehensive wealth management including Mutual Funds, Systematic Investment Plans (SIP), Equity Market guidance, IPO Advisory, Lumpsum wealth creation, and risk-profiled goal planning. We facilitate access to NSE and BSE investment ecosystems through authorized registered intermediaries, leveraging our 8+ year Motilal Oswal sub-broker franchise association.'],
  ['Loans & Business Financing', LockKeyhole, 'Customized financing solutions including Personal Loans, Business Loans, Home Loans, Loan Against Property (LAP), Working Capital, MSME/SME Funding, Startup Funding, Construction Finance, and Corporate Finance. We connect clients with suitable financing solutions leveraging our 210+ Bank and NBFC partner network.'],
  ['Insurance & Risk Protection', Target, 'Complete protection strategies covering Life Insurance, Health Insurance, General Insurance, Commercial Risk Coverage, and Family Financial Protection. We view insurance as an essential risk-mitigation component of a resilient, long-term financial plan rather than just a policy.'],
  ['Corporate Tax & CA Services', Layers3, 'Corporate tax planning, tax-saving investment solutions, business accounting, audit preparation support, financial documentation, and corporate compliance powered by our professional network of 10+ Chartered Accountants.'],
  ['Merchant Banking & Corporate Funding', Sparkles, 'Growth capital advisory, corporate fundraising consultation, startup debt/equity structuring, developer construction finance, and capital management facilitated via experienced merchant banking partner channels.'],
  ['Retirement & Financial Literacy', TrendingUp, 'Disciplined retirement corpus creation, children\'s education planning, long-term asset allocation, and community financial literacy awareness initiatives in association with Avinya Care Foundation (www.avinyacarefoundation.org).']
] as const;
type NewsItem = { category: string; image: string; title: string; text: string; details: string; link: string; source: string };
type CalculatorKind = 'sip' | 'loan' | 'lumpsum' | 'retirement';

type ShowcaseSlide = {
  image: string;
  tag: string;
  title: string;
  alt: string;
  badgeLabel: string;
  badgeStatus: string;
  stat1Label: string;
  stat1Width: string;
  stat2Label: string;
  stat2Width: string;
  badgeFooter: string;
};

const showcaseSlides: readonly ShowcaseSlide[] = [
  {
    image: '/assets/v1/financial-dashboard-hd.jpg',
    tag: 'Wealth Management & Advisory',
    title: 'Institutional Portfolio Terminal',
    alt: 'AVC Dhanam institutional wealth architecture and portfolio analytics terminal',
    badgeLabel: 'Consultancy Architecture',
    badgeStatus: 'Synchronised',
    stat1Label: 'Investment & Portfolio Alignment',
    stat1Width: '92%',
    stat2Label: 'Financing & Loan Structure',
    stat2Width: '85%',
    badgeFooter: '210+ Bank & NBFC Relationships Active'
  },
  {
    image: '/assets/v1/service-banking-syndication.jpg',
    tag: 'Loan Syndication & Credit',
    title: 'Commercial Lending Network Desk',
    alt: 'AVC Dhanam commercial lending and 210+ banking partner syndicate desk in Mumbai BKC',
    badgeLabel: 'Syndicate Liquidity',
    badgeStatus: 'Active Capital',
    stat1Label: 'Partner Bank & NBFC Pipeline',
    stat1Width: '96%',
    stat2Label: 'Credit Appraisal Velocity',
    stat2Width: '88%',
    badgeFooter: 'Direct Relationships with 210+ Lenders'
  },
  {
    image: '/assets/v1/service-wealth-advisory.jpg',
    tag: 'Private Wealth Consultancy',
    title: 'Executive Advisory Boardroom',
    alt: 'AVC Dhanam private wealth advisory boardroom and portfolio presentation in Mumbai',
    badgeLabel: 'Private Advisory',
    badgeStatus: 'Institutional',
    stat1Label: 'Goal-Based Wealth Preservation',
    stat1Width: '98%',
    stat2Label: 'Risk-Adjusted Alpha Delivery',
    stat2Width: '94%',
    badgeFooter: '500+ High-Net-Worth Families Advised'
  },
  {
    image: '/assets/v1/service-corporate-treasury.jpg',
    tag: 'Corporate Treasury & Tax',
    title: 'CA Audit & Capital Operations',
    alt: 'AVC Dhanam corporate treasury, CA tax planning, and equity trading station overlooking Mumbai',
    badgeLabel: 'Corporate Treasury',
    badgeStatus: 'Optimised',
    stat1Label: 'Tax Strategy & Compliance',
    stat1Width: '91%',
    stat2Label: 'Statutory CA Audit Readiness',
    stat2Width: '95%',
    badgeFooter: 'Network of 10+ Chartered Accountants'
  }
] as const;

type HeroSlide = {
  image: string;
  alt: string;
  title: string;
};

const heroSlides: readonly HeroSlide[] = [
  {
    image: '/assets/hero/hero-boardroom-skyline.jpg',
    alt: 'AVC Dhanam Boardroom overlooking Mumbai Financial District',
    title: 'Executive Wealth Advisory Suite'
  },
  {
    image: '/assets/hero/hero-bkc-towers.jpg',
    alt: 'Bandra Kurla Complex Financial District Towers',
    title: 'BKC Financial Center'
  },
  {
    image: '/assets/hero/hero-advisory-lounge.jpg',
    alt: 'Private Wealth Advisory Lounge overlooking Marine Drive',
    title: 'Private Client Suite'
  },
  {
    image: '/assets/hero/hero-premium.jpg',
    alt: 'Modern Institutional Headquarters',
    title: 'Institutional Financial Tower'
  }
] as const;

gsap.registerPlugin(ScrollTrigger);

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" className="v1-action" onClick={onClick}>{children}<span><ArrowUpRight size={18} /></span></button>;
}

export default function V1Landing() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsStatus, setNewsStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  useBodyScrollLock(Boolean(selectedNews || selectedService));

  useEffect(() => {
    if (isHeroPaused) return;
    const heroTimer = setInterval(() => {
      setActiveHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(heroTimer);
  }, [isHeroPaused]);

  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % showcaseSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isSlidePaused]);

  const prevSlide = () => setActiveSlideIndex((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
  const nextSlide = () => setActiveSlideIndex((prev) => (prev + 1) % showcaseSlides.length);

  const newsSectionRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const tickerRef = useRef<HTMLElement>(null);
  const calculatorSectionRef = useRef<HTMLElement>(null);
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [annualReturn, setAnnualReturn] = useState(12);
  const [investmentYears, setInvestmentYears] = useState(10);
  const [activeCalculator, setActiveCalculator] = useState<CalculatorKind>('sip');
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(20);
  const [lumpsumAmount, setLumpsumAmount] = useState(500000);
  const [lumpsumRate, setLumpsumRate] = useState(12);
  const [lumpsumYears, setLumpsumYears] = useState(10);
  const [monthlyExpense, setMonthlyExpense] = useState(50000);
  const [inflationRate, setInflationRate] = useState(6);
  const [retirementYears, setRetirementYears] = useState(25);
  const monthlyRate = annualReturn / 12 / 100;
  const months = investmentYears * 12;
  const maturityValue = monthlyRate ? monthlyInvestment * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)) : monthlyInvestment * months;
  const investedValue = monthlyInvestment * months;
  const loanMonthlyRate = loanRate / 12 / 100;
  const loanMonths = loanYears * 12;
  const monthlyEmi = loanMonthlyRate ? loanAmount * loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanMonths) / (Math.pow(1 + loanMonthlyRate, loanMonths) - 1) : loanAmount / loanMonths;
  const lumpsumValue = lumpsumAmount * Math.pow(1 + lumpsumRate / 100, lumpsumYears);
  const futureMonthlyExpense = monthlyExpense * Math.pow(1 + inflationRate / 100, retirementYears);
  const retirementCorpus = futureMonthlyExpense * 12 * 25;
  const rangeStyle = (value: number, min: number, max: number) => ({ background: `linear-gradient(90deg, #d4af37 0 ${(value - min) / (max - min) * 100}%, #3f3f46 ${(value - min) / (max - min) * 100}% 100%)` });

  const loadLiveNews = async () => {
    try {
      setIsRefreshingNews(true);
      setNewsStatus('loading');

      const DEFAULT_FALLBACK_IMAGES = [
        '/assets/news/news-indian-equities.webp',
        '/assets/news/news-rbi-policy.webp',
        '/assets/news/news-global-economy.webp'
      ];

      let rawArticles: any[] = [];

      // Tier 1: Unified backend live market news API (for local Express server)
      try {
        const response = await fetch(getApiUrl('/api/news/live'));
        if (response.ok) {
          const payload = await response.json();
          if (Array.isArray(payload?.data) && payload.data.length > 0) {
            rawArticles = payload.data;
          } else if (Array.isArray(payload?.news) && payload.news.length > 0) {
            rawArticles = payload.news;
          }
        }
      } catch (e) {
        // Fall through to live PHP endpoints
      }

      // Tier 2: Unified PHP news endpoint on live server (Hostinger)
      if (!rawArticles.length) {
        try {
          const response = await fetch(getApiUrl('/api/news.php'));
          if (response.ok) {
            const payload = await response.json();
            if (Array.isArray(payload?.data) && payload.data.length > 0) {
              rawArticles = payload.data;
            } else if (Array.isArray(payload) && payload.length > 0) {
              rawArticles = payload;
            }
          }
        } catch (e) {
          // Fall through
        }
      }

      // Tier 3: Direct IndianAPI PHP proxy on live server
      if (!rawArticles.length) {
        try {
          const response = await fetch(getApiUrl('/api/indianapi.php?endpoint=news'));
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              rawArticles = data;
            }
          }
        } catch (e) {
          // Fall through
        }
      }

      // Tier 4: Direct Marketaux PHP proxy on live server
      if (!rawArticles.length) {
        try {
          const response = await fetch(getApiUrl('/api/marketaux.php?search=Indian+stock+market&limit=6'));
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data?.data) && data.data.length > 0) {
              rawArticles = data.data;
            }
          }
        } catch (e) {
          // Fall through
        }
      }

      // Tier 5: Curated baseline financial intelligence (guarantees zero empty state)
      if (!rawArticles.length) {
        rawArticles = [
          {
            title: 'Sensex & Nifty Consolidate Near Record Highs Supported by Institutional Inflows',
            summary: 'Domestic benchmark indices display firm momentum as institutional capital and retail SIP participation continue to anchor market valuations.',
            url: '#',
            image_url: '/assets/news/news-indian-equities.webp',
            source: 'NSE / Market Intelligence',
            topics: ['Equities']
          },
          {
            title: 'RBI Liquidity Strategy Keeps Commercial Banking & Lending Syndicates Robust',
            summary: 'Proactive monetary policy safeguards credit growth across SME finance and commercial banking networks in Mumbai and Maharashtra.',
            url: '#',
            image_url: '/assets/news/news-rbi-policy.webp',
            source: 'RBI Policy Desk',
            topics: ['Banking']
          },
          {
            title: 'Retail Mutual Fund SIP Inflows Surge to All-Time Highs Across Maharashtra',
            summary: 'Systematic Investment Plan contributions set historic records as disciplined wealth creation architectures gain widespread adoption.',
            url: '#',
            image_url: '/assets/news/news-global-economy.webp',
            source: 'AMFI Data',
            topics: ['Mutual Funds']
          }
        ];
      }

      const items: NewsItem[] = rawArticles.map((item: any, index: number): NewsItem => {
        const title = String(item.title || item.headline || '').trim();
        const details = String(item.summary || item.description || item.content || '').replace(/<[^>]*>?/gm, '').trim();
        const rawImage = item.image_url || item.image || item.thumbnail;
        const image = (typeof rawImage === 'string' && (rawImage.startsWith('http') || rawImage.startsWith('/')))
          ? rawImage.trim()
          : DEFAULT_FALLBACK_IMAGES[index % DEFAULT_FALLBACK_IMAGES.length];
        const category = (Array.isArray(item.topics) && item.topics[0])
          ? item.topics[0]
          : (typeof item.category === 'string' ? item.category : 'Markets');
        const source = item.source?.name || (typeof item.source === 'string' ? item.source : 'Live Market Feed');
        const link = item.url || item.link || item.source_url || '#';

        return {
          category,
          image,
          title,
          text: details.slice(0, 130) + (details.length > 130 ? '…' : '') || 'Live real-time market report and analytical perspective.',
          details: details || title,
          link,
          source
        };
      }).filter((item): item is NewsItem => Boolean(item.title)).slice(0, 6);

      setNewsItems(items);
      setNewsStatus('ready');
    } catch (err) {
      console.warn('Error fetching live stock market news:', err);
      setNewsStatus('unavailable');
    } finally {
      setIsRefreshingNews(false);
    }
  };

  useEffect(() => {
    void loadLiveNews();
    const refreshId = window.setInterval(() => void loadLiveNews(), 30 * 60 * 1000); // Auto-refresh every 30 minutes
    return () => window.clearInterval(refreshId);
  }, []);

  useGSAP(() => {
    const cards = gsap.utils.toArray<HTMLElement>('.v1-news-card');
    if (!cards.length) return;
    gsap.fromTo(cards, { y: 34, opacity: 0, rotateX: -7 }, { y: 0, opacity: 1, rotateX: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: newsSectionRef.current, start: 'top 78%', once: true } });
  }, { scope: newsSectionRef, dependencies: [newsItems.length] });

  useGSAP(() => {
    const nav = navRef.current;
    if (!nav) return;
    gsap.fromTo(nav, { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: .75, delay: .15, ease: 'power3.out' });
  }, []);

  useGSAP(() => {
    const section = calculatorSectionRef.current;
    if (!section) return;
    gsap.fromTo(section.querySelectorAll('.v1-calculator__reveal'), { y: 28, opacity: 0 }, { y: 0, opacity: 1, stagger: .11, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: section, start: 'top 78%', once: true } });
  }, { scope: calculatorSectionRef });

  useGSAP(() => {
    const value = calculatorSectionRef.current?.querySelector('.v1-calculator__value');
    if (value) gsap.fromTo(value, { scale: .96, opacity: .5 }, { scale: 1, opacity: 1, duration: .42, ease: 'power3.out' });
  }, { scope: calculatorSectionRef, dependencies: [monthlyInvestment, annualReturn, investmentYears] });

  useGSAP(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    const line = ticker.querySelector('.v1-ticker-only__scan');
    const timeline = gsap.timeline({ scrollTrigger: { trigger: ticker, start: 'top 92%', once: true } });
    timeline.fromTo(ticker, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' })
      .fromTo(ticker.querySelector('.v1-ticker-only__feed'), { x: 34, opacity: 0 }, { x: 0, opacity: 1, duration: .65, ease: 'power3.out' }, '-=.35');
    if (line) gsap.to(line, { xPercent: 260, duration: 3.6, ease: 'none', repeat: -1, repeatDelay: 1.8 });
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedNews(null);
        setSelectedService(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return <main id="main-content" className="v1-site">
    <V1Nav ref={navRef} home />
    <section 
      className="v1-hero"
      onMouseEnter={() => setIsHeroPaused(true)}
      onMouseLeave={() => setIsHeroPaused(false)}
    >
      <div className="v1-hero__slider" aria-label="Executive financial background showcase">
        {heroSlides.map((slide, index) => {
          const isActive = index === activeHeroSlide;
          return (
            <div
              key={slide.image}
              className={`v1-hero__slide ${isActive ? 'v1-hero__slide--active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="v1-hero__slide-image"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          );
        })}
        <div className="v1-hero__overlay" aria-hidden="true" />
      </div>
      <div className="v1-hero__body">
        <div className="v1-kicker"><i /> Financial Consultancy • Virar West, Mumbai</div>
        <h1>Your Complete Financial Journey,<br /><em>Under One Roof.</em></h1>
        <p>Goal-based wealth management, 210+ bank loan solutions, corporate tax advisory, and insurance protection for individuals & enterprises in Virar & Mumbai.</p>
        <div className="v1-hero__actions">
          <ActionButton onClick={() => setIsConsultationOpen(true)}>Start Your Financial Journey</ActionButton>
          <a href="#system" className="v1-text-link">Explore Financial Solutions <ChevronRight size={16} /></a>
        </div>
      </div>
      <aside className="v1-stats">
        <div><strong>8+ Years</strong><span>financial experience</span></div>
        <div><strong>500+</strong><span>client base</span></div>
        <div><strong>₹15+ Cr</strong><span>AUM & wealth assets</span></div>
        <div><strong>210+</strong><span>bank/NBFC ties</span></div>
        <div><strong>10+ CA</strong><span>tax & audit network</span></div>
      </aside>
      <div className="v1-hero__bottom">
        <div className="v1-scroll">SCROLL TO DISCOVER <span /></div>
        <div className="v1-hero__dots" role="tablist" aria-label="Hero background slides">
          {heroSlides.map((slide, index) => {
            const isActive = index === activeHeroSlide;
            return (
              <button
                type="button"
                key={slide.image}
                role="tab"
                aria-selected={isActive}
                aria-label={`View background image ${index + 1}: ${slide.title}`}
                className={`v1-hero__dot ${isActive ? 'v1-hero__dot--active' : ''}`}
                onClick={() => {
                  setActiveHeroSlide(index);
                  setIsHeroPaused(true);
                }}
              >
                <span 
                  key={`${slide.image}-${isActive}`} 
                  className={`v1-hero__dot-fill ${isHeroPaused ? 'v1-hero__dot-fill--paused' : ''}`} 
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>

    <section id="markets" ref={tickerRef} className="v1-ticker-only" aria-label="Live market ticker"><div className="v1-ticker-only__label"><i />LIVE MARKETS</div><div className="v1-ticker-only__feed"><TradingViewTicker /></div><span className="v1-ticker-only__scan" aria-hidden="true" /></section>

    <section id="system" className="v1-features">
      <div className="v1-features__intro">
        <span className="v1-index">01 — COMPLETE FINANCIAL SERVICES</span>
        <h2>A Complete Financial Journey,<br /><em>Under One Roof.</em></h2>
        <p>Integrated wealth management, loan solutions, corporate tax advisory, and risk protection under one roof.</p>
        <div className="v1-tool-list">
          {tools.map(([label, Icon, description], index) => (
            <button 
              type="button" 
              key={label} 
              onClick={() => {
                setSelectedService([label, Icon, description] as Service);
                if (index === 0) setActiveSlideIndex(0);
                else if (index === 1) setActiveSlideIndex(1);
                else if (index === 2 || index === 5) setActiveSlideIndex(2);
                else if (index === 3 || index === 4) setActiveSlideIndex(3);
              }} 
              aria-label={`Learn more about ${label}`}
            >
              <Icon size={17} />
              <span>0{index + 1}</span>
              {label}
              <ChevronRight size={15} className="v1-tool-list__arrow" />
            </button>
          ))}
        </div>
      </div>

      <div 
        className="v1-analysis"
        onMouseEnter={() => setIsSlidePaused(true)}
        onMouseLeave={() => setIsSlidePaused(false)}
        role="region"
        aria-roledescription="carousel"
        aria-label="AVC Dhanam Financial Architecture Showcase"
      >
        {/* Looping Slides with Ken-Burns and Cross-fade */}
        {showcaseSlides.map((slide, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <div
              key={slide.image}
              className={`v1-analysis__slide ${isActive ? 'is-active' : ''}`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                width="1376"
                height="768"
                className="v1-analysis__slide-img"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div className="v1-analysis__overlay" />
            </div>
          );
        })}

        {/* Top Floating HUD: Slide Tag & Interactive Navigation */}
        <div className="v1-analysis__controls">
          <div className="v1-analysis__tag">
            <span className="v1-analysis__tag-dot" />
            <span>{showcaseSlides[activeSlideIndex].tag}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented Progress Indicators */}
            <div className="v1-analysis__pagination" role="tablist" aria-label="Showcase slides">
              {showcaseSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlideIndex(idx)}
                  className={`v1-analysis__dot ${idx === activeSlideIndex ? 'is-active' : ''}`}
                  aria-label={`Go to slide ${idx + 1}: ${showcaseSlides[idx].tag}`}
                  aria-selected={idx === activeSlideIndex}
                  role="tab"
                />
              ))}
            </div>

            {/* Prev / Next Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevSlide}
                className="v1-analysis__nav-btn"
                aria-label="Previous showcase slide"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="v1-analysis__nav-btn"
                aria-label="Next showcase slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Synchronized Glass Information Terminal Card */}
        <div className="v1-analysis__glass" aria-live="polite">
          <div>
            <span>{showcaseSlides[activeSlideIndex].badgeLabel}</span>
            <b>{showcaseSlides[activeSlideIndex].badgeStatus}</b>
          </div>
          <p>{showcaseSlides[activeSlideIndex].stat1Label}</p>
          <div className="v1-progress">
            <i 
              style={{ 
                width: showcaseSlides[activeSlideIndex].stat1Width,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} 
            />
          </div>
          <p>{showcaseSlides[activeSlideIndex].stat2Label}</p>
          <div className="v1-progress">
            <i 
              style={{ 
                width: showcaseSlides[activeSlideIndex].stat2Width,
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' 
              }} 
            />
          </div>
          <small>
            <span /> {showcaseSlides[activeSlideIndex].badgeFooter}
          </small>
        </div>
      </div>
    </section>

    <section id="approach" className="v1-productivity" aria-labelledby="about-section-title">
      <div className="v1-productivity__grid" aria-hidden="true" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-xs font-semibold tracking-wider uppercase mb-4">
            <Sparkles size={13} className="text-gold-primary" />
            <span>02 — ABOUT AVC DHANAM SOLUTIONS</span>
          </div>
          <h2 id="about-section-title" className="text-white font-serif tracking-tight leading-tight mb-4">
            Visionary Leadership. <br className="hidden sm:block" />
            <em className="italic text-gold-primary">A Trusted Financial Heritage.</em>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Headquartered in Virar West, Mumbai, <strong>AVC Dhanam Solutions Pvt. Ltd.</strong> was established by Directors <strong>Chandresh Pandey</strong> &amp; <strong>Ajay Pandey</strong> to democratize institutional-grade financial guidance. Over 8+ years, we have guided 500+ families, professionals, and business enterprises across wealth management, debt syndication, and corporate tax strategy.
          </p>
        </div>

        {/* Founders Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12 sm:mb-16">
          {/* Founder 1: Chandresh Pandey */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-gold-primary/40 transition-all duration-300 overflow-hidden flex flex-col shadow-2xl">
            {/* Image Container with Top Badge Overlay */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0e0e12]">
              <img
                src="/assets/founders/chandresh-pandey.jpg"
                alt="Chandresh Pandey - Director & Co-Founder of AVC Dhanam Solutions"
                width="896"
                height="672"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              
              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-gold-primary/40 text-gold-primary text-xs font-semibold tracking-wide shadow-lg">
                  Co-Founder &amp; Director
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AMFI ARN-184920
                </span>
              </div>
            </div>

            {/* Founder 1 Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                {/* Identification Header */}
                <div className="mb-5 pb-4 border-b border-white/10">
                  <span className="text-gold-primary text-xs font-bold tracking-wider uppercase block mb-1">
                    Wealth Architecture &amp; Equity Strategy
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Chandresh Pandey
                  </h3>
                </div>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Directs AVC Dhanam’s investment advisory practice with 8+ years of capital markets acumen. Specializes in long-term equity strategy, goal-based Mutual Fund allocation, and wealth preservation for high-net-worth individuals and families.
                </p>

                {/* Key Credentials */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>8+ Years Sub-Broker Franchise Partner associated with <strong>Motilal Oswal Financial Services</strong></span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Overseeing ₹15+ Crore AUM with a disciplined, research-backed asset allocation framework</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Hands-on IPO market analysis, SIP planning, and generational wealth compounding</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={14} className="text-gold-primary shrink-0" />
                  <span>Virar West, Mumbai HQ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-black border border-gold-primary/30 transition-all text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <span>Consult Chandresh</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Founder 2: Ajay Pandey */}
          <div className="group relative rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-gold-primary/40 transition-all duration-300 overflow-hidden flex flex-col shadow-2xl">
            {/* Image Container with Top Badge Overlay */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0e0e12]">
              <img
                src="/assets/founders/ajay-pandey.jpg"
                alt="Ajay Pandey - Director & Co-Founder of AVC Dhanam Solutions"
                width="896"
                height="672"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
              
              {/* Top Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
                <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-gold-primary/40 text-gold-primary text-xs font-semibold tracking-wide shadow-lg">
                  Co-Founder &amp; Director
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/40 text-blue-400 text-xs font-medium flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  210+ Banking Syndicate
                </span>
              </div>
            </div>

            {/* Founder 2 Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div>
                {/* Identification Header */}
                <div className="mb-5 pb-4 border-b border-white/10">
                  <span className="text-gold-primary text-xs font-bold tracking-wider uppercase block mb-1">
                    Corporate Finance &amp; Debt Syndication
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Ajay Pandey
                  </h3>
                </div>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
                  Spearheads debt structuring, corporate loans, and commercial banking relationships. Dedicated to accelerating the growth of SMEs, enterprises, and developers through customized credit vehicles and seamless financial execution.
                </p>

                {/* Key Credentials */}
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Extensive tie-ups spanning <strong>210+ leading Banks &amp; NBFCs</strong> nationwide</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Specialized execution across Business Loans, LAP, Working Capital, and Construction Finance</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>Direct coordination with 10+ Chartered Accountants for end-to-end tax and audit compliance</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={14} className="text-gold-primary shrink-0" />
                  <span>Virar West, Mumbai HQ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsConsultationOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-primary/10 hover:bg-gold-primary text-gold-primary hover:text-black border border-gold-primary/30 transition-all text-xs sm:text-sm font-semibold min-h-[44px]"
                >
                  <span>Consult Ajay</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Pillars / Heritage Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-white/10">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gold-primary/10 border border-gold-primary/20 flex items-center justify-center shrink-0 text-gold-primary">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-1">Uncompromising Fiduciary Integrity</h4>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Objective, client-centric guidance. Zero product mis-selling; only structured wealth and debt solutions tailored to your risk profile.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
              <Building2 size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-1">A Unified Financial Journey</h4>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Seamless harmony between equity investments, 210+ bank loan syndications, insurance, and 10+ CA tax audit support under one roof.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm sm:text-base mb-1">Grassroots Financial Literacy</h4>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Committed partner with <strong>Avinya Care Foundation</strong> to deliver grassroots financial education and social welfare initiatives across Maharashtra.
              </p>
            </div>
          </div>
        </div>

        {/* Civic Partnership with Avinya Care Foundation Showcase */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/20 via-white/[0.02] to-transparent border border-purple-500/20 flex flex-col lg:flex-row items-center gap-6 sm:gap-8">
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wider uppercase">
              <Award size={14} />
              <span>Civic Partnership &bull; Avinya Care Foundation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-white font-bold tracking-tight">
              Dignified Financial Literacy &amp; Family Welfare at the Grassroots
            </h3>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              True wealth advisory extends beyond urban boardrooms. In strategic alliance with <strong>Avinya Care Foundation</strong>, AVC Dhanam sponsors and conducts on-ground household budgeting, small-savings awareness (बचत गट), and family healthcare security workshops across rural and semi-rural Maharashtra.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="block text-base sm:text-lg font-bold text-purple-300">5,200+</span>
                <span className="text-[10px] sm:text-xs text-gray-400">Families Reached</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="block text-base sm:text-lg font-bold text-purple-300">48+</span>
                <span className="text-[10px] sm:text-xs text-gray-400">Rural Workshops</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-center">
                <span className="block text-base sm:text-lg font-bold text-purple-300">100%</span>
                <span className="text-[10px] sm:text-xs text-gray-400">Civic Mission</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative overflow-hidden rounded-xl border border-white/10 group shadow-2xl">
            <img
              src="/assets/community/avinya-community-drive.jpg"
              alt="Avinya Care Foundation and AVC Dhanam grassroots financial literacy workshop in Maharashtra"
              width="1376"
              height="768"
              loading="lazy"
              className="w-full h-auto aspect-video object-cover filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
              <div className="text-xs text-gray-200">
                <span className="font-semibold text-purple-300">On-Ground Action:</span> Rural Household Financial Literacy Camp &bull; Palghar &amp; Thane Districts
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="news" ref={newsSectionRef} className="v1-access v1-news" aria-labelledby="news-section-title">
      <div className="v1-access__heading flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>03 — MARKET INTELLIGENCE</span>
          </div>
          <h2 id="news-section-title" className="font-serif">
            Read beyond<br />the <em>headline.</em>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mt-2">
            Live real-time Indian stock market &amp; economic intelligence, streaming continuously from premier financial sources.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void loadLiveNews()}
            disabled={isRefreshingNews}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 text-xs sm:text-sm font-medium transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
            aria-label="Refresh live stock-market news"
          >
            <RefreshCw size={14} className={isRefreshingNews ? 'animate-spin text-gold-primary' : 'text-gold-primary'} />
            <span>{isRefreshingNews ? 'Refreshing…' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      <div className="v1-pricing">
        {newsItems.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className="v1-news-card"
            onMouseEnter={(event) => gsap.to(event.currentTarget, { y: -8, duration: .3, ease: 'power3.out' })}
            onMouseLeave={(event) => gsap.to(event.currentTarget, { y: 0, duration: .4, ease: 'power3.out' })}
          >
            <div className="v1-pricing__image relative overflow-hidden bg-black/5">
              <img
                src={item.image}
                alt={item.title}
                width="480"
                height="270"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = '/assets/news/news-indian-equities.webp';
                }}
              />
            </div>
            <div className="v1-pricing__body flex flex-col justify-between p-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gold-primary font-bold px-1.5 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/20">
                      0{index + 1}
                    </span>
                    <small className="v1-news__category px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {item.category}
                    </small>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono truncate max-w-[120px]">
                    {item.source}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                  {item.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNews(item)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gold-primary hover:text-white transition-colors mt-auto pt-3 border-t border-white/5"
              >
                <span>Read insight</span>
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}

        {newsStatus === 'loading' && !newsItems.length && (
          <div className="v1-news__status col-span-full py-12 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-gold-primary" />
            <p className="text-gray-400 text-sm">Streaming live stock-market updates…</p>
          </div>
        )}

        {newsStatus === 'unavailable' && !newsItems.length && (
          <div className="v1-news__status col-span-full py-8 text-center">
            <p className="text-gray-400 text-sm mb-3">Live feed is currently syncing. Click below to reconnect.</p>
            <button
              type="button"
              onClick={() => void loadLiveNews()}
              className="px-4 py-2 rounded-xl bg-gold-primary/10 text-gold-primary border border-gold-primary/30 text-xs font-semibold"
            >
              Retry Live Sync
            </button>
          </div>
        )}
      </div>
    </section>

    <section id="calculators" ref={calculatorSectionRef} className="v1-calculator">
      <div className="v1-calculator__intro v1-calculator__reveal"><span className="v1-index">04 — FINANCIAL CALCULATORS</span><h2>Plan your wealth &<br /><em>loan projections.</em></h2><p>Explore practical financial calculations for SIP investments, home loan EMIs, lumpsum growth, and retirement planning.</p><div className="v1-calculator__trust"><Calculator size={16} /><span>Educational projections. Investment products are subject to market risks.</span></div></div>
      <div className="v1-calculator__suite v1-calculator__reveal"><div className="v1-calculator__tabs">{([['sip','SIP Calculator'],['loan','Home Loan EMI'],['lumpsum','Lumpsum Investment'],['retirement','Retirement Planning']] as const).map(([kind,label]) => <button key={kind} type="button" onClick={() => setActiveCalculator(kind)} className={activeCalculator === kind ? 'is-active' : ''}>{label}</button>)}</div><div className="v1-calculator__panel">
        <div className="v1-calculator__controls">
          {activeCalculator === 'sip' && <><label>Monthly investment <strong>₹{monthlyInvestment.toLocaleString('en-IN')}</strong><input aria-label="Monthly investment" type="range" min="500" max="100000" step="500" value={monthlyInvestment} style={rangeStyle(monthlyInvestment,500,100000)} onChange={(event) => setMonthlyInvestment(Number(event.target.value))} /></label><label>Expected return <strong>{annualReturn}% p.a.</strong><input aria-label="Expected return rate" type="range" min="1" max="30" value={annualReturn} style={rangeStyle(annualReturn,1,30)} onChange={(event) => setAnnualReturn(Number(event.target.value))} /></label><label>Investment period <strong>{investmentYears} years</strong><input aria-label="Investment period" type="range" min="1" max="40" value={investmentYears} style={rangeStyle(investmentYears,1,40)} onChange={(event) => setInvestmentYears(Number(event.target.value))} /></label></>}
          {activeCalculator === 'loan' && <><label>Loan amount <strong>₹{loanAmount.toLocaleString('en-IN')}</strong><input aria-label="Loan amount" type="range" min="100000" max="20000000" step="100000" value={loanAmount} style={rangeStyle(loanAmount,100000,20000000)} onChange={(event) => setLoanAmount(Number(event.target.value))} /></label><label>Interest rate <strong>{loanRate}% p.a.</strong><input aria-label="Loan interest rate" type="range" min="5" max="15" step=".1" value={loanRate} style={rangeStyle(loanRate,5,15)} onChange={(event) => setLoanRate(Number(event.target.value))} /></label><label>Loan tenure <strong>{loanYears} years</strong><input aria-label="Loan tenure" type="range" min="1" max="30" value={loanYears} style={rangeStyle(loanYears,1,30)} onChange={(event) => setLoanYears(Number(event.target.value))} /></label></>}
          {activeCalculator === 'lumpsum' && <><label>Investment amount <strong>₹{lumpsumAmount.toLocaleString('en-IN')}</strong><input aria-label="Lumpsum amount" type="range" min="10000" max="10000000" step="10000" value={lumpsumAmount} style={rangeStyle(lumpsumAmount,10000,10000000)} onChange={(event) => setLumpsumAmount(Number(event.target.value))} /></label><label>Expected return <strong>{lumpsumRate}% p.a.</strong><input aria-label="Lumpsum return rate" type="range" min="1" max="30" value={lumpsumRate} style={rangeStyle(lumpsumRate,1,30)} onChange={(event) => setLumpsumRate(Number(event.target.value))} /></label><label>Investment period <strong>{lumpsumYears} years</strong><input aria-label="Lumpsum period" type="range" min="1" max="40" value={lumpsumYears} style={rangeStyle(lumpsumYears,1,40)} onChange={(event) => setLumpsumYears(Number(event.target.value))} /></label></>}
          {activeCalculator === 'retirement' && <><label>Current monthly expense <strong>₹{monthlyExpense.toLocaleString('en-IN')}</strong><input aria-label="Current monthly expense" type="range" min="10000" max="500000" step="5000" value={monthlyExpense} style={rangeStyle(monthlyExpense,10000,500000)} onChange={(event) => setMonthlyExpense(Number(event.target.value))} /></label><label>Expected inflation <strong>{inflationRate}% p.a.</strong><input aria-label="Expected inflation" type="range" min="2" max="12" step=".5" value={inflationRate} style={rangeStyle(inflationRate,2,12)} onChange={(event) => setInflationRate(Number(event.target.value))} /></label><label>Years to retirement <strong>{retirementYears} years</strong><input aria-label="Years to retirement" type="range" min="1" max="40" value={retirementYears} style={rangeStyle(retirementYears,1,40)} onChange={(event) => setRetirementYears(Number(event.target.value))} /></label></>}
        </div>
        <div className="v1-calculator__result">{activeCalculator === 'sip' && <><small>Estimated maturity value</small><strong className="v1-calculator__value">₹{Math.round(maturityValue).toLocaleString('en-IN')}</strong><div className="v1-calculator__bar"><i style={{ width: `${Math.min(100,(investedValue/maturityValue)*100)}%` }} /><span /></div><div className="v1-calculator__legend"><span><i /> Total Invested ₹{investedValue.toLocaleString('en-IN')}</span><span><i /> Est. Growth ₹{Math.round(maturityValue-investedValue).toLocaleString('en-IN')}</span></div></>}{activeCalculator === 'loan' && <><small>Estimated monthly EMI</small><strong className="v1-calculator__value">₹{Math.round(monthlyEmi).toLocaleString('en-IN')}</strong><div className="v1-calculator__bar"><i style={{width:`${Math.min(100,(loanAmount/(monthlyEmi*loanMonths))*100)}%`}} /><span /></div><div className="v1-calculator__legend"><span><i /> Principal ₹{loanAmount.toLocaleString('en-IN')}</span><span><i /> Total Interest ₹{Math.round(monthlyEmi*loanMonths-loanAmount).toLocaleString('en-IN')}</span></div></>}{activeCalculator === 'lumpsum' && <><small>Estimated future value</small><strong className="v1-calculator__value">₹{Math.round(lumpsumValue).toLocaleString('en-IN')}</strong><div className="v1-calculator__bar"><i style={{width:`${Math.min(100,(lumpsumAmount/lumpsumValue)*100)}%`}} /><span /></div><div className="v1-calculator__legend"><span><i /> Total Invested ₹{lumpsumAmount.toLocaleString('en-IN')}</span><span><i /> Est. Growth ₹{Math.round(lumpsumValue-lumpsumAmount).toLocaleString('en-IN')}</span></div></>}{activeCalculator === 'retirement' && <><small>Indicative retirement corpus</small><strong className="v1-calculator__value">₹{Math.round(retirementCorpus).toLocaleString('en-IN')}</strong><div className="v1-calculator__bar"><i style={{width:'66%'}} /><span /></div><div className="v1-calculator__legend"><span><i /> Future Monthly Expense ₹{Math.round(futureMonthlyExpense).toLocaleString('en-IN')}</span><span><i /> 25-Year Corpus Requirement</span></div></>}<button type="button" onClick={() => setIsConsultationOpen(true)} className="v1-calculator__cta">Discuss Your Requirement <ArrowUpRight size={17} /></button></div>
      </div></div>
    </section>
    <LiveMarketOverview />
    <HomeEbooksSection />
    <ScreenerGateway />
    <Testimonials />
    <FAQ />
    <V1Footer />
    <ContactFormModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />
    {selectedService && <div className="v1-service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title" onMouseDown={() => setSelectedService(null)}><div className="v1-service-modal__panel" onMouseDown={event => event.stopPropagation()}><button type="button" className="v1-service-modal__close" aria-label="Close service details" onClick={() => setSelectedService(null)}><X size={19} /></button><div className="v1-service-modal__icon">{(() => { const Icon = selectedService[1]; return <Icon size={26} />; })()}</div><p>AVC DHANAM SOLUTIONS · FINANCIAL SERVICE</p><h2 id="service-modal-title">{selectedService[0]}</h2><div className="v1-service-modal__line" /><p className="v1-service-modal__description">{selectedService[2]}</p><button type="button" onClick={() => { setSelectedService(null); setIsConsultationOpen(true); }}>Discuss this service <ArrowUpRight size={17} /></button></div></div>}
    {selectedNews && <div className="v1-modal" role="dialog" aria-modal="true" aria-labelledby="news-modal-title" onMouseDown={() => setSelectedNews(null)}><div className="v1-modal__panel" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="v1-modal__close" aria-label="Close article" onClick={() => setSelectedNews(null)}><X size={19} /></button><div className="v1-modal__image"><img src={selectedNews.image} alt={selectedNews.title} /></div><div className="v1-modal__content"><small>{selectedNews.category} · {selectedNews.source}</small><h2 id="news-modal-title">{selectedNews.title}</h2><p>{selectedNews.details}</p><div className="v1-modal__actions"><button type="button" onClick={() => setSelectedNews(null)}>Close</button>{selectedNews.link !== '#' && <a href={selectedNews.link} target="_blank" rel="noreferrer">Read original <ExternalLink size={15} /></a>}</div></div></div></div>}
  </main>;
}
