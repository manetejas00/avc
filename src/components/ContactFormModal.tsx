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
    interest: 'Consultation',
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
    setStatus('error');
    setErrorMessage('This is a static site. Connect this form to your preferred email or form service before publishing.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gold-primary/80 backdrop-blur-sm">
      <div className="bg-surface border border-white/5 w-full max-w-lg rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {status === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gold-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-text mb-2">Thank You!</h3>
              <p className="text-text-muted">
                Your request has been submitted successfully. Our team will contact you shortly.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-text mb-2">Book a Consultation</h2>
              <p className="text-text-muted mb-6">Take the first step towards managing your wealth effectively.</p>
              
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
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Area of Interest</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all"
                  >
                    <option value="Consultation">General Consultation</option>
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Portfolio Management">Portfolio Management</option>
                    <option value="Tax Planning">Tax Planning</option>
                    <option value="Insurance">Insurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-1">Message (Optional)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-white/5 rounded-lg text-text focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-gold-primary hover:bg-gold-secondary text-bg-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                  ) : (
                    'Submit Request'
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
