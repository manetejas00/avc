import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Play } from 'lucide-react';
import { splitLines } from '../animations/textUtils';
import TradingViewTicker from './TradingViewTicker';
import ContactFormModal from './ContactFormModal';

const Hero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headline = ['Supercharge Your', 'Productivity and Workflow', 'with AI'];
  
  useGSAP(() => {
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Desktop animations
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      gsap.set('.hero-badge', { y: 20, opacity: 0 });
      gsap.set('.line-inner', { yPercent: 100, rotation: 5, transformOrigin: '0% 0%' });
      gsap.set('.hero-desc', { y: 20, opacity: 0 });
      gsap.set('.hero-btn', { y: 20, opacity: 0 });
      gsap.set('.hero-dashboard', { y: 100, opacity: 0, scale: 0.95 });
      
      tl.to('.hero-badge', { y: 0, opacity: 1, duration: 0.8, delay: 0.2 })
        .to('.line-inner', { yPercent: 0, rotation: 0, duration: 1, stagger: 0.15 }, '-=0.6')
        .to('.hero-desc', { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .to('.hero-btn', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, '-=0.6')
        .to('.hero-dashboard', { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out' }, '-=0.4');

      gsap.to('.hero-dashboard', {
        y: 50,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    });
    
    mm.add("(max-width: 767px)", () => {
      // Mobile - simplified
      gsap.from('.hero-badge, .line-inner, .hero-desc, .hero-btn, .hero-dashboard', {
        y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out'
      });
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="pt-[140px] pb-32 overflow-x-clip relative">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] bg-gold-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-surface mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-primary" />
            <span className="text-sm font-medium text-text">SEBI Registered Sub Broker & Mutual Fund Distributor</span>
          </div>
          
          <h1 className="hero-title text-5xl md:text-[64px] leading-[1.1] font-semibold mb-6 tracking-tight text-text">
            Apna Paisa,<br />
            <span className="text-gold-primary">Sahi Disha.</span>
          </h1>
          
          <p className="hero-desc text-lg md:text-xl text-text-muted mb-10 max-w-3xl">
            Your Wealth. Managed the Right Way. We help Indian families and businesses invest smarter in stocks, mutual funds, PMS, AIF, IPOs, and commodities.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 mb-16">
            <button className="hero-btn btn-primary">
              Start Your SIP Today
            </button>
            <button onClick={() => setIsModalOpen(true)} className="hero-btn btn-secondary">
              <span className="relative z-10 flex items-center gap-2">
                Book a Free Consultation
              </span>
            </button>
            <button className="hero-btn btn-secondary">
              <span className="relative z-10 flex items-center gap-2">
                <Play size={18} className="group-hover:scale-110 transition-transform text-gold-primary" />
                Track NSE/BSE Live
              </span>
            </button>
          </div>
          
        </div>
        
        <div className="hero-dashboard relative mx-auto w-full max-w-[1100px] mt-8 rounded-[32px] border border-gold-primary/30 bg-background p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] overflow-hidden">
          <div className="relative rounded-2xl overflow-hidden mb-4 border border-gold-primary/20 group">
            <img
              src="/assets/hero/hero-indian-finance.webp"
              alt="Indian Stock Market & Mumbai Financial Data Visualization"
              width={1100}
              height={550}
              className="w-full h-48 sm:h-72 object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-gold-primary/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-gold-primary/30">
                <span className="w-2 h-2 rounded-full bg-gold-primary animate-pulse" />
                <span className="text-xs font-semibold tracking-wider text-gold-secondary uppercase">Live Market Intelligence</span>
              </div>
              <span className="hidden sm:block text-xs text-gray-300 font-medium">BSE & NIFTY Realtime Data Engine</span>
            </div>
          </div>
          <TradingViewTicker />
        </div>
      </div>
      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default Hero;
