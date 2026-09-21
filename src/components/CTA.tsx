import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ContactFormModal from './ContactFormModal';

const CTA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useGSAP(() => {
    // Reveal
    gsap.from('.cta-content > *', {
      y: 15, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
    });

    // Magnetic button effect on desktop
    const btn = buttonRef.current;
    if (btn) {
      const mm = gsap.matchMedia();
      
      mm.add("(min-width: 1024px)", () => {
        const hoverTimeline = gsap.to(btn, { scale: 1.05, duration: 0.3, paused: true, ease: 'power2.out' });
        
        const onEnter = () => hoverTimeline.play();
        const onLeave = () => {
          hoverTimeline.reverse();
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
        };
        const onMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.2, ease: 'power2.out' });
        };

        btn.addEventListener('mouseenter', onEnter);
        btn.addEventListener('mouseleave', onLeave);
        btn.addEventListener('mousemove', onMove);

        return () => {
          btn.removeEventListener('mouseenter', onEnter);
          btn.removeEventListener('mouseleave', onLeave);
          btn.removeEventListener('mousemove', onMove);
        };
      });
    }
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[300px] bg-gold-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="cta-content bg-surface border border-white/5 rounded-[48px] p-12 md:p-24 text-center max-w-5xl mx-auto relative overflow-hidden shadow-2xl">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-background mb-8">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-medium text-text">Start Your Journey!</span>
          </div>
          
          <h2 className="text-4xl md:text-[64px] leading-[1.1] font-semibold mb-6 text-text">
            Ready to Start Your<br/>Wealth Journey?
          </h2>
          
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Chahe aap ho ek naya investor ya ek experienced trader — AVC Dhanam Solutions aapke saath hai, har step par.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              ref={buttonRef} 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary text-lg relative z-10"
            >
              Book a Free Consultation
            </button>
            <button className="btn-secondary text-lg relative z-10">
              WhatsApp Us
            </button>
            <button className="btn-secondary text-lg relative z-10">
              Call Now
            </button>
          </div>
          
        </div>
      </div>
      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default CTA;
