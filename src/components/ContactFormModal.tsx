import React, { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Mutual Funds & Wealth Management',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gold-primary/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/5 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors z-10"
          aria-label="Close consultation modal"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gold-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-text mb-2">Thank You!</h3>
              <p className="text-text-muted">
                Your request has been received. A Senior Financial Consultant from AVC Dhanam Solutions Pvt. Ltd. will contact you shortly.
              </p>
              <p className="text-xs text-gold-primary mt-4 font-mono">
                Office: 210, Global Plaza, Global City, Virar West | Call: +91 7030247878
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-text mb-1">Talk to a Financial Consultant</h2>
              <p className="text-text-muted text-sm mb-6">AVC Dhanam Solutions Pvt. Ltd. • Virar West & Mumbai Metropolitan Region</p>
              
              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-6 text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">Phone Number *</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
                      placeholder="+91 7030247878"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Financial Requirement *</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
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
                  <label className="block text-sm font-medium text-text mb-1">How Can We Help You? (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="Briefly describe your financial goals, funding requirement, or queries..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-gold-primary hover:bg-gold-secondary text-bg-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
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

