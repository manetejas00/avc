import React, { useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Calculator } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Calculators = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'sip' | 'loan'>('sip');

  // SIP State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipRate, setSipRate] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // Loan State
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(20);

  useGSAP(() => {
    gsap.fromTo('.calc-header > *', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: containerRef.current, start: 'top 85%' } }
    );
    
    gsap.fromTo('.calc-box', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: containerRef.current, start: 'top 80%' } }
    );
  }, { scope: containerRef });

  // SIP Calculations
  const sipResult = useMemo(() => {
    const P = sipAmount;
    const i = sipRate / 12 / 100;
    const n = sipYears * 12;
    
    const investedAmount = P * n;
    let expectedValue = 0;
    
    if (i === 0) {
      expectedValue = investedAmount;
    } else {
      expectedValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }
    
    return {
      invested: investedAmount,
      wealthGained: expectedValue - investedAmount,
      totalValue: expectedValue
    };
  }, [sipAmount, sipRate, sipYears]);

  // Loan EMI Calculations
  const loanResult = useMemo(() => {
    const P = loanAmount;
    const r = loanRate / 12 / 100;
    const n = loanYears * 12;
    
    let emi = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    if (r === 0) {
      emi = P / n;
      totalPayment = P;
    } else {
      emi = P * r * (Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      totalPayment = emi * n;
      totalInterest = totalPayment - P;
    }

    return {
      emi: emi,
      totalInterest: totalInterest,
      totalPayment: totalPayment
    };
  }, [loanAmount, loanRate, loanYears]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section id="calculators" ref={containerRef} className="py-24 bg-background border-t border-white/5">
      <div className="container-custom">
        <div className="calc-header text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-surface-elevated mb-6">
            <Calculator size={16} className="text-gold-primary" />
            <span className="text-sm font-medium text-text">Smart Financial Tools</span>
          </div>
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Financial Calculators</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Plan your investments and loans with our interactive calculators.
          </p>
        </div>

        <div className="calc-box max-w-5xl mx-auto card-premium overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5">
            <button 
              onClick={() => setActiveTab('sip')}
              className={`flex-1 py-6 text-lg font-semibold transition-colors ${activeTab === 'sip' ? 'text-gold-primary border-b-2 border-gold-primary bg-surface-elevated' : 'text-text-muted hover:text-text hover:bg-surface-elevated'}`}
            >
              SIP Calculator
            </button>
            <button 
              onClick={() => setActiveTab('loan')}
              className={`flex-1 py-6 text-lg font-semibold transition-colors ${activeTab === 'loan' ? 'text-gold-primary border-b-2 border-gold-primary bg-surface-elevated' : 'text-text-muted hover:text-text hover:bg-surface-elevated'}`}
            >
              Home Loan EMI
            </button>
          </div>

          {/* Calculator Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              {/* Inputs */}
              <div className="space-y-8">
                {activeTab === 'sip' ? (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Monthly Investment</label>
                        <span className="text-gold-primary font-bold text-xl">{formatCurrency(sipAmount)}</span>
                      </div>
                      <input 
                        type="range" min="500" max="100000" step="500"
                        value={sipAmount} onChange={(e) => setSipAmount(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Expected Return Rate (p.a)</label>
                        <span className="text-gold-primary font-bold text-xl">{sipRate}%</span>
                      </div>
                      <input 
                        type="range" min="1" max="30" step="0.5"
                        value={sipRate} onChange={(e) => setSipRate(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Time Period</label>
                        <span className="text-gold-primary font-bold text-xl">{sipYears} Years</span>
                      </div>
                      <input 
                        type="range" min="1" max="40" step="1"
                        value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Loan Amount</label>
                        <span className="text-gold-primary font-bold text-xl">{formatCurrency(loanAmount)}</span>
                      </div>
                      <input 
                        type="range" min="100000" max="20000000" step="100000"
                        value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Interest Rate (p.a)</label>
                        <span className="text-gold-primary font-bold text-xl">{loanRate}%</span>
                      </div>
                      <input 
                        type="range" min="5" max="15" step="0.1"
                        value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-text font-medium">Loan Tenure</label>
                        <span className="text-gold-primary font-bold text-xl">{loanYears} Years</span>
                      </div>
                      <input 
                        type="range" min="1" max="30" step="1"
                        value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))}
                        className="w-full accent-gold-primary h-2 bg-background rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Results */}
              <div className="bg-background rounded-3xl p-8 border border-white/5">
                {activeTab === 'sip' ? (
                  <div className="space-y-8">
                    <div>
                      <p className="text-text-muted mb-1">Invested Amount</p>
                      <p className="text-2xl font-semibold text-text">{formatCurrency(sipResult.invested)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-1">Est. Returns</p>
                      <p className="text-2xl font-semibold text-gold-primary">{formatCurrency(sipResult.wealthGained)}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-text-muted mb-2 font-medium">Total Value</p>
                      <p className="text-4xl font-bold text-gold-primary">{formatCurrency(sipResult.totalValue)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <p className="text-text-muted mb-1">Principal Amount</p>
                      <p className="text-2xl font-semibold text-text">{formatCurrency(loanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-text-muted mb-1">Total Interest</p>
                      <p className="text-2xl font-semibold text-red-500">{formatCurrency(loanResult.totalInterest)}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <p className="text-text-muted mb-2 font-medium">Monthly EMI</p>
                      <p className="text-4xl font-bold text-gold-primary">{formatCurrency(loanResult.emi)}</p>
                    </div>
                  </div>
                )}
                
                <button className="w-full mt-8 btn-primary">
                  {activeTab === 'sip' ? 'Start Investing Now' : 'Apply for Loan'}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Calculators;
