import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, BarChart3, Calculator, ChevronRight, ExternalLink, Layers3, LockKeyhole, Sparkles, Target, TrendingUp, X } from 'lucide-react';
import TradingViewTicker from './TradingViewTicker';
import ContactFormModal from './ContactFormModal';
import LiveMarketOverview from './LiveMarketOverview';
import HomeEbooksSection from './HomeEbooksSection';
import ScreenerGateway from './ScreenerGateway';
import FAQ from './FAQ';
import { V1Footer, V1Nav } from './V1SiteChrome';

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

gsap.registerPlugin(ScrollTrigger);

function ActionButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button type="button" className="v1-action" onClick={onClick}>{children}<span><ArrowUpRight size={18} /></span></button>;
}

export default function V1Landing() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsStatus, setNewsStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
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

  useEffect(() => {
    const apiToken = import.meta.env.VITE_MARKETAUX_API_KEY;
    if (!apiToken) { setNewsStatus('unavailable'); return; }
    const controller = new AbortController();
    const loadNews = async () => {
      try {
        setNewsStatus('loading');
        const params = new URLSearchParams({ api_token: apiToken, language: 'en', limit: '24', search: 'stock market' });
        const isJson = (response: Response) => response.ok && response.headers.get('content-type')?.includes('application/json');
        let response = await fetch(`/api/news/live?${params}`, { signal: controller.signal });
        if (!isJson(response)) response = await fetch(import.meta.env.DEV ? `/api/marketaux/v1/news/all?${params}` : `/api/marketaux.php?${params}`, { signal: controller.signal });
        if (!isJson(response)) response = await fetch(import.meta.env.DEV ? '/api/yahoo/v1/finance/search?q=NIFTY&newsCount=24' : '/api/yahoo-news.php?q=NIFTY', { signal: controller.signal });
        if (!isJson(response)) throw new Error('News service unavailable');
        const payload = await response.json() as { data?: Array<Record<string, unknown>>; news?: Array<Record<string, unknown>> };
        const providerItems = payload.data ?? (payload.news ?? []).map(item => ({ title: item.title, description: item.summary, image_url: (item.thumbnail as { resolutions?: Array<{ url?: string }> } | undefined)?.resolutions?.[0]?.url, url: item.link, source: item.publisher }));
        const items = providerItems.map((item): NewsItem | null => {
          const details = String(item.description ?? item.snippet ?? '').replace(/<[^>]*>?/gm, '').trim();
          const image = typeof item.image_url === 'string' ? item.image_url.trim() : '';
          const title = String(item.title ?? '').trim();
          const stockTerms = /stock|share|equity|market|nifty|sensex|nasdaq|dow|earnings|ipo|trading|index/i;
          if (!title || !image || !stockTerms.test(`${title} ${details}`)) return null;
          return { category: typeof item.source === 'string' ? item.source : 'Market update', image, title, text: details.slice(0, 120) || 'Latest market reporting and perspective.', details: details || 'The source did not provide a full description for this update.', link: typeof item.url === 'string' ? item.url : '#', source: typeof item.source === 'string' ? item.source : 'Marketaux' };
        }).filter((item): item is NewsItem => item !== null).slice(0, 3);
        setNewsItems(items);
        setNewsStatus('ready');
      } catch {
        if (!controller.signal.aborted) setNewsStatus('unavailable');
      }
    };
    void loadNews();
    const refreshId = window.setInterval(() => void loadNews(), 60 * 60 * 1000);
    return () => { controller.abort(); window.clearInterval(refreshId); };
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
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedNews(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return <main className="v1-site">
    <V1Nav ref={navRef} home />
    <section className="v1-hero">
      <div className="v1-hero__image" />
      <div className="v1-hero__create">DHANAM</div>
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
      <div className="v1-scroll">SCROLL TO DISCOVER <span /></div>
    </section>

    <section id="markets" ref={tickerRef} className="v1-ticker-only" aria-label="Live market ticker"><div className="v1-ticker-only__label"><i />LIVE MARKETS</div><div className="v1-ticker-only__feed"><TradingViewTicker /></div><span className="v1-ticker-only__scan" aria-hidden="true" /></section>

    <section id="system" className="v1-features"><div className="v1-features__intro"><span className="v1-index">01 — COMPLETE FINANCIAL SERVICES</span><h2>A Complete Financial Journey,<br /><em>Under One Roof.</em></h2><p>Integrated wealth management, loan solutions, corporate tax advisory, and risk protection under one roof.</p><div className="v1-tool-list">{tools.map(([label, Icon, description], index) => <button type="button" key={label} onClick={() => setSelectedService([label, Icon, description] as Service)} aria-label={`Learn more about ${label}`}><Icon size={17} /><span>0{index + 1}</span>{label}<ChevronRight size={15} className="v1-tool-list__arrow" /></button>)}</div></div><div className="v1-analysis"><img src="/assets/v1/financial-dashboard-hd.jpg" alt="Financial consultancy research dashboard" /><div className="v1-analysis__glass"><div><span>Consultancy Architecture</span><b>Synchronised</b></div><p>Investment & Portfolio Alignment</p><div className="v1-progress"><i style={{ width: '92%' }} /></div><p>Financing & Loan Structure</p><div className="v1-progress"><i style={{ width: '85%' }} /></div><small><span /> 210+ Bank & NBFC Relationships Active</small></div></div></section>

    <section id="approach" className="v1-productivity"><div className="v1-productivity__grid" /><div className="v1-productivity__copy"><span className="v1-index">02 — ABOUT AVC DHANAM SOLUTIONS</span><h2>8+ Years of Financial Excellence.</h2><p>Founded and led by Directors <strong>Chandresh Pandey</strong> & <strong>Ajay Pandey</strong> in Virar West, Mumbai.</p><div className="v1-steps"><div><b>01</b><span><strong>Personalized Strategic Planning</strong>Goal-oriented wealth & financing plans tailored to your needs.</span></div><div><b>02</b><span><strong>End-to-End Execution & Network</strong>Direct ties with top mutual funds, 210+ banks, and 10+ CAs.</span></div></div></div><div className="v1-window"><div className="v1-window__top"><i /><i /><i /><span>avc / corporate_credentials / 2026</span></div><div className="v1-code"><p><span>01</span> company <b>=</b> "AVC Dhanam Solutions Pvt. Ltd."</p><p><span>02</span> directors <b>=</b> ["Chandresh Pandey", "Ajay Pandey"]</p><p><span>03</span> location <b>=</b> "Virar West, Mumbai Region"</p><p><span>04</span> credentials <b>=</b> "8+ Yrs | 500+ Clients | ₹15+ Cr AUM"</p><p><span>05</span> literacy_partner <b>=</b> "Avinya Care Foundation"</p></div><div className="v1-status"><i /> Financial Consultancy System Online</div></div></section>

    <section id="news" ref={newsSectionRef} className="v1-access v1-news"><div className="v1-access__heading"><span className="v1-index">03 — MARKET INTELLIGENCE</span><h2>Read beyond<br />the <em>headline.</em></h2><p>Live stock-market reporting and financial updates, refreshed automatically every hour.</p></div><div className="v1-pricing">{newsItems.map((item, index) => <article key={item.title} className="v1-news-card" onMouseEnter={(event) => gsap.to(event.currentTarget, { y: -10, duration: .35, ease: 'power3.out' })} onMouseLeave={(event) => gsap.to(event.currentTarget, { y: 0, duration: .45, ease: 'power3.out' })}><div className="v1-pricing__image"><img src={item.image} alt={item.title} loading="lazy" /><span>0{index + 1}</span></div><div className="v1-pricing__body"><small className="v1-news__category">{item.category}</small><h3>{item.title}</h3><p>{item.text}</p><button type="button" onClick={() => setSelectedNews(item)}>Read insight<ArrowUpRight size={17} /></button></div></article>)}{newsStatus !== 'ready' && <div className="v1-news__status">{newsStatus === 'loading' ? 'Loading live stock-market news…' : 'Live stock-market news is unavailable right now.'}</div>}{newsStatus === 'ready' && !newsItems.length && <div className="v1-news__status">No stock-market stories are available right now. The feed will refresh automatically.</div>}</div></section>

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
    <FAQ />
    <V1Footer />
    <ContactFormModal isOpen={isConsultationOpen} onClose={() => setIsConsultationOpen(false)} />
    {selectedService && <div className="v1-service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title" onMouseDown={() => setSelectedService(null)}><div className="v1-service-modal__panel" onMouseDown={event => event.stopPropagation()}><button type="button" className="v1-service-modal__close" aria-label="Close service details" onClick={() => setSelectedService(null)}><X size={19} /></button><div className="v1-service-modal__icon">{(() => { const Icon = selectedService[1]; return <Icon size={26} />; })()}</div><p>AVC DHANAM SOLUTIONS · FINANCIAL SERVICE</p><h2 id="service-modal-title">{selectedService[0]}</h2><div className="v1-service-modal__line" /><p className="v1-service-modal__description">{selectedService[2]}</p><button type="button" onClick={() => { setSelectedService(null); setIsConsultationOpen(true); }}>Discuss this service <ArrowUpRight size={17} /></button></div></div>}
    {selectedNews && <div className="v1-modal" role="dialog" aria-modal="true" aria-labelledby="news-modal-title" onMouseDown={() => setSelectedNews(null)}><div className="v1-modal__panel" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="v1-modal__close" aria-label="Close article" onClick={() => setSelectedNews(null)}><X size={19} /></button><div className="v1-modal__image"><img src={selectedNews.image} alt={selectedNews.title} /></div><div className="v1-modal__content"><small>{selectedNews.category} · {selectedNews.source}</small><h2 id="news-modal-title">{selectedNews.title}</h2><p>{selectedNews.details}</p><div className="v1-modal__actions"><button type="button" onClick={() => setSelectedNews(null)}>Close</button>{selectedNews.link !== '#' && <a href={selectedNews.link} target="_blank" rel="noreferrer">Read original <ExternalLink size={15} /></a>}</div></div></div></div>}
  </main>;
}
