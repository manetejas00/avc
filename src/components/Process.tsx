import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const processSteps = [
  { num: '01', title: 'Consult & Plan', desc: 'Identify your financial goals, risk appetite, and investment needs.' },
  { num: '02', title: 'Paperless Onboarding', desc: 'Quick, transparent, and hassle-free SEBI-compliant KYC and account opening.' },
  { num: '03', title: 'Invest & Grow', desc: 'Execute strategies, monitor your portfolio, and achieve long-term wealth.' }
];

const Process = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate title
    gsap.from('.process-title', {
      y: 20, opacity: 0, duration: 1,
      scrollTrigger: { trigger: '.process-title', start: 'top 85%' }
    });

    // Staggered cards reveal
    gsap.fromTo('.process-step', 
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.process-grid',
          start: 'top 75%',
        }
      }
    );

    // Add a progress bar across the top of the cards
    gsap.fromTo('.process-progress', 
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.process-grid',
          start: 'top center',
          end: 'bottom center',
          scrub: true,
        }
      }
    );

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="process-title text-center mb-20">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Simple, Transparent Process</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Get started on your wealth creation journey with our streamlined onboarding.
          </p>
        </div>
        
        <div className="process-grid relative">
          {/* Animated line connecting steps */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 hidden md:block">
            <div className="process-progress w-full h-full bg-gold-primary origin-left" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 md:pt-12">
            {processSteps.map((step, index) => (
              <div key={index} className="process-step card-premium card-premium-hover p-8">
                <div className="text-gold-primary text-5xl font-semibold mb-6 opacity-80 relative inline-block">
                  {step.num}
                  {/* Decorative dot */}
                  <span className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-gold-primary/20" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-text">{step.title}</h3>
                <p className="text-text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
