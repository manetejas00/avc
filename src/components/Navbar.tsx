import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Navbar = () => {
  const navRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Initial entrance
    gsap.from(navRef.current, { y: -100, opacity: 0, duration: 1, ease: 'power3.out' });

    gsap.to(innerRef.current, {
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      boxShadow: 'none',
      scrollTrigger: {
        trigger: 'body',
        start: 'top -50',
        end: 'top -100',
        scrub: true,
      }
    });
  }, { scope: navRef });

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 py-4 transition-all">
      <div className="container-custom">
        <div ref={innerRef} className="bg-[#1a1a1a]/70 backdrop-blur-md rounded-full border border-border px-6 py-4 flex items-center justify-between transition-colors">
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center justify-center h-10 w-10 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200 leading-none">
                AVCDHANAM
              </span>
              <span className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5 font-medium">
                Solutions Pvt Ltd
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Home', href: '#' },
              { name: 'Services', href: '#services' },
              { name: 'Markets', href: '#markets' },
              { name: 'About', href: '#about' }
            ].map((item) => (
              <a key={item.name} href={item.href} className="relative text-sm font-medium hover:text-primary transition-colors group text-text">
                {item.name}
                {/* Animated underline */}
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-primary scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex">
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 duration-300 ease-out">
              Contact Us
            </button>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
