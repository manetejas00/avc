import React, { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle, Lock, Phone, ShieldCheck, Sparkles, X } from 'lucide-react';
import { EBook } from '../services/ebookService';

interface EbookCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: EBook | null;
}

export default function EbookCheckoutModal({ isOpen, onClose, book }: EbookCheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  if (!isOpen || !book) return null;

  const validate = () => {
    const errs: { name?: string; phone?: string; email?: string } = {};
    if (!customerName.trim()) errs.name = 'Full name is required';
    if (!phone.trim() || phone.trim().length < 10) errs.phone = 'Valid 10-digit mobile number is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email address is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setStep('payment');
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setCustomerName('');
    setPhone('');
    setEmail('');
    setErrors({});
    onClose();
  };

  // WhatsApp Message Generation
  const rawWhatsappMsg = `Hello, I want to purchase ${book.title} for ₹${book.sellingPrice}. My name is ${customerName.trim() || 'Customer'}. Please help me complete my purchase.`;
  const whatsappUrl = `https://wa.me/917030247878?text=${encodeURIComponent(rawWhatsappMsg)}`;
  const callUrl = 'tel:7030247878';

  const originalPrice = book.originalPrice;
  const sellingPrice = book.sellingPrice;
  const discountAmount = originalPrice - sellingPrice;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={resetAndClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#0D0D0D] border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 text-white transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {step === 'details' ? (
          <div>
            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} /> Instant Access Checkout
            </div>
            <h2 id="checkout-modal-title" className="text-xl md:text-2xl font-bold text-white mb-1">
              Complete Your Purchase
            </h2>
            <p className="text-xs text-neutral-400 mb-6">
              Enter your contact details to proceed to secure payment.
            </p>

            {/* Selected Book Summary Box */}
            <div className="p-4 rounded-xl bg-[#151515] border border-white/5 mb-6 flex items-start gap-4">
              <div
                className={`w-14 h-18 rounded-lg bg-gradient-to-br ${book.coverGradient} flex-shrink-0 flex items-center justify-center text-[#D4AF37] font-bold text-xs p-1 shadow-md border border-[#D4AF37]/20`}
              >
                <BookOpen size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#D4AF37]/10 text-[#D4AF37] mb-1">
                  {book.category}
                </span>
                <h3 className="text-sm font-semibold text-white truncate">{book.title}</h3>
                <p className="text-xs text-neutral-400 truncate">{book.author}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-base font-bold text-emerald-400">₹{book.sellingPrice}</span>
                  <span className="text-xs text-neutral-500 line-through">₹{book.originalPrice}</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {book.discountPercent}% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-4 py-3 rounded-xl bg-[#111111] border ${
                    errors.name ? 'border-red-500' : 'border-white/10 focus:border-[#D4AF37]'
                  } text-white text-sm outline-none transition-colors`}
                />
                {errors.name && <p className="text-[11px] text-red-400 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className={`w-full px-4 py-3 rounded-xl bg-[#111111] border ${
                      errors.phone ? 'border-red-500' : 'border-white/10 focus:border-[#D4AF37]'
                    } text-white text-sm outline-none transition-colors`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-400 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full px-4 py-3 rounded-xl bg-[#111111] border ${
                      errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#D4AF37]'
                    } text-white text-sm outline-none transition-colors`}
                  />
                  {errors.email && <p className="text-[11px] text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="p-4 rounded-xl bg-[#151515] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Book Original Price:</span>
                  <span className="line-through">₹{originalPrice}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Discount Applied ({book.discountPercent}%):</span>
                  <span>-₹{discountAmount}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Payable:</span>
                  <span className="text-[#D4AF37]">₹{sellingPrice}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
              >
                Proceed to Payment <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck size={14} className="text-emerald-400" /> Guaranteed 100% Privacy & Instant Digital Delivery
            </div>
          </div>
        ) : (
          <div className="text-center py-2 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mx-auto flex items-center justify-center mb-4 border border-[#D4AF37]/20">
              <Lock size={28} />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-400 mb-3 border border-amber-400/20">
              Payment Gateway Coming Soon
            </span>

            <h2 className="text-xl font-bold text-white mb-2">Direct Purchase Assistance</h2>

            <p className="text-xs md:text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
              Online payment is currently being enabled. To purchase this e-book, please contact us directly by Call or WhatsApp.
            </p>

            {/* Book & Customer Summary */}
            <div className="p-4 rounded-xl bg-[#151515] border border-white/5 mb-6 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-400">Selected Book:</span>
                <span className="text-white font-semibold truncate max-w-[200px]">{book.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer Name:</span>
                <span className="text-white font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Total Price:</span>
                <span className="text-[#D4AF37] font-bold text-sm">₹{book.sellingPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                Buy via WhatsApp
              </a>

              <a
                href={callUrl}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Phone size={18} className="text-[#D4AF37]" />
                Call Now (+91 7030247878)
              </a>
            </div>

            <button
              type="button"
              onClick={() => setStep('details')}
              className="mt-4 text-xs text-neutral-400 hover:text-white underline transition-colors"
            >
              ← Back to Customer Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
