import type React from 'react';
import { useEffect } from 'react';
import { X, Phone, MessageCircle } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useDialogFocus } from '../hooks/useDialogFocus';
interface ContactFormModalProps { isOpen: boolean; onClose: () => void }
const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose }) => {
  useBodyScrollLock(isOpen);
  useDialogFocus(isOpen, '[aria-labelledby="contact-modal-title"]');
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overscroll-contain" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
    <div className="bg-[#121214] border border-[#D4AF37]/30 w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-2xl shadow-2xl relative text-white" onClick={event=>event.stopPropagation()}>
      <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close contact options"><X size={22}/></button>
      <div className="p-5 sm:p-7 md:p-8">
        <p className="text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-2">AVC Dhanam Solutions • Leadership Advisory</p>
        <h2 id="contact-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-3 pr-10">Talk to Chandresh Pandey & the Team</h2>
        <p className="text-neutral-300 text-sm leading-relaxed mb-6">Connect directly with Director Chandresh Pandey and our senior advisory team. Call or WhatsApp to discuss loans, investments, insurance, or business financing. Ask about availability, documents, risks and charges before deciding.</p>
        <a href="tel:+917030247878" className="w-full min-h-[48px] bg-[#D4AF37] text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-3"><Phone size={19}/>Call +91 7030247878</a>
        <a href="https://wa.me/917030247878" target="_blank" rel="noreferrer" className="w-full min-h-[48px] border border-[#D4AF37]/50 text-[#D4AF37] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"><MessageCircle size={19}/>Open WhatsApp</a>
        <p className="text-neutral-400 text-xs leading-relaxed mt-5">Office: 210, Global Plaza, Global City, Virar West. Call to confirm a suitable time to visit.</p>
        <p className="text-neutral-400 text-xs leading-relaxed mt-3">WhatsApp opens an external service. Do not send bank details, passwords or identity documents in your first message.</p>
      </div>
    </div>
  </div>;
};
export default ContactFormModal;
