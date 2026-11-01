import { forwardRef, useEffect, useState } from 'react';
import { ArrowUpRight, Award, BookOpen, Clock, ExternalLink, Mail, MapPin, Menu, Phone, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react';
import ContactFormModal from './ContactFormModal';
import RegulatoryDisclaimer from './RegulatoryDisclaimer';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

type NavProps = { home?: boolean };

export const V1Nav = forwardRef<HTMLElement, NavProps>(function V1Nav({ home = false }, ref) {
  const toHomeSection = (id: string) => home ? `#${id}` : `/#${id}`;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useBodyScrollLock(isMobileMenuOpen);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.documentElement.classList.add('mobile-nav-open');
    } else {
      document.documentElement.classList.remove('mobile-nav-open');
    }
    return () => {
      document.documentElement.classList.remove('mobile-nav-open');
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const closeMobile = () => setIsMobileMenuOpen(false);
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return <>
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300] focus:px-4 focus:py-2.5 focus:bg-[#D4AF37] focus:text-black focus:font-bold focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-white focus:outline-none"
    >
      Skip to main content
    </a>
    <nav ref={ref} className="v1-nav" aria-label="Main Navigation">
      <a href="/" onClick={closeMobile} className="v1-logo" aria-label="AVC Dhanam Solutions Home">
        <img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions Pvt. Ltd." width="140" height="40" />
      </a>

      <div className="v1-nav__links">
        <a href={toHomeSection('markets')} className={currentPath === '/' ? 'v1-nav__link--active' : ''}>Markets</a>
        <a href={toHomeSection('system')}>Services</a>
        <a href="/ipo" className={currentPath.startsWith('/ipo') ? 'v1-nav__link--active' : ''}>IPOs</a>
        <a href="/ebooks" className={currentPath.startsWith('/ebooks') ? 'v1-nav__link--active' : ''}>E-Books</a>
        <a href={toHomeSection('approach')}>About Us</a>
        <a href={toHomeSection('calculators')}>Calculators</a>
        <a href={toHomeSection('news')}>Insights</a>
        <a href={toHomeSection('testimonials')}>Testimonials</a>
        <a href={toHomeSection('faq')}>FAQ</a>
        <a className={`v1-nav__screener ${currentPath.startsWith('/screener') ? 'v1-nav__link--active' : ''}`} href="/screener">Screener <Sparkles size={13} /></a>
      </div>

      <div className="v1-nav__right">
        <div className="v1-mobile-nav-chips hidden sm:flex lg:hidden items-center gap-1.5 mr-1">
          <a
            href="/ipo"
            onClick={closeMobile}
            className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm min-h-[36px] active:scale-[0.98]"
          >
            <TrendingUp size={12} /> IPOs
          </a>
          <a
            href="/ebooks"
            onClick={closeMobile}
            className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm min-h-[36px] active:scale-[0.98]"
          >
            <BookOpen size={12} /> E-Books
          </a>
        </div>

        <button 
          type="button" 
          onClick={() => { closeMobile(); setIsContactOpen(true); }} 
          className="v1-action v1-nav__cta min-h-[44px] active:scale-[0.98]"
          aria-label="Start your financial journey with a consultant"
        >
          <span className="v1-nav__cta-text">Start Journey</span>
          <span className="v1-nav__cta-icon"><ArrowUpRight size={17} /></span>
        </button>

        <button 
          type="button" 
          className="v1-mobile-toggle min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-[0.95]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="v1-mobile-menu-drawer"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>

    {isMobileMenuOpen && (
      <div id="v1-mobile-menu-drawer" className="v1-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile Navigation Drawer">
        <div className="v1-mobile-menu__backdrop" onClick={closeMobile} />
        <div className="v1-mobile-menu__panel">
          <div className="v1-mobile-menu__links">
            <a href={toHomeSection('markets')} onClick={closeMobile}>Live Markets</a>
            <a href={toHomeSection('system')} onClick={closeMobile}>Financial Services</a>
            <a href="/ipo" onClick={closeMobile} className={`flex items-center justify-between text-[#D4AF37] ${currentPath.startsWith('/ipo') ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40' : ''}`}>
              IPOs <TrendingUp size={15} />
            </a>
            <a href="/ebooks" onClick={closeMobile} className={`flex items-center justify-between text-[#D4AF37] ${currentPath.startsWith('/ebooks') ? 'bg-[#D4AF37]/15 border-[#D4AF37]/40' : ''}`}>
              Stock Market E-Books <BookOpen size={15} />
            </a>
            <a href={toHomeSection('approach')} onClick={closeMobile}>About AVC Dhanam</a>
            <a href={toHomeSection('calculators')} onClick={closeMobile}>Wealth Calculators</a>
            <a href={toHomeSection('news')} onClick={closeMobile}>Insights & Articles</a>
            <a href={toHomeSection('testimonials')} onClick={closeMobile}>Testimonials</a>
            <a href={toHomeSection('faq')} onClick={closeMobile}>FAQ & Guidance</a>
            <a href="/screener" onClick={closeMobile} className="v1-mobile-menu__screener">
              Market Screener <Sparkles size={14} />
            </a>
          </div>
          <div className="v1-mobile-menu__footer">
            <button 
              type="button" 
              onClick={() => { closeMobile(); setIsContactOpen(true); }} 
              className="v1-mobile-menu__btn"
            >
              Talk to a Consultant <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    )}

    <ContactFormModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
  </>;
});

export function V1Footer() {
  const year = new Date().getFullYear();
  const [legalItem, setLegalItem] = useState<'privacy' | 'terms' | 'disclosures' | null>(null);
  useBodyScrollLock(Boolean(legalItem));

  const legalContent = {
    privacy: { title: 'Privacy Policy', text: 'AVC Dhanam Solutions Pvt. Ltd. respects your privacy. We collect personal and financial information solely to provide financial consultancy, loan facilitation, investment distribution, and regulatory compliance services. We do not sell or rent client data to third parties. All client data is handled securely in accordance with applicable Indian data protection guidelines.' },
    terms: { title: 'Terms of Service', text: 'All information provided on this website by AVC Dhanam Solutions Pvt. Ltd. is for educational and consultancy guidance purposes. Website content does not constitute binding investment advice or guaranteed financial returns. Financial products including mutual funds, stocks, and insurance are subject to market and underwriting risks. Clients are advised to read all scheme documents and loan terms carefully before entering into any transaction.' },
    disclosures: { title: 'Regulatory & Operational Disclosures', text: 'AVC Dhanam Solutions Pvt. Ltd. operates as a financial consultancy firm. We are an AMFI-registered Mutual Fund Distributor (ARN-184920) and have operated an authorized sub-broker franchise associated with Motilal Oswal Financial Services for approximately 8 years. Financing solutions are facilitated through relationships across 210+ partner Banks and NBFCs based on client eligibility. Corporate tax and accounting services are provided in coordination with a network of 10+ qualified Chartered Accountants. Merchant banking services are facilitated via experienced partner channels. AVC Dhanam Solutions Pvt. Ltd. does not issue fixed or guaranteed return schemes.' }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && legalItem) {
        setLegalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [legalItem]);

  const openLegal = (item: 'privacy' | 'terms' | 'disclosures') => (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); setLegalItem(item); };
  return <footer className="v1-footer">
    <div className="v1-footer__masthead">
      <div>
        <p>A Complete Financial Journey Under One Roof</p>
        <h2>Ready to build your<br /><em>financial future?</em></h2>
      </div>
      <a href="tel:+917030247878" aria-label="Call +91 7030247878 to speak with a financial consultant">Talk to a Financial Consultant <ArrowUpRight size={17} /></a>
    </div>
    <div className="v1-footer__grid">
      <div className="v1-footer__brand">
        <a href="/" className="v1-logo" aria-label="AVC Dhanam Solutions Home">
          <img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions Pvt. Ltd." width="160" height="48" loading="lazy" />
        </a>
        <p>AVC Dhanam Solutions Pvt. Ltd. is a trusted financial consultancy in Virar West, Mumbai Metropolitan Region. Operating for 8+ years under Directors Chandresh Pandey and Ajay Pandey, we provide investments, loans, insurance, tax services, and business funding under one roof.</p>
        <ul>
          <li><MapPin size={15} className="shrink-0" /><span className="break-words">210, Second Floor, Global Plaza, Global City, Virar West, Maharashtra – 401305</span></li>
          <li><Phone size={15} className="shrink-0" /><a href="tel:+917030247878">+91 7030247878</a></li>
          <li><Mail size={15} className="shrink-0" /><a href="mailto:support@avcdhanam.com" className="break-all">support@avcdhanam.com</a></li>
          <li><Clock size={15} className="shrink-0" /><span>Mon – Sat · 9:30 AM – 6:30 PM (IST)</span></li>
        </ul>
      </div>
      <div className="v1-footer__link-group">
        <h4>Explore</h4>
        <a href="/#system">Services Suite</a>
        <a href="/#approach">About AVC Dhanam</a>
        <a href="/#markets">Live Markets</a>
        <a href="/#calculators">Calculators</a>
        <a href="/#testimonials">Testimonials</a>
        <a href="/ebooks">Stock Market E-Books</a>
        <a href="/#faq">FAQ & Guidance</a>
        <a href="/screener">Market Screener</a>
      </div>
      <div className="v1-footer__link-group">
        <h4>Solutions</h4>
        <a href="/#system">Mutual Funds & SIP</a>
        <a href="/#system">Business & Home Loans</a>
        <a href="/#system">Life & Health Insurance</a>
        <a href="/#system">Tax Planning & CA Support</a>
        <a href="/#system">Merchant Banking & Funding</a>
        <a href="/#system">Retirement & Literacy</a>
      </div>
      <div className="v1-footer__registration">
        <h4>Credentials & Trust</h4>
        <div className="v1-footer__credential-list">
          <p>
            <ShieldCheck size={17} className="shrink-0" />
            <span>
              <b>Motilal Oswal Franchise Partner</b>
              <small>8+ Years Sub-Broker Association</small>
              <strong>Franchise Network</strong>
            </span>
          </p>
          <p>
            <Award size={17} className="shrink-0" />
            <span>
              <b>AMFI Mutual Fund Distributor</b>
              <small>AMFI Registration Number</small>
              <strong>ARN-184920</strong>
            </span>
          </p>
        </div>
        <a href="/sitemap.xml" target="_blank" rel="noreferrer">View XML sitemap <ExternalLink size={13} /></a>
      </div>
    </div>
    <RegulatoryDisclaimer variant="compact" />
    <div className="v1-footer__bottom">
      <span>© {year} AVC Dhanam Solutions Pvt. Ltd. All rights reserved. Directors: Chandresh Pandey & Ajay Pandey.</span>
      <div>
        <a href="#privacy" onClick={openLegal('privacy')}>Privacy Policy</a>
        <a href="#terms" onClick={openLegal('terms')}>Terms of Service</a>
        <a href="#disclosures" onClick={openLegal('disclosures')}>Disclosures</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
    {legalItem && (
      <div className="v1-legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" onMouseDown={() => setLegalItem(null)}>
        <div className="v1-legal-modal__panel" onMouseDown={event => event.stopPropagation()}>
          <button type="button" aria-label="Close legal notice" onClick={() => setLegalItem(null)} className="min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={18} />
          </button>
          <p>AVC DHANAM SOLUTIONS · LEGAL NOTICE</p>
          <h2 id="legal-modal-title">{legalContent[legalItem].title}</h2>
          <div />
          <span>{legalContent[legalItem].text}</span>
          <a href="mailto:support@avcdhanam.com">Questions? Contact support@avcdhanam.com <ArrowUpRight size={15} /></a>
        </div>
      </div>
    )}
  </footer>;
}

