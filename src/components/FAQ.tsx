import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Minus } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  { question: "What services does AVC Dhanam offer?", answer: "We offer a comprehensive suite of wealth management services including Mutual Funds, SIPs, Equity Trading, PMS, AIF, IPO applications, Commodity Trading, Insurance, and Loans through our DSA network." },
  { question: "Are you registered with regulatory bodies?", answer: "Yes, we are a SEBI-authorised Sub Broker associated with Motilal Oswal and an AMFI-registered Mutual Fund Distributor." },
  { question: "What is TGS Algo Trading?", answer: "TGS is our proprietary algorithmic trading system designed to bring emotion-free, rule-based trading strategies to retail investors, aiming for consistent and disciplined performance." },
  { question: "How can I start investing with you?", answer: "You can book a free consultation via our website, WhatsApp, or phone. Our experts will guide you through our paperless, KYC-compliant onboarding process." },
];

const FAQ = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    // Reveal animation
    gsap.from('.faq-item', {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.1,
      scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
    });
  }, { scope: containerRef });

  const toggleAccordion = (index: number) => {
    const isOpening = openIndex !== index;
    
    // Close previously opened
    if (openIndex !== null && contentRefs.current[openIndex]) {
      gsap.to(contentRefs.current[openIndex], { height: 0, duration: 0.4, ease: 'power2.inOut' });
    }
    
    // Open new one
    if (isOpening && contentRefs.current[index]) {
      gsap.to(contentRefs.current[index], { height: 'auto', duration: 0.4, ease: 'power2.inOut' });
      setOpenIndex(index);
    } else {
      setOpenIndex(null);
    }
  };

  return (
    <section ref={containerRef} className="py-24 bg-background">
      <div className="container-custom max-w-4xl mx-auto">
        {/* AEO Schema Injection */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Frequently Asked Questions</h2>
          <p className="text-text-muted text-lg">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item border rounded-2xl transition-colors duration-300 overflow-hidden
                  ${isOpen ? 'bg-surface border-primary/50' : 'bg-transparent border-border hover:border-text-muted/50'}
                `}
              >
                <button 
                  className="w-full px-6 py-6 flex items-center justify-between text-left"
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="text-lg font-medium pr-8">{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-primary border-primary text-white rotate-180' : 'border-border text-text rotate-0'}
                  `}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <div 
                  ref={el => contentRefs.current[index] = el}
                  className="h-0 overflow-hidden"
                  style={{ height: index === 0 ? 'auto' : 0 }}
                >
                  <p className="px-6 pb-6 text-text-muted">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
