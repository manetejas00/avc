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
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <img src="/logo.jpg" alt="AVC Dhanam Logo" className="h-10 w-auto rounded-lg" />
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
