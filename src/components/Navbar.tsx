import { ChevronDown, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [['Home', '/'], ['Screener', '/screener'], ['Services', '/#services'], ['Markets', '/#markets'], ['Calculators', '/#calculators'], ['News', '/#news'], ['FAQ', '/#faq']] as const;
const primaryItems = navItems.slice(0, 4);
const exploreItems = navItems.slice(4);

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [active, setActive] = useState('/');
  const isHome = window.location.pathname === '/';
  const closeMenus = () => { setOpen(false); setExploreOpen(false); };

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closeMenus(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const updateActive = () => setActive(window.location.hash ? `/${window.location.hash}` : window.location.pathname);
    updateActive();
    window.addEventListener('hashchange', updateActive);
    window.addEventListener('popstate', updateActive);
    return () => { window.removeEventListener('hashchange', updateActive); window.removeEventListener('popstate', updateActive); };
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const sections = navItems.filter(([, href]) => href.startsWith('/#')).map(([, href]) => document.querySelector(href.slice(1))).filter((section): section is Element => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setActive(`/#${visible.target.id}`);
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [isHome]);

  const linkClass = (href: string) => `relative rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 after:absolute after:inset-x-2 after:bottom-0 after:h-px after:origin-left after:bg-gold-primary after:transition-transform ${active === href ? 'text-gold-secondary after:scale-x-100' : 'text-text-secondary after:scale-x-0 hover:text-text hover:after:scale-x-100'}`;

  return <nav aria-label="Main navigation" className="fixed inset-x-0 top-0 z-[100] px-3 py-3 sm:px-6">
    <div className="container-custom flex h-16 items-center justify-between rounded-2xl border border-white/10 bg-background/95 px-4 shadow-[0_12px_35px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:px-6">
      <a href="/" onClick={closeMenus} aria-label="AVC Dhanam home" className="shrink-0 rounded-lg transition-transform duration-200 hover:scale-[1.03]"><img src="/logo_gold_transparent.svg" alt="AVC Dhanam" className="h-9 w-auto sm:h-10" /></a>
      <div className="hidden items-center gap-2 lg:flex xl:gap-3">
        {primaryItems.map(([label, href]) => <a key={label} href={href} onClick={closeMenus} aria-current={active === href ? 'page' : undefined} className={linkClass(href)}>{label}</a>)}
        <div className="relative"><button type="button" aria-expanded={exploreOpen} onClick={() => setExploreOpen(!exploreOpen)} className={`flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${exploreItems.some(([, href]) => active === href) ? 'text-gold-secondary' : 'text-text-secondary hover:text-text'}`}>Explore <ChevronDown size={15} className={`transition-transform ${exploreOpen ? 'rotate-180' : ''}`} /></button>
          <div className={`absolute right-0 top-[calc(100%+12px)] w-52 rounded-xl border border-white/10 bg-surface p-2 shadow-2xl transition-all duration-200 ${exploreOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>{exploreItems.map(([label, href]) => <a key={label} href={href} onClick={closeMenus} className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${active === href ? 'bg-gold-primary/10 text-gold-secondary' : 'text-text-secondary hover:bg-surface-elevated hover:text-text'}`}>{label}</a>)}</div>
        </div>
      </div>
      <div className="flex items-center gap-2"><a href="/#contact" onClick={closeMenus} className="hidden sm:inline-flex btn-primary !px-5 !py-2.5 !text-sm">Contact us</a><button type="button" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="btn-icon !h-10 !w-10 lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
    </div>
    <div className={`fixed inset-0 -z-10 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={closeMenus} aria-hidden="true" />
    <div id="mobile-navigation" className={`container-custom mt-2 overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-2xl transition-all duration-200 lg:hidden ${open ? 'max-h-[600px] opacity-100' : 'pointer-events-none max-h-0 border-transparent opacity-0'}`}><div className="grid gap-1 p-3 sm:grid-cols-2">{navItems.map(([label, href]) => <a key={label} href={href} onClick={closeMenus} aria-current={active === href ? 'page' : undefined} className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${active === href ? 'bg-gold-primary/10 text-gold-secondary' : 'text-text-secondary hover:bg-surface-elevated hover:text-gold-secondary'}`}>{label}</a>)}</div></div>
  </nav>;
}
