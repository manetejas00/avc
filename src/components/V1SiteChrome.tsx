import { forwardRef, useState } from 'react';
import { ArrowUpRight, Award, Clock, ExternalLink, Mail, MapPin, Phone, ShieldCheck, Sparkles, X } from 'lucide-react';
import ContactFormModal from './ContactFormModal';

type NavProps = { home?: boolean };

export const V1Nav = forwardRef<HTMLElement, NavProps>(function V1Nav({ home = false }, ref) {
  const toHomeSection = (id: string) => home ? `#${id}` : `/#${id}`;
  const [isContactOpen, setIsContactOpen] = useState(false);
  return <>
    <nav ref={ref} className="v1-nav">
      <a href="/" className="v1-logo" aria-label="AVC Dhanam home"><img src="/logo_gold_transparent.svg" alt="AVC Dhanam" /></a>
      <div className="v1-nav__links">
        <a href={toHomeSection('markets')}>Markets</a><a href={toHomeSection('system')}>System</a><a href={toHomeSection('calculators')}>Calculators</a><a href={toHomeSection('news')}>Insights</a>
        <a className="v1-nav__screener" href="/screener">Screener <Sparkles size={13} /></a>
      </div>
      <button type="button" onClick={() => setIsContactOpen(true)} className="v1-action v1-nav__cta">Start investing<span><ArrowUpRight size={18} /></span></button>
    </nav>
    <ContactFormModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
  </>;
});

export function V1Footer() {
  const year = new Date().getFullYear();
  const [legalItem, setLegalItem] = useState<'privacy' | 'terms' | 'disclosures' | null>(null);
  const legalContent = {
    privacy: { title: 'Privacy policy', text: 'AVC Dhanam Solutions respects your privacy. We use contact details you share to respond to your request, provide relevant service information, and meet our legal and regulatory obligations. We do not sell personal information.' },
    terms: { title: 'Terms of service', text: 'Website content is provided for general information and education. It does not create an advisory relationship, guarantee returns, or replace independent financial, tax, or legal advice.' },
    disclosures: { title: 'Important disclosures', text: 'Mutual Fund investments are subject to market risks. Past performance is not indicative of future returns. AVC Dhanam Solutions Private Limited is an AMFI-registered mutual fund distributor and SEBI-registered sub-broker for Motilal Oswal.' }
  };
  const openLegal = (item: 'privacy' | 'terms' | 'disclosures') => (event: React.MouseEvent<HTMLAnchorElement>) => { event.preventDefault(); setLegalItem(item); };
  return <footer className="v1-footer">
    <div className="v1-footer__masthead"><div><p>Built for deliberate progress</p><h2>Wealth deserves<br /><em>a clearer system.</em></h2></div><a href="mailto:support@avcdhanam.com">Talk to our team <ArrowUpRight size={17} /></a></div>
    <div className="v1-footer__grid">
      <div className="v1-footer__brand"><a href="/" className="v1-logo" aria-label="AVC Dhanam home"><img src="/logo_gold_transparent.svg" alt="AVC Dhanam" /></a><p>AVC Dhanam Solutions Private Limited is a SEBI-authorised Sub Broker of Motilal Oswal Financial Services and an AMFI-registered Mutual Fund Distributor in Mumbai.</p><ul><li><MapPin size={15} />Shop No. 4/5, Royal Palms, Virar West, Palghar, Mumbai – 401303</li><li><Phone size={15} /><a href="tel:+919820000000">+91 98200 00000 / +91 22 2800 0000</a></li><li><Mail size={15} /><a href="mailto:support@avcdhanam.com">support@avcdhanam.com</a></li><li><Clock size={15} />Mon – Sat · 9:00 AM – 6:30 PM (IST)</li></ul></div>
      <div className="v1-footer__link-group"><h4>Explore</h4><a href="/#system">The system</a><a href="/#markets">Live markets</a><a href="/#calculators">Calculators</a><a href="/#news">Financial news</a><a href="/screener">Market screener</a></div>
      <div className="v1-footer__link-group"><h4>Solutions</h4><a href="/#system">Mutual Fund SIP & Lumpsum</a><a href="/#system">Portfolio Management</a><a href="/#system">Alternative Investment</a><a href="/#system">Equity & Algo Trading</a><a href="/#system">Gold & Commodity Markets</a></div>
      <div className="v1-footer__registration"><h4>Our credentials</h4><div className="v1-footer__credential-list"><p><ShieldCheck size={17} /><span><b>SEBI Sub Broker</b><small>Motilal Oswal Sub-Broker Code</small><strong>MOSB-48192</strong></span></p><p><Award size={17} /><span><b>AMFI Mutual Fund Distributor</b><small>AMFI registration number</small><strong>ARN-184920</strong></span></p></div><a href="/sitemap.xml" target="_blank" rel="noreferrer">View XML sitemap <ExternalLink size={13} /></a></div>
    </div>
    <div className="v1-footer__risk"><b>Risk disclosure</b> Mutual Fund investments are subject to market risks; read all scheme-related documents carefully. Past performance is not indicative of future returns. AVC Dhanam Solutions Private Limited is an AMFI-registered mutual fund distributor and SEBI-registered sub-broker for Motilal Oswal. We do not provide guaranteed returns or unauthorised financial advice.</div>
    <div className="v1-footer__bottom"><span>© {year} AVC Dhanam Solutions Pvt. Ltd. All rights reserved.</span><div><a href="#privacy" onClick={openLegal('privacy')}>Privacy Policy</a><a href="#terms" onClick={openLegal('terms')}>Terms of Service</a><a href="#disclosures" onClick={openLegal('disclosures')}>Disclosures</a><a href="/sitemap.xml">Sitemap</a></div></div>
    {legalItem && <div className="v1-legal-modal" role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" onMouseDown={() => setLegalItem(null)}><div className="v1-legal-modal__panel" onMouseDown={event => event.stopPropagation()}><button type="button" aria-label="Close" onClick={() => setLegalItem(null)}><X size={18} /></button><p>AVC DHANAM · LEGAL</p><h2 id="legal-modal-title">{legalContent[legalItem].title}</h2><div /><span>{legalContent[legalItem].text}</span><a href="mailto:support@avcdhanam.com">Questions? Contact us <ArrowUpRight size={15} /></a></div></div>}
  </footer>;
}
