import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, PiggyBank, Briefcase, Diamond, Rocket, Coins, ShieldCheck, Banknote, Bot, Globe } from 'lucide-react';

const services = [
  { title: 'Equity & Stock Market', desc: 'Trade and invest in NSE and BSE listed stocks with dedicated support from our Motilal Oswal-backed research desk.', bgColor: 'bg-primary', Icon: TrendingUp },
  { title: 'Mutual Funds & SIPs', desc: 'Build long-term wealth through SIPs, lump-sum investments, ELSS tax-saving funds, and goal-based portfolios.', bgColor: 'bg-green', Icon: PiggyBank },
  { title: 'Portfolio Management', desc: 'Curated, high-conviction portfolios for HNI and growing investors who want active, professionally managed equity exposure.', bgColor: 'bg-primary/80', Icon: Briefcase },
  { title: 'Alternative Investments', desc: 'Access Category I, II, and III AIFs for diversified, sophisticated investment strategies.', bgColor: 'bg-green/80', Icon: Diamond },
  { title: 'IPO Investment', desc: 'Apply for the latest NSE and BSE IPOs online with guided support — from application to allotment tracking.', bgColor: 'bg-primary', Icon: Rocket },
  { title: 'Commodity Trading', desc: 'Trade in gold, silver, crude oil, and agri-commodities on MCX with full brokerage support.', bgColor: 'bg-green', Icon: Coins },
  { title: 'Insurance Solutions', desc: 'Term insurance, health insurance, and investment-linked plans matched to your family\'s real needs.', bgColor: 'bg-primary/80', Icon: ShieldCheck },
  { title: 'Loans via 210+ Partners', desc: 'Home, personal, business, and loans against mutual funds — sourced competitively across our DSA network.', bgColor: 'bg-green/80', Icon: Banknote },
  { title: 'TGS Algo Trading', desc: 'Our proprietary algorithmic trading system brings rule-based, emotion-free trading strategies to Indian retail investors.', bgColor: 'bg-primary', Icon: Bot },
  { title: 'US Stocks & Global Investing', desc: 'Diversify your portfolio globally. Invest in top US tech giants and international ETFs with zero commission on foreign stocks.', bgColor: 'bg-green', Icon: Globe },
];

const Benefits = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = React.useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.benefit-card', 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [showAll]); // Re-run animation when showAll changes

  const displayedServices = showAll ? services : services.slice(0, 6);

  return (
    <section ref={sectionRef} id="services" className="py-24 bg-background">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Comprehensive Wealth Solutions</h2>
          <p className="text-text-muted text-lg max-w-3xl mx-auto">
            From the salaried professional to the small business owner, we bring institutional-grade investment access to everyday Indian investors, with complete transparency and SEBI-compliant processes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedServices.map((service, index) => (
            <div key={index} className="benefit-card bg-surface rounded-card p-8 border border-border hover:-translate-y-2 hover:border-primary/50 transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${service.bgColor} mb-6 flex items-center justify-center`}>
                <service.Icon className="text-white" size={24} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-text">{service.title}</h3>
              <p className="text-text-muted">{service.desc}</p>
            </div>
          ))}
        </div>

        {services.length > 6 && (
          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="bg-surface-ii hover:bg-surface border border-border text-text px-8 py-3.5 rounded-full font-medium transition-colors"
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
