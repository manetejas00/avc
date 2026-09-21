import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { TrendingUp, PiggyBank, Briefcase, Diamond, Rocket, Coins, ShieldCheck, Banknote, Bot, Globe } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { title: 'Equity & Stock Market', desc: 'Trade and invest in NSE and BSE listed stocks with dedicated support from our Motilal Oswal-backed research desk.', bgColor: 'bg-gold-primary', Icon: TrendingUp },
  { title: 'Mutual Funds & SIPs', desc: 'Build long-term wealth through SIPs, lump-sum investments, ELSS tax-saving funds, and goal-based portfolios.', bgColor: 'bg-gold-primary', Icon: PiggyBank },
  { title: 'Portfolio Management', desc: 'Curated, high-conviction portfolios for HNI and growing investors who want active, professionally managed equity exposure.', bgColor: 'bg-gold-primary/80', Icon: Briefcase },
  { title: 'Alternative Investments', desc: 'Access Category I, II, and III AIFs for diversified, sophisticated investment strategies.', bgColor: 'bg-gold-primary/80', Icon: Diamond },
  { title: 'IPO Investment', desc: 'Apply for the latest NSE and BSE IPOs online with guided support — from application to allotment tracking.', bgColor: 'bg-gold-primary', Icon: Rocket },
  { title: 'Commodity Trading', desc: 'Trade in gold, silver, crude oil, and agri-commodities on MCX with full brokerage support.', bgColor: 'bg-gold-primary', Icon: Coins },
  { title: 'Insurance Solutions', desc: 'Term insurance, health insurance, and investment-linked plans matched to your family\'s real needs.', bgColor: 'bg-gold-primary/80', Icon: ShieldCheck },
  { title: 'Loans via 210+ Partners', desc: 'Home, personal, business, and loans against mutual funds — sourced competitively across our DSA network.', bgColor: 'bg-gold-primary/80', Icon: Banknote },
  { title: 'TGS Algo Trading', desc: 'Our proprietary algorithmic trading system brings rule-based, emotion-free trading strategies to Indian retail investors.', bgColor: 'bg-gold-primary', Icon: Bot },
  { title: 'US Stocks & Global Investing', desc: 'Diversify your portfolio globally. Invest in top US tech giants and international ETFs with zero commission on foreign stocks.', bgColor: 'bg-gold-primary', Icon: Globe },
];

const Benefits = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = React.useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 1024px)",
      isTablet: "(min-width: 768px) and (max-width: 1023px)",
      isMobile: "(max-width: 767px)",
      reduceMotion: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      let { isDesktop, isTablet, isMobile, reduceMotion } = context.conditions as any;

      if (reduceMotion) {
        gsap.set(['.section-heading', '.section-desc', '.benefit-card', '.icon-wrapper'], {
          y: 0, x: 0, opacity: 1, scale: 1, yPercent: 0
        });
        return;
      }

      // SECTION INTRO
      gsap.fromTo('.section-heading', 
        { yPercent: 100 }, 
        { yPercent: 0, duration: 1, ease: 'power3.out', scrollTrigger: {
            trigger: '.heading-wrapper',
            start: 'top 85%',
        }}
      );

      gsap.fromTo('.section-desc',
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', scrollTrigger: {
            trigger: '.desc-wrapper',
            start: 'top 85%',
        }}
      );
      
      // OPTIONAL DESKTOP PARALLAX
      if (isDesktop) {
        gsap.to('.heading-wrapper', {
          y: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
        
        gsap.to('.desc-wrapper', {
          y: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
    
        gsap.to('.cards-container', {
          y: -40,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // CARDS REVEAL
      const cards = gsap.utils.toArray('.benefit-card');
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '.cards-container',
          start: 'top 85%',
        }
      });

      cards.forEach((card: any, index: number) => {
        let xStart = 0;
        let yStart = 15;
        let scaleStart = 1;

        if (isDesktop) {
          const col = index % 3;
          if (col === 0) { xStart = -15; yStart = 10; }
          else if (col === 1) { yStart = 20; scaleStart = 0.98; }
          else { xStart = 15; yStart = 10; }
        } else if (isTablet) {
          const col = index % 2;
          if (col === 0) { xStart = -20; yStart = 20; }
          else { xStart = 20; yStart = 20; }
        }

        gsap.set(card, { x: xStart, y: yStart, scale: scaleStart, opacity: 0 });
        
        const iconWrapper = card.querySelector('.icon-wrapper');
        if (iconWrapper) {
          gsap.set(iconWrapper, { scale: 0.8, opacity: 0, rotate: -10 });
        }
      });

      tl.to(cards, {
        x: 0, y: 0, scale: 1, opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: isMobile ? 0.05 : 0.1
      }, 0);

      const iconWrappers = cards.map((c: any) => c.querySelector('.icon-wrapper')).filter(Boolean);
      tl.to(iconWrappers, {
        scale: 1, opacity: 1, rotate: 0,
        duration: 0.8,
        ease: 'back.out(1.5)',
        stagger: isMobile ? 0.05 : 0.1
      }, 0.3);

    });

  }, { scope: sectionRef, dependencies: [showAll] });

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    const card = e.currentTarget;
    gsap.to(card, { 
      y: -8, 
      borderColor: 'rgba(212, 175, 55, 0.4)', 
      boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)',
      backgroundColor: 'rgba(28, 35, 40, 0.8)',
      duration: 0.4, 
      ease: 'power2.out' 
    });
    
    const icon = card.querySelector('.service-icon');
    if (icon) {
      gsap.to(icon, { scale: 1.1, rotate: 5, duration: 0.4, ease: 'power2.out' });
    }

    const glow = card.querySelector('.internal-glow');
    if (glow) {
      gsap.to(glow, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = e.currentTarget;
    gsap.to(card, { 
      y: 0, 
      duration: 0.4, 
      ease: 'power2.out',
      clearProps: 'borderColor,boxShadow,backgroundColor' 
    });
    
    const icon = card.querySelector('.service-icon');
    if (icon) {
      gsap.to(icon, { scale: 1, rotate: 0, duration: 0.4, ease: 'power2.out' });
    }

    const glow = card.querySelector('.internal-glow');
    if (glow) {
      gsap.to(glow, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    }
  };

  const displayedServices = showAll ? services : services.slice(0, 6);

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-background">
      <div className="container-custom relative z-10">
        <div className="text-center mb-16">
          <div className="heading-wrapper overflow-hidden inline-block pb-2">
            <h2 className="section-heading text-4xl md:text-[52px] font-semibold text-text m-0">
              Comprehensive Wealth Solutions
            </h2>
          </div>
          <div className="desc-wrapper mt-4">
            <p className="section-desc text-text-muted text-lg max-w-3xl mx-auto m-0">
              From the salaried professional to the small business owner, we bring institutional-grade investment access to everyday Indian investors, with complete transparency and SEBI-compliant processes.
            </p>
          </div>
        </div>
        
        <div className="cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((service, index) => (
            <div 
              key={index} 
              className="benefit-card card-premium p-8 relative overflow-hidden group border border-white/5 cursor-default"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="internal-glow absolute inset-0 bg-gradient-to-br from-gold-primary/10 to-transparent opacity-0 pointer-events-none" />
              
              <div className={`icon-wrapper w-12 h-12 rounded-2xl ${service.bgColor} mb-6 flex items-center justify-center relative z-10`}>
                <service.Icon className="text-white service-icon" size={24} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text relative z-10">{service.title}</h3>
              <p className="text-text-muted relative z-10">{service.desc}</p>
            </div>
          ))}
        </div>

        {services.length > 6 && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => {
                setShowAll(!showAll);
                setTimeout(() => ScrollTrigger.refresh(), 100);
              }}
              className="btn-secondary"
            >
              {showAll ? 'Show Less' : 'Show More Services'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Benefits;
