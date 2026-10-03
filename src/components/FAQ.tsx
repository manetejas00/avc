import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Minus, HelpCircle, ChevronDown } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const faqs = [
  {
    question: "What is AVC Dhanam Solutions Pvt. Ltd.?",
    answer: "AVC Dhanam Solutions Pvt. Ltd. is a premier financial consultancy firm based in Virar West, Mumbai Metropolitan Region. Operating for over 8 years under Directors Chandresh Pandey and Ajay Pandey, AVC Dhanam provides a complete financial journey under one roof, offering investments, mutual funds, loans, insurance, tax planning, and corporate business funding."
  },
  {
    question: "What services does AVC Dhanam Solutions provide?",
    answer: "AVC Dhanam Solutions offers a complete financial suite including Mutual Funds & SIP Planning, Equity Market Guidance, IPO Advisory, Personal Loans, Business Loans, Home Loans, Loan Against Property (LAP), Working Capital, MSME/SME Funding, Startup & Construction Finance, Life & Health Insurance, Corporate Tax Planning & Business Accounting (via a network of 10+ CAs), Merchant Banking Advisory, and Retirement Planning."
  },
  {
    question: "Where is AVC Dhanam Solutions located in Virar?",
    answer: "AVC Dhanam Solutions Pvt. Ltd. is located at 210, Second Floor, Global Plaza, Global City, Virar West, Maharashtra – 401305. We serve clients across Virar, Vasai, Palghar District, and the broader Mumbai Metropolitan Region."
  },
  {
    question: "Who are the directors of AVC Dhanam Solutions Pvt. Ltd.?",
    answer: "The company is led by Directors Chandresh Pandey and Ajay Pandey, who have clearly divided management responsibilities across business consultancy, investment planning, banking partnerships, and corporate advisory services."
  },
  {
    question: "Does AVC Dhanam Solutions provide mutual fund services and SIP guidance?",
    answer: "Yes. AVC Dhanam Solutions is an AMFI-registered Mutual Fund Distributor (ARN-184920) and Motilal Oswal franchise partner with 8+ years of experience and ₹15+ Crore AUM. We assist clients in designing goal-based SIP and lumpsum mutual fund portfolios matched to their risk profile and investment horizon."
  },
  {
    question: "Does AVC Dhanam Solutions provide loan consultancy?",
    answer: "Yes. AVC Dhanam Solutions operates as a financial consultancy with strong relationships across 210+ Banks, NBFCs, and financial partners. We evaluate client eligibility and connect individuals and businesses with suitable Personal Loans, Business Loans, Home Loans, LAP, and Working Capital solutions."
  },
  {
    question: "Does AVC Dhanam Solutions help startups raise business funding?",
    answer: "Yes. We offer startup funding consultation, debt structuring, expansion capital guidance, and corporate fundraising advisory by connecting growth-stage businesses with suitable financial institutions and merchant banking channels."
  },
  {
    question: "Does AVC Dhanam Solutions provide construction funding consultancy?",
    answer: "Yes. We consult real estate developers, builders, and infrastructure enterprises on construction finance, project funding, structured property financing, and developer loan requirements."
  },
  {
    question: "Does AVC Dhanam Solutions provide retirement planning services?",
    answer: "Yes. We structure disciplined long-term retirement strategies utilizing SIPs, asset allocation, inflation-adjusted wealth compounding, and capital protection plans so clients can build a reliable retirement corpus."
  },
  {
    question: "Does AVC Dhanam Solutions provide insurance services?",
    answer: "Yes. We assist clients with Life Insurance, Health Insurance, Family Financial Security Plans, and Corporate Business Protection as a core protective component of a complete financial plan."
  },
  {
    question: "Does AVC Dhanam Solutions provide IPO advisory services?",
    answer: "Yes. We offer IPO application guidance and market intelligence to help investors evaluate upcoming public offerings across Mainboard and SME equity platforms through registered partner channels."
  },
  {
    question: "Does AVC Dhanam Solutions help with tax planning and business accounting?",
    answer: "Yes. Through our professional network and team of 10+ Chartered Accountants, we support clients with tax planning, tax-saving investment strategies, business accounting, audit preparation, financial documentation, and corporate compliance."
  },
  {
    question: "How can I contact AVC Dhanam Solutions in Virar West?",
    answer: "You can reach AVC Dhanam Solutions Pvt. Ltd. by phone at +91 7030247878, by email at support@avcdhanam.com, or visit our office at 210, Second Floor, Global Plaza, Global City, Virar West, Maharashtra – 401305."
  },
  {
    question: "Where can I find a reliable financial consultant in Virar and Mumbai?",
    answer: "AVC Dhanam Solutions Pvt. Ltd. is located in Global City, Virar West, providing one-stop financial consultancy across Palghar District, Vasai-Virar, and the Mumbai Metropolitan Region with 8+ years of proven market experience and 500+ satisfied clients."
  },
  {
    question: "How do I choose a SIP or mutual fund based on my financial goals?",
    answer: "Choosing the right SIP depends on your financial milestone, target horizon, risk tolerance, and tax status. Our consultants analyze your cash flows and recommend suitable equity, hybrid, or debt fund allocations without promising fixed or guaranteed returns."
  },
  {
    question: "What documents are generally required for business funding and loan applications?",
    answer: "Typical business loan documentation includes company registration certificates, GST returns, 2–3 years audited financial statements, bank account statements for the last 12 months, director/promoter KYC documents, and business profile/project reports."
  },
  {
    question: "How does retirement planning work with AVC Dhanam Solutions?",
    answer: "Retirement planning begins by estimating your future monthly living expenses adjusted for inflation, defining your target retirement age, calculating the required corpus, and building a disciplined monthly SIP and asset allocation strategy."
  },
  {
    question: "What is AVC Dhanam Solutions' financial literacy initiative?",
    answer: "AVC Dhanam Solutions Pvt. Ltd. collaborates with Avinya Care Foundation (www.avinyacarefoundation.org) to conduct community financial literacy and education drives focused on basic saving habits, investment risks, responsible borrowing, and insurance awareness."
  }
];

const FAQ = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const displayedFaqs = showAll ? faqs : faqs.slice(0, 4);

  useGSAP(() => {
    const scope = containerRef.current;
    if (!scope) return;
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: scope, start: 'top 80%', once: true }
    });
    timeline.fromTo('.faq-eyebrow, .faq-title, .faq-copy', 
      { y: 28, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' }
    ).fromTo('.faq-item', 
      { y: 34, autoAlpha: 0, rotateX: -5 }, 
      { y: 0, autoAlpha: 1, rotateX: 0, stagger: 0.06, duration: 0.75, ease: 'power3.out' }, '-=0.45'
    );
  }, { scope: containerRef });

  const toggleShowAll = () => {
    if (!showAll) {
      setShowAll(true);
      setTimeout(() => {
        const extraCards = containerRef.current?.querySelectorAll('.faq-item-more');
        if (extraCards && extraCards.length) {
          gsap.fromTo(extraCards, 
            { y: 24, autoAlpha: 0 }, 
            { y: 0, autoAlpha: 1, stagger: 0.04, duration: 0.5, ease: 'power3.out' }
          );
        }
      }, 10);
    } else {
      setShowAll(false);
      const section = containerRef.current;
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const toggleAccordion = (index: number) => {
    const isOpening = openIndex !== index;
    
    if (openIndex !== null && contentRefs.current[openIndex]) {
      const closingEl = contentRefs.current[openIndex];
      gsap.to(closingEl, { 
        height: 0, 
        duration: 0.4, 
        ease: 'power3.inOut' 
      });
    }
    
    if (isOpening && contentRefs.current[index]) {
      const openingEl = contentRefs.current[index];
      gsap.fromTo(openingEl, 
        { height: 0 }, 
        { 
          height: 'auto', 
          duration: 0.45, 
          ease: 'power3.out',
          onComplete: () => {
            const cardEl = itemRefs.current[index];
            if (cardEl) {
              const rect = cardEl.getBoundingClientRect();
              if (rect.top < 100 || rect.bottom > window.innerHeight - 50) {
                cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          }
        }
      );
      setOpenIndex(index);
    } else {
      setOpenIndex(null);
    }
  };

  return (
    <section id="faq" ref={containerRef} className="py-24 bg-[#f7f7f5] text-[#18181b] border-t border-[#e4e4e0] transition-colors">
      <div className="container-custom max-w-4xl mx-auto px-4">
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
          <span className="faq-eyebrow v1-index text-[#b68b10] text-xs font-mono tracking-widest uppercase mb-2 block font-bold">07 — KNOWLEDGE BASE & FAQ</span>
          <h2 className="faq-title text-3xl md:text-5xl font-semibold mb-4 text-[#18181b] flex items-center justify-center gap-3">
            <HelpCircle className="text-[#b68b10]" size={36} /> Frequently Asked Questions
          </h2>
          <p className="faq-copy text-[#71717a] text-base max-w-2xl mx-auto">
            Clear, compliant answers to your queries about wealth management, loans, insurance, business funding, tax planning, and our services in Virar & Mumbai.
          </p>
        </div>

        <div className="space-y-4">
          {displayedFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const isMoreItem = index >= 4;
            return (
              <div 
                key={index} 
                ref={el => itemRefs.current[index] = el}
                className={`faq-item ${isMoreItem ? 'faq-item-more' : ''} border rounded-2xl transition-all duration-300 overflow-hidden
                  ${isOpen ? 'bg-[#ffffff] border-[#d4af37] shadow-lg' : 'bg-[#ffffff] border-[#e4e4e0] hover:border-[#b68b10]/60 hover:shadow-md'}
                `}
              >
                <button 
                  className="w-full px-6 py-5 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4af37]"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg font-semibold pr-6 text-[#18181b]">{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-[#d4af37] border-[#d4af37] text-black rotate-180' : 'border-[#d4af37]/40 text-[#b68b10] bg-[#f9f9f6] rotate-0'}
                  `}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <div 
                  ref={el => contentRefs.current[index] = el}
                  className="h-0 overflow-hidden"
                  style={{ height: index === 0 ? 'auto' : 0 }}
                >
                  <p className="px-6 pb-6 text-[#52525b] text-sm md:text-base leading-relaxed border-t border-[#f0f0ed] pt-4 mt-1">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {faqs.length > 4 && (
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={toggleShowAll}
              className="inline-flex items-center gap-2 border border-[#d4af37] bg-white text-[#18181b] hover:bg-[#d4af37] hover:text-black font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{showAll ? 'Show Less Questions' : `Read More Questions (${faqs.length - 4} More)`}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQ;

