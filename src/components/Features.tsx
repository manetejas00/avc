import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Title reveal
    gsap.from('.features-title', {
      y: 20, opacity: 0, duration: 1,
      scrollTrigger: { trigger: '.features-title', start: 'top 85%' }
    });

    // Bento item stagger and image scale
    const items = gsap.utils.toArray('.bento-item');
    
    items.forEach((item: any, i) => {
      const img = item.querySelector('img');
      
      gsap.fromTo(item, 
        { y: 20, opacity: 0 },
        { 
          y: 0, opacity: 1, 
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
          }
        }
      );

      if (img) {
        gsap.fromTo(img,
          { scale: 1.3, y: 30 },
          {
            scale: 1, y: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          }
        );
      }
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-background">
      <div className="container-custom">
        <div className="features-title text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Why Choose AVC Dhanam</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Experience premium wealth management tailored to your specific financial goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[340px]">
          
          <div className="bento-item md:col-span-2 card-premium card-premium-hover p-8 relative overflow-hidden flex flex-col group cursor-pointer">
            <h3 className="text-2xl font-semibold mb-2 relative z-10 text-text">TGS Algo Trading</h3>
            <p className="text-text-muted max-w-md relative z-10">Our proprietary algorithmic trading system brings rule-based, emotion-free trading strategies to Indian retail investors — a rare offering among sub-broker franchises in India.</p>
            <div className="absolute bottom-0 right-0 w-[60%] h-[80%] bg-gradient-to-tl from-gold-primary/10 to-transparent rounded-tl-full transition-transform duration-700 group-hover:scale-105" />
          </div>

          <div className="bento-item md:row-span-2 card-premium card-premium-hover p-8 relative overflow-hidden flex flex-col group cursor-pointer">
            <h3 className="text-2xl font-semibold mb-2 relative z-10 text-text">Women's Financial Empowerment</h3>
            <p className="text-text-muted relative z-10">Dedicated financial planning tailored for women, helping you build independent wealth, secure your future, and invest with confidence.</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] h-[50%] bg-gradient-to-t from-gold-primary/10 to-transparent rounded-t-full transition-transform duration-700 group-hover:-translate-y-4" />
          </div>

          <div className="bento-item card-premium card-premium-hover p-8 relative overflow-hidden group cursor-pointer">
            <h3 className="text-2xl font-semibold mb-2 relative z-10 text-text">Retirement Planning</h3>
            <p className="text-text-muted relative z-10">Secure your golden years with robust, goal-based portfolios.</p>
            <div className="absolute -bottom-10 right-0 w-[80%] h-[80%] bg-gradient-to-tr from-gold-primary/10 to-transparent rounded-tl-full opacity-70 transition-all duration-700 group-hover:opacity-100 group-hover:-translate-y-2" />
          </div>

          <div className="bento-item card-premium card-premium-hover p-8 relative overflow-hidden group cursor-pointer">
            <h3 className="text-2xl font-semibold mb-2 relative z-10 text-text">Expert Leadership</h3>
            <p className="text-text-muted relative z-10">Guided by seasoned financial experts with deep market knowledge.</p>
            <div className="absolute bottom-0 right-0 w-full h-[60%] bg-gradient-to-bl from-gold-primary/10 to-transparent transition-transform duration-700 group-hover:scale-105 origin-bottom" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
