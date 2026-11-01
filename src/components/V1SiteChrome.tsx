import Modal from './ui/Modal';
import { forwardRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import ContactFormModal from './ContactFormModal';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const V1Nav = forwardRef<HTMLElement, { home?: boolean }>(function V1Nav({ home = false }, ref) {
  const [open, setOpen] = useState(false);
  const [callback, setCallback] = useState(false);
  useBodyScrollLock(open);
  const section = (id: string) => home ? `#${id}` : `/#${id}`;
  return <>
    <a href="#main-content" className="care-skip">Skip to main content</a>
    <nav ref={ref} className="v1-nav care-nav" aria-label="Main navigation">
      <a href="/" className="v1-logo" aria-label="AVC Dhanam home"><img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions" width="140" height="40" /></a>
      <div className="care-nav-links"><a href={section('system')}>Services</a><a href={section('approach')}>Our team</a><a href={section('calculators')}>Calculators</a><a href="/resources">Resources</a><a href="/client-help">Client help</a><a href={section('contact')}>Contact</a></div>
      <div className="care-nav-actions"><button className="care-button" onClick={() => { setOpen(false); setCallback(true); }}>Book a callback <ArrowUpRight size={16} /></button><button className="care-menu" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="care-mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
    </nav>
    {open && <Modal onClose={() => setOpen(false)} className="care-mobile-menu" aria-label="Navigation menu" id="care-mobile-menu" onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}><button className="care-menu-backdrop" aria-label="Close navigation" onClick={() => setOpen(false)} /><div><button onClick={() => setOpen(false)} className="care-mobile-close">Close <X size={18} /></button>{[['Services', section('system')], ['Our team', section('approach')], ['Calculators', section('calculators')], ['Resources', '/resources'], ['Mutual fund explorer', '/mutual-funds'], ['Client help', '/client-help'], ['Contact', section('contact')]].map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={17} /></a>)}<a href="tel:+917030247878">Call +91 7030247878</a></div></Modal>}
    <ContactFormModal isOpen={callback} onClose={() => setCallback(false)} />
  </>;
});

export function V1Footer() {
  return <footer className="care-footer"><div className="care-footer-grid"><div><img src="/logo_gold_transparent.svg" alt="AVC Dhanam Solutions" width="160" height="46" loading="lazy" /><p>Help with investments, loans, insurance and tax support in Virar West and Mumbai.</p><a href="tel:+917030247878">+91 7030247878</a><a href="mailto:support@avcdhanam.com">support@avcdhanam.com</a><p>210, Second Floor, Global Plaza, Global City, Virar West, Maharashtra – 401305</p><small>Please call to confirm office hours before visiting.</small></div><div><h3>Services</h3><a href="/services/investments">Mutual funds & SIPs</a><a href="/services/loans">Loans & document checklist</a><a href="/services/insurance">Insurance</a><a href="/services/tax">Tax & accounting</a></div><div><h3>Useful links</h3><a href="/resources">Resources</a><a href="/mutual-funds">Mutual fund explorer</a><a href="/#calculators">Calculators</a><a href="/learn">Learning centre</a><a href="/client-help">Existing client help</a><a href="/disclosures">Disclosures & privacy</a></div></div><p className="care-footer-note">Investments involve risk. Returns and loan approvals are not guaranteed. Confirm the provider, authorization, charges and written terms before proceeding. Never send passwords, OTPs or identity documents through the callback form.</p><small>© {new Date().getFullYear()} AVC Dhanam Solutions Pvt. Ltd.</small></footer>;
}
