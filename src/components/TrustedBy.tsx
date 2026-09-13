import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const TrustedBy = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const logos = [1, 2, 3, 4, 5, 6];
  
  useGSAP(() => {
    // Initial reveal
    gsap.from('.trusted-text', { opacity: 0, y: 20, duration: 1, delay: 0.5 });
    
    // GSAP Marquee
    const q = gsap.utils.selector(marqueeRef);
    const items = q('.logo-item');
    
    // Set up infinite scrolling
    const tl = gsap.to(marqueeRef.current, {
      xPercent: -50,
      ease: "none",
      duration: 20,
      repeat: -1,
    });

    // Pause on hover
    marqueeRef.current?.addEventListener('mouseenter', () => tl.pause());
    marqueeRef.current?.addEventListener('mouseleave', () => tl.play());

  }, { scope: containerRef });

  return (
    <section id="about" ref={containerRef} className="py-12 border-y border-border/50 bg-surface overflow-hidden">
      <div className="container-custom">
        <p className="trusted-text text-center text-text-muted text-sm font-medium mb-8">
          Trusted Financial Partner, Rooted in India. Backed by a network of 210+ Bank & NBFC Partners.
        </p>
        
        <div className="relative w-full flex overflow-hidden mask-horizontal">
          <div ref={marqueeRef} className="flex gap-16 whitespace-nowrap items-center min-w-[200%]">
            {/* First set */}
            {['Motilal Oswal', 'SEBI Authorised', 'AMFI Registered', 'NSE', 'BSE', 'MCX', '210+ DSA Partners'].map((partner, i) => (
               <div key={`logo-1-${i}`} className="logo-item text-xl font-bold text-text-muted/60 hover:text-primary transition-colors cursor-pointer shrink-0">{partner}</div>
            ))}
            {/* Duplicated set for seamless loop */}
            {['Motilal Oswal', 'SEBI Authorised', 'AMFI Registered', 'NSE', 'BSE', 'MCX', '210+ DSA Partners'].map((partner, i) => (
               <div key={`logo-2-${i}`} className="logo-item text-xl font-bold text-text-muted/60 hover:text-primary transition-colors cursor-pointer shrink-0">{partner}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
