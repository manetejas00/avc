import { forwardRef, useEffect, useState } from 'react';
import { ArrowUpRight, Award, Clock, ExternalLink, Mail, MapPin, Menu, Moon, Phone, ShieldCheck, Sparkles, Sun, X } from 'lucide-react';
import ContactFormModal from './ContactFormModal';
import RegulatoryDisclaimer from './RegulatoryDisclaimer';
import { useTheme } from '../context/ThemeContext';

type NavProps = { home?: boolean };

export const V1Nav = forwardRef<HTMLElement, NavProps>(function V1Nav({ home = false }, ref) {
  const toHomeSection = (id: string) => home ? `#${id}` : `/#${id}`;
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobile = () => setIsMobileMenuOpen(false);

  return <>
    <nav ref={ref} className="v1-nav">
      <a href="/" onClick={closeMobile} className="v1-logo" aria-label="AVC Dhanam Solutions Home">
        <img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions Pvt. Ltd." />
      </a>

      <div className="v1-nav__links">
        <a href={toHomeSection('markets')}>Markets</a>
        <a href={toHomeSection('system')}>Services</a>
        <a href={toHomeSection('approach')}>About Us</a>
        <a href={toHomeSection('calculators')}>Calculators</a>
        <a href={toHomeSection('news')}>Insights</a>
        <a href={toHomeSection('faq')}>FAQ</a>
        <a className="v1-nav__screener" href="/screener">Screener <Sparkles size={13} /></a>
      </div>

      <div className="v1-nav__right">
        <button 
          type="button" 
          onClick={toggleTheme} 
          className="v1-theme-toggle" 
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button 
          type="button" 
          onClick={() => { closeMobile(); setIsContactOpen(true); }} 
          className="v1-action v1-nav__cta"
        >
          <span className="v1-nav__cta-text">Start Journey</span>
          <span className="v1-nav__cta-icon"><ArrowUpRight size={17} /></span>
        </button>

        <button 
          type="button" 
          className="v1-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="v1-mobile-menu" role="dialog" aria-modal="true">
          <div className="v1-mobile-menu__backdrop" onClick={closeMobile} />
          <div className="v1-mobile-menu__panel">
            <div className="v1-mobile-menu__links">
              <a href={toHomeSection('markets')} onClick={closeMobile}>Live Markets</a>
              <a href={toHomeSection('system')} onClick={closeMobile}>Financial Services</a>
              <a href={toHomeSection('approach')} onClick={closeMobile}>About AVC Dhanam</a>
              <a href={toHomeSection('calculators')} onClick={closeMobile}>Wealth Calculators</a>
              <a href={toHomeSection('news')} onClick={closeMobile}>Insights & Articles</a>
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
    </nav>
    <ContactFormModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
  </>;
});

export function V1Footer() {
  const year = new Date().getFullYear();
  const [legalItem, setLegalItem] = useState<'privacy' | 'terms' | 'disclosures' | null>(null);
  const legalContent = {
    privacy: { title: 'Privacy Policy', text: 'AVC Dhanam Solutions Pvt. Ltd. respects your privacy. We collect personal and financial information solely to provide financial consultancy, loan facilitation, investment distribution, and regulatory compliance services. We do not sell or rent client data to third parties. All client data is handled securely in accordance with applicable Indian data protection guidelines.' },
    terms: { title: 'Terms of Service', text: 'All information provided on this website by AVC Dhanam Solutions Pvt. Ltd. is for educational and consultancy guidance purposes. Website content does not constitute binding investment advice or guaranteed financial returns. Financial products including mutual funds, stocks, and insurance are subject to market and underwriting risks. Clients are advised to read all scheme documents and loan terms carefully before entering into any transaction.' },
    disclosures: { title: 'Regulatory & Operational Disclosures', text: 'AVC Dhanam Solutions Pvt. Ltd. operates as a financial consultancy firm. We are an AMFI-registered Mutual Fund Distributor (ARN-184920) and have operated an authorized sub-broker franchise associated with Motilal Oswal Financial Services for approximately 8 years. Financing solutions are facilitated through relationships across 210+ partner Banks and NBFCs based on client eligibility. Corporate tax and accounting services are provided in coordination with a network of 10+ qualified Chartered Accountants. Merchant banking services are facilitated via experienced partner channels. AVC Dhanam Solutions Pvt. Ltd. does not issue fixed or guaranteed return schemes.' }
  };
  const openLegal = (item: 'privacy' | 'terms' | 'disclosures') => (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); setLegalItem(item); };
  return <footer className="v1-footer">
    <div className="v1-footer__masthead"><div><p>A Complete Financial Journey Under One Roof</p><h2>Ready to build your<br /><em>financial future?</em></h2></div><a href="tel:+917030247878">Talk to a Financial Consultant <ArrowUpRight size={17} /></a></div>
    <div className="v1-footer__grid">
      <div className="v1-footer__brand"><a href="/" className="v1-logo" aria-label="AVC Dhanam Solutions Home"><img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions Pvt. Ltd." /></a><p>AVC Dhanam Solutions Pvt. Ltd. is a trusted financial consultancy in Virar West, Mumbai Metropolitan Region. Operating for 8+ years under Directors Chandresh Pandey and Ajay Pandey, we provide investments, loans, insurance, tax services, and business funding under one roof.</p><ul><li><MapPin size={15} />210, Second Floor, Global Plaza, Global City, Virar West, Maharashtra – 401305</li><li><Phone size={15} /><a href="tel:+917030247878">+91 7030247878</a></li><li><Mail size={15} /><a href="mailto:support@avcdhanam.com">support@avcdhanam.com</a></li><li><Clock size={15} />Mon – Sat · 9:30 AM – 6:30 PM (IST)</li></ul></div>
      <div className="v1-footer__link-group"><h4>Explore</h4><a href="/#system">Services Suite</a><a href="/#approach">About AVC Dhanam</a><a href="/#markets">Live Markets</a><a href="/#calculators">Calculators</a><a href="/#faq">FAQ & Guidance</a><a href="/screener">Market Screener</a></div>
      <div className="v1-footer__link-group"><h4>Solutions</h4><a href="/#system">Mutual Funds & SIP</a><a href="/#system">Business & Home Loans</a><a href="/#system">Life & Health Insurance</a><a href="/#system">Tax Planning & CA Support</a><a href="/#system">Merchant Banking & Funding</a><a href="/#system">Retirement & Literacy</a></div>
      <div className="v1-footer__registration"><h4>Credentials & Trust</h4><div className="v1-footer__credential-list"><p><ShieldCheck size={17} /><span><b>Motilal Oswal Franchise Partner</b><small>8+ Years Sub-Broker Association</small><strong>Franchise Network</strong></span></p><p><Award size={17} /><span><b>AMFI Mutual Fund Distributor</b><small>AMFI Registration Number</small><strong>ARN-184920</strong></span></p></div><a href="/sitemap.xml" target="_blank" rel="noreferrer">View XML sitemap <ExternalLink size={13} /></a></div>
    </div>
    <RegulatoryDisclaimer variant="compact" />
    <div className="v1-footer__bottom"><span>© {year} AVC Dhanam Solutions Pvt. Ltd. All rights reserved. Directors: Chandresh Pandey & Ajay Pandey.</span><div><a href="#privacy" onClick={openLegal('privacy')}>Privacy Policy</a><a href="#terms" onClick={openLegal('terms')}>Terms of Service</a><a href="#disclosures" onClick={openLegal('disclosures')}>Disclosures</a><a href="/sitemap.xml">Sitemap</a></div></div>
    {legalItem && <div className="v1-legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" onMouseDown={() => setLegalItem(null)}><div className="v1-legal-modal__panel" onMouseDown={event => event.stopPropagation()}><button type="button" aria-label="Close" onClick={() => setLegalItem(null)}><X size={18} /></button><p>AVC DHANAM SOLUTIONS · LEGAL NOTICE</p><h2 id="legal-modal-title">{legalContent[legalItem].title}</h2><div /><span>{legalContent[legalItem].text}</span><a href="mailto:support@avcdhanam.com">Questions? Contact support@avcdhanam.com <ArrowUpRight size={15} /></a></div></div>}
  </footer>;
}

