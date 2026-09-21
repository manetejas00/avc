import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
  ['Home', '/'], ['Screener', '/screener'], ['Services', '/#services'],
  ['Markets', '/#markets'], ['Mutual Funds', '/#mutual-funds'], ['Calculators', '/#calculators'],
  ['News', '/#news'], ['FAQ', '/#faq'],
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav aria-label="Main navigation" className="fixed inset-x-0 top-0 z-[100] px-3 py-3 sm:px-6">
      <div className="container-custom flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-background/95 px-4 shadow-[0_12px_35px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:px-6">
        <a href="/" aria-label="AVC Dhanam home" className="shrink-0 rounded-lg">
          <img src="/logo_gold_transparent.svg" alt="AVC Dhanam" className="h-9 w-auto sm:h-10" />
        </a>
        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          {navItems.slice(0, 6).map(([label, href]) => <a key={label} href={href} className="text-sm font-medium text-text-secondary transition-colors hover:text-gold-secondary">{label}</a>)}
        </div>
        <div className="flex items-center gap-2">
          <a href="#contact" className="hidden sm:inline-flex btn-primary !px-5 !py-2.5 !text-sm">Contact us</a>
          <button type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="btn-icon !h-10 !w-10 lg:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <div className={`fixed inset-0 -z-10 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="mobile-navigation" className={`container-custom mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl transition-all duration-200 lg:hidden ${open ? 'max-h-[600px] opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0'}`}>
        <div className="grid gap-1 p-3 sm:grid-cols-2">
          {navItems.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-gold-secondary">{label}</a>)}
          <a href="/admin" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-gold-secondary">Admin portal</a>
        </div>
      </div>
    </nav>
  );
}
