import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Mutual Funds & Wealth Management',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overscroll-contain"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div 
        className="bg-[#121214] border border-[#D4AF37]/30 w-full max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain rounded-2xl shadow-2xl relative text-white animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close consultation modal"
        >
          <X size={22} />
        </button>

        <div className="p-5 sm:p-7 md:p-8">
          {status === 'success' ? (
            <div className="text-center py-8 sm:py-12">
              <CheckCircle className="w-14 h-14 sm:w-16 sm:h-16 text-[#D4AF37] mx-auto mb-5" />
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-neutral-300 text-sm leading-relaxed max-w-sm mx-auto">
                Your request has been received. A Senior Financial Consultant from AVC Dhanam Solutions Pvt. Ltd. will contact you shortly.
              </p>
              <div className="mt-6 p-3 rounded-xl bg-black/40 border border-[#D4AF37]/20 text-xs text-[#D4AF37] font-mono">
                Office: 210, Global Plaza, Global City, Virar West · Call: +91 7030247878
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F4D675] transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
                <span>Direct Consultant Access</span>
              </div>
              <h2 id="contact-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-1">
                Talk to a Financial Consultant
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mb-6">
                AVC Dhanam Solutions Pvt. Ltd. • Virar West & Mumbai Metropolitan Region
              </p>
              
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-xs">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-neutral-300 mb-1">Full Name *</label>
                  <input
                    id="contact-name"
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 min-h-[44px] bg-[#050505] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-neutral-300 mb-1">Email Address *</label>
                    <input
                      id="contact-email"
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 min-h-[44px] bg-[#050505] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-neutral-300 mb-1">Phone Number *</label>
                    <input
                      id="contact-phone"
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 min-h-[44px] bg-[#050505] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      placeholder="+91 7030247878"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-interest" className="block text-xs font-semibold text-neutral-300 mb-1">Financial Requirement *</label>
                  <select
                    id="contact-interest"
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 min-h-[44px] bg-[#050505] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all cursor-pointer"
                  >
                    <option value="Mutual Funds & Wealth Management">Mutual Funds & SIP Planning</option>
                    <option value="Business & Personal Loans">Loans (Business, Personal, Home, LAP, Working Capital)</option>
                    <option value="Insurance Protection">Insurance (Life, Health, General, Business)</option>
                    <option value="Tax Planning & CA Services">Tax Planning & Accounting (10+ CA Network)</option>
                    <option value="Merchant Banking & Business Funding">Merchant Banking & Corporate Funding</option>
                    <option value="Retirement & Goal Planning">Retirement & Financial Goal Planning</option>
                    <option value="General Consultation">General Financial Consultation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-neutral-300 mb-1">How Can We Help You? (Optional)</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-[#050505] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                    placeholder="Briefly describe your financial goals, funding requirement, or queries..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full min-h-[48px] bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#F4D675] hover:to-[#D4AF37] active:scale-[0.98] text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#D4AF37]/20"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                  ) : (
                    'Schedule Consultation'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactFormModal;

