import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const plans = [
  { name: 'Standard', price: '$29', period: '/month', desc: 'Perfect for individuals and small teams getting started.', features: ['Up to 5 Users', 'Basic AI Assistance', 'Standard Support', '5GB Storage', 'Community Access'], highlighted: false, button: 'Start Free Trial' },
  { name: 'Premium', price: '$79', period: '/month', desc: 'Ideal for growing teams needing advanced features.', features: ['Up to 20 Users', 'Advanced AI Features', 'Priority Support', '50GB Storage', 'Custom Integrations', 'Analytics Dashboard'], highlighted: true, badge: 'Most Popular', button: 'Get Premium' },
  { name: 'Enterprise', price: 'Custom', period: '', desc: 'Tailored solutions for large organizations.', features: ['Unlimited Users', 'Custom AI Models', '24/7 Dedicated Support', 'Unlimited Storage', 'Advanced Security', 'Dedicated Account Manager'], highlighted: false, button: 'Contact Sales' }
];

const Pricing = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.pricing-card', {
      y: 50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '.pricing-grid', start: 'top 70%' }
    });

    // Floating effect for highlighted card
    gsap.to('.pricing-highlight', {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });

  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-24 bg-background border-t border-border/50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4">Pricing Plans</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your team's needs. No hidden fees.
          </p>
        </div>

        <div className="pricing-grid grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`pricing-card relative p-8 rounded-[32px] border flex flex-col h-full
                ${plan.highlighted 
                  ? 'pricing-highlight bg-surface border-primary shadow-[0_0_40px_rgba(255,102,26,0.1)] md:scale-105 z-10' 
                  : 'bg-[#0a0a0a] border-border hover:border-primary/50 transition-colors'
                }
              `}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(255,102,26,0.4)]">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-text-muted text-sm min-h-[40px]">{plan.desc}</p>
              </div>
              
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold">{plan.price}</span>
                <span className="text-text-muted">{plan.period}</span>
              </div>
              
              <button 
                className={`w-full py-4 rounded-full font-medium mb-8 transition-colors
                  ${plan.highlighted 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(255,102,26,0.2)]' 
                    : 'bg-surface-ii hover:bg-surface border border-border text-white'
                  }
                `}
              >
                {plan.button}
              </button>
              
              <div className="flex-grow space-y-4">
                <p className="text-sm font-medium mb-4">What's included:</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    <span className="text-sm text-text-muted">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
