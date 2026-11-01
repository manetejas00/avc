import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Minus, HelpCircle, ChevronDown } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    "question": "What is a SIP?",
    "answer": "A Systematic Investment Plan lets you invest a chosen amount in a mutual fund at regular intervals. It is a payment method, not a separate investment or a promise of returns. You can lose money when markets fall."
  },
  {
    "question": "What does NAV mean?",
    "answer": "Net Asset Value is a mutual fund’s per-unit value for a stated valuation date. It is not an intraday share price. A lower NAV does not mean a fund is cheaper or better. Check the plan, option and NAV date."
  },
  {
    "question": "How do I get started?",
    "answer": "Call +91 7030247878 or WhatsApp the same number. Tell us the service you need. Before proceeding, confirm the provider’s current registration, charges and written terms. The office is at 210, Global Plaza, Global City, Virar West."
  },
  {
    "question": "Which documents might a lender ask for?",
    "answer": "Salaried applicants: identity and address proof, salary slips, bank statements and Form 16. Self-employed applicants: KYC, income-tax returns, bank statements and proof of work. Businesses: registration, financial statements, GST returns where applicable, bank statements and a business profile. Requirements and periods differ by lender. Do not upload documents here."
  },
  {
    "question": "What is the difference between Direct and Regular mutual fund plans?",
    "answer": "They are different plans of a scheme with different expenses and NAVs. Regular plans include distribution costs. Check the exact plan name, fees and scheme documents. Growth and IDCW are different options; IDCW payments are not assured and reduce NAV when paid."
  },
  {
    "question": "Can stock, IPO or mutual fund returns be guaranteed?",
    "answer": "No. Prices and NAVs can fall. IPO allotment and listing gains are not assured. Read the offer or scheme documents and consider your ability to bear losses. Past returns do not predict future results."
  },
  {
    "question": "What should I ask about PMS and AIF?",
    "answer": "Portfolio Management Services and Alternative Investment Funds have provider-specific eligibility, minimum commitments, fees and risks. They may have limited liquidity. Ask for current eligibility rules and the registered provider’s documents. Availability through AVC must be confirmed with the team."
  },
  {
    "question": "What are pre-IPO and unlisted shares?",
    "answer": "These are shares not currently traded on a recognised stock exchange. Valuation can be uncertain and selling may be difficult. A future IPO, listing date or exit is not guaranteed. Confirm ownership, transfer restrictions, eligibility and provider details before considering them."
  },
  {
    "question": "Are loan or insurance approvals guaranteed?",
    "answer": "No. Lenders assess income, credit history, documents and security. Insurers apply underwriting and policy conditions. Compare total costs, exclusions and obligations before signing."
  },
  {
    "question": "What do the calculators assume?",
    "answer": "The SIP calculator uses payments at the start of each month and an annual assumed return divided by 12. Loan EMI uses a constant rate on a reducing balance. Estimates exclude fees and taxes. Retirement uses a simple 25-times annual expense rule, not a full retirement plan."
  },
  {
    "question": "How is market information sourced?",
    "answer": "TradingView provides embedded market widgets. Other market figures show their source and quote time. Exchange delays vary. A failed feed is shown as Data unavailable. Use official exchange and product documents to verify information."
  },
  {
    "question": "Who leads AVC Dhanam Solutions?",
    "answer": "Chandresh Pandey and Ajay Pandey are the directors shown on this website. Ask the team for current professional registrations, service roles and provider details before proceeding."
  },
  {
    "question": "How can I arrange a conversation?",
    "answer": "Call or WhatsApp +91 7030247878 to discuss a suitable time. The website does not collect callback requests or confirm appointments."
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
        section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      }
    }
  };

  const toggleAccordion = (index: number) => {
    const isOpening = openIndex !== index;
    
    if (openIndex !== null && contentRefs.current[openIndex]) {
      const closingEl = contentRefs.current[openIndex];
      gsap.to(closingEl, { 
        height: 0, 
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.4,
        ease: 'power3.inOut' 
      });
    }
    
    if (isOpening && contentRefs.current[index]) {
      const openingEl = contentRefs.current[index];
      gsap.fromTo(openingEl, 
        { height: 0 }, 
        { 
          height: 'auto', 
          duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.45,
          ease: 'power3.out',
          onComplete: () => {
            const cardEl = itemRefs.current[index];
            if (cardEl) {
              const rect = cardEl.getBoundingClientRect();
              if (rect.top < 100 || rect.bottom > window.innerHeight - 50) {
                cardEl.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'nearest' });
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
    <section id="faq" ref={containerRef} className="py-20 md:py-28 bg-[#0d0d10] text-[#f4f4f5] border-t border-white/10 transition-colors">
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
        <div className="text-center mb-12 md:mb-16">
          <span className="faq-eyebrow v1-index text-[#D4AF37] text-xs font-mono tracking-widest uppercase mb-2 block font-bold">07 — KNOWLEDGE BASE & FAQ</span>
          <h2 className="faq-title text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-white flex items-center justify-center gap-3">
            <HelpCircle className="text-[#D4AF37]" size={32} /> Frequently Asked Questions
          </h2>
          <p className="faq-copy text-[#a1a1aa] text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Simple answers about investments, borrowing, insurance and getting started. This information is educational.
          </p>
        </div>

        <div className="space-y-3.5">
          {displayedFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const isMoreItem = index >= 4;
            return (
              <div 
                key={index} 
                ref={el => itemRefs.current[index] = el}
                className={`faq-item ${isMoreItem ? 'faq-item-more' : ''} border rounded-2xl transition-all duration-300 overflow-hidden
                  ${isOpen ? 'bg-[#18181c] border-[#D4AF37] shadow-lg shadow-black/40' : 'bg-[#121215] border-white/10 hover:border-[#D4AF37]/40 hover:bg-[#16161a]'}
                `}
              >
                <button 
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] min-h-[44px]"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base md:text-lg font-semibold pr-4 text-white">{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-[#D4AF37] border-[#D4AF37] text-black rotate-180' : 'border-[#D4AF37]/40 text-[#F4D675] bg-black/40 rotate-0'}
                  `}>
                    {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <div 
                  ref={el => contentRefs.current[index] = el}
                  className="h-0 overflow-hidden"
                  style={{ height: index === 0 ? 'auto' : 0 }}
                >
                  <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[#a1a1aa] text-sm md:text-base leading-relaxed border-t border-white/5 pt-4 mt-1">
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
              className="inline-flex items-center gap-2 border border-[#D4AF37]/40 bg-[#121215] text-[#F4D675] hover:bg-[#D4AF37] hover:text-black font-semibold text-sm px-6 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer min-h-[44px]"
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

