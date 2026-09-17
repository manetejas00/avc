import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface NavItem {
  name: string;
  href: string;
  badge?: string;
  description?: string;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '#', description: 'Main Overview & Highlights' },
  { name: 'Services', href: '#services', description: 'Financial Solutions & Planning' },
  { name: 'Markets', href: '#markets', badge: 'Live', description: 'Real-time Indices & Stocks' },
  { name: 'Mutual Funds', href: '#mutual-funds', description: 'Fund Explorer & Performance' },
  { name: 'Calculators', href: '#calculators', description: 'SIP, EMI & Wealth Tools' },
  { name: 'Financial News', href: '#news', description: 'Market Insights & Updates' },
  { name: 'FAQ', href: '#faq', description: 'Frequently Asked Questions' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Refs for GSAP scoping & timeline target elements
  const navContainerRef = useRef<HTMLElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // SVG lines refs for hamburger morphing
  const line1Ref = useRef<SVGLineElement>(null);
  const line2Ref = useRef<SVGLineElement>(null);
  const line3Ref = useRef<SVGLineElement>(null);

  // Master timeline ref for opening/closing interactions
  const tl = useRef<gsap.core.Timeline | null>(null);

  // Scroll Trigger compact mode state ref
  const innerRef = useRef<HTMLDivElement>(null);

  // Initialize GSAP Timelines and Animations
  useGSAP(() => {
    // Initial entrance animation for floating island
    gsap.from(islandRef.current, {
      y: -80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });

    // Scroll animation for floating island when scrolling down
    gsap.to(innerRef.current, {
      paddingTop: 10,
      paddingBottom: 10,
      backgroundColor: 'rgba(11, 15, 16, 0.95)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.7), 0 0 15px rgba(212, 175, 55, 0.2)',
      scrollTrigger: {
        trigger: 'body',
        start: 'top -40',
        end: 'top -100',
        scrub: 0.5,
      }
    });

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    // Create the master open/close menu timeline
    const menuTl = gsap.timeline({
      paused: true,
      onStart: () => {
        if (backdropRef.current) backdropRef.current.style.pointerEvents = 'auto';
        if (menuPanelRef.current) menuPanelRef.current.style.pointerEvents = 'auto';
      },
      onReverseComplete: () => {
        if (backdropRef.current) backdropRef.current.style.pointerEvents = 'none';
        if (menuPanelRef.current) menuPanelRef.current.style.pointerEvents = 'none';
      }
    });

    // Step 1: Island glow and expansion emphasis
    menuTl.to(islandRef.current, {
      borderColor: 'rgba(212, 175, 55, 0.7)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(212, 175, 55, 0.3)',
      duration: 0.35,
      ease: 'power2.out'
    }, 0);

    // Step 2: Hamburger to 'X' transformation
    menuTl
      .to(line1Ref.current, { rotate: 45, y: 5, stroke: '#F5C542', duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(line2Ref.current, { opacity: 0, scaleX: 0, duration: 0.2, ease: 'power2.inOut' }, 0)
      .to(line3Ref.current, { rotate: -45, y: -5, stroke: '#F5C542', duration: 0.3, ease: 'power2.inOut' }, 0);

    // Step 3: Backdrop fade in
    menuTl.to(backdropRef.current, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out'
    }, 0.05);

    // Step 4: Menu Panel entrance (sliding & scaling cleanly below island)
    menuTl.fromTo(
      menuPanelRef.current,
      { opacity: 0, y: -15, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.15)' },
      0.1
    );

    // Step 5: Menu Links stagger into view
    menuTl.fromTo(
      '.stagger-menu-item',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' },
      0.2
    );

    tl.current = menuTl;
  }, { scope: navContainerRef });

  // Toggle Handler with rapid-click and state management
  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // Lock body scroll when open on mobile/tablet to prevent background scroll bug
    if (nextState) {
      document.body.style.overflow = 'hidden';
      tl.current?.play();
    } else {
      document.body.style.overflow = '';
      tl.current?.reverse();
    }
  };

  const handleClose = () => {
    if (isOpen) {
      setIsOpen(false);
      document.body.style.overflow = '';
      tl.current?.reverse();
      toggleBtnRef.current?.focus();
    }
  };

  // Keyboard accessibility (Escape key handler)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Window resize handler to maintain proper state & layout
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isOpen) {
        // Auto-close overlay menu on desktop if expanded to full width
        handleClose();
      }
    };
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  return (
    <nav ref={navContainerRef} aria-label="Main Navigation" className="fixed top-0 left-0 right-0 z-[100] py-3 md:py-4 px-3 sm:px-6">
      
      {/* 1. Backdrop Overlay (Fixes black background bug by providing deep, high-contrast dimming) */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/75 backdrop-blur-md opacity-0 pointer-events-none transition-opacity duration-300 z-[90]"
      />

      {/* 2. Floating Island Pill Container */}
      <div className="max-w-7xl mx-auto relative z-[100]">
        <div ref={islandRef} className="transition-all duration-300">
          <div
            ref={innerRef}
            className="bg-[#0D1214]/90 backdrop-blur-xl rounded-full border border-[#D4AF37]/30 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,55,0.15)] px-4 sm:px-6 py-3 flex items-center justify-between transition-colors"
          >
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#D4AF37] rounded-lg px-1 py-0.5">
              <img
                src="/logo_gold_transparent.svg"
                alt="AVCDHANAM Logo"
                className="h-9 sm:h-11 w-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)] transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-200 hover:text-[#F5C542] transition-colors py-1 group focus:outline-none focus:text-[#F5C542]"
                >
                  <span className="flex items-center gap-1.5">
                    {item.name}
                    {item.badge && (
                      <span className="bg-[#D4AF37]/20 text-[#F5C542] border border-[#D4AF37]/40 text-[10px] font-semibold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#D4AF37] to-[#F5C542] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                </a>
              ))}
            </div>

            {/* Right Action CTA & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <a
                href="#contact"
                className="hidden sm:inline-flex bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#B8860B] hover:brightness-110 text-[#071A1D] font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg shadow-[#D4AF37]/20 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                Contact Us
              </a>

              {/* Touch-friendly Hamburger / X Button */}
              <button
                ref={toggleBtnRef}
                onClick={handleToggle}
                aria-expanded={isOpen}
                aria-controls="island-menu-panel"
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-[#161E21] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white hover:bg-[#1F2B2F] transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37] active:scale-95"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line
                    ref={line1Ref}
                    x1="4" y1="7" x2="20" y2="7"
                    stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round"
                    style={{ transformOrigin: '12px 7px' }}
                  />
                  <line
                    ref={line2Ref}
                    x1="4" y1="12" x2="20" y2="12"
                    stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round"
                    style={{ transformOrigin: '12px 12px' }}
                  />
                  <line
                    ref={line3Ref}
                    x1="4" y1="17" x2="20" y2="17"
                    stroke="#D4AF37" strokeWidth="2.2" strokeLinecap="round"
                    style={{ transformOrigin: '12px 17px' }}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Floating Overlay Menu Panel (High contrast glassmorphism box below island) */}
        <div
          id="island-menu-panel"
          ref={menuPanelRef}
          role="region"
          aria-label="Mobile Navigation Panel"
          className="absolute top-full left-0 right-0 mt-3 mx-auto w-full max-w-full sm:max-w-2xl bg-[#0B0F10]/95 backdrop-blur-2xl rounded-3xl border border-[#D4AF37]/40 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(212,175,55,0.2)] overflow-hidden opacity-0 pointer-events-none z-[95] transition-all"
        >
          <div className="p-5 sm:p-7">
            
            {/* Header Title inside Menu */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D4AF37]/20 stagger-menu-item">
              <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                AVCDHANAM Menu
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                Financial Excellence & Wealth
              </span>
            </div>

            {/* Menu Links Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={handleClose}
                  tabIndex={isOpen ? 0 : -1}
                  className="stagger-menu-item group flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#141B1E]/60 hover:bg-[#1F2B2F] border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2 group-hover:scale-150 group-hover:bg-[#F5C542] transition-transform" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-100 group-hover:text-[#F5C542] transition-colors">
                        {item.name}
                      </span>
                      {item.badge && (
                        <span className="bg-[#D4AF37]/20 text-[#F5C542] border border-[#D4AF37]/40 text-[10px] font-semibold px-1.5 py-0.2 rounded-full uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 group-hover:text-gray-300">
                        {item.description}
                      </p>
                    )}
                  </div>
                </a>
              ))}
            </div>

            {/* Menu Footer Quick CTAs */}
            <div className="mt-5 pt-4 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-3 stagger-menu-item">
              <a
                href="/admin"
                onClick={handleClose}
                tabIndex={isOpen ? 0 : -1}
                className="text-xs text-gray-400 hover:text-[#F5C542] transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <span>🔒</span> Admin Portal <span className="text-[10px] text-[#D4AF37] font-mono bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">(admin@gmail.com / Admin@1230)</span>
              </a>
              <a
                href="#contact"
                onClick={handleClose}
                tabIndex={isOpen ? 0 : -1}
                className="w-full sm:w-auto text-center bg-gradient-to-r from-[#D4AF37] to-[#F5C542] text-[#071A1D] font-bold text-xs px-6 py-2.5 rounded-xl hover:brightness-110 transition-transform active:scale-95 focus:outline-none"
              >
                Get In Touch
              </a>
            </div>

          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;

