import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import Modal from './ui/Modal';
import { getApiUrl } from '../services/apiClient';

export default function ContactFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: 'General Consultation', preferredTime: 'Please call to arrange', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => { if (isOpen) { setStatus('idle'); setError(''); } return () => abortRef.current?.abort(); }, [isOpen]);
  if (!isOpen) return null;
  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const whatsapp = `https://wa.me/917030247878?text=${encodeURIComponent(`Callback request\nName: ${form.name}\nMobile: ${form.phone}\nService: ${form.interest}\nPreferred time (IST): ${form.preferredTime}\n${form.message}`)}`;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setStatus('submitting'); setError('');
    const controller = new AbortController(); abortRef.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(getApiUrl('/api/submit-form'), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(form), signal: controller.signal });
      if (!response.headers.get('content-type')?.includes('application/json')) throw Error('Online callback requests are unavailable. Please send the details on WhatsApp or call us.');
      const data = await response.json();
      if (!response.ok || data.success !== true) throw Error(data.error || 'The request was not received. Please use WhatsApp or call.');
      setStatus('success'); setForm({ name: '', phone: '', email: '', interest: 'General Consultation', preferredTime: 'Please call to arrange', message: '' });
    } catch (err) { setStatus('error'); setError(err instanceof Error && err.name !== 'AbortError' ? err.message : 'We could not confirm receipt. Please send your request on WhatsApp or call.'); }
    finally { window.clearTimeout(timer); }
  }
  return <Modal onClose={onClose} className="care-modal" aria-labelledby="contact-modal-title"><div className="care-modal-panel"><button className="care-modal-close" onClick={onClose} aria-label="Close callback form"><X /></button>
    {status === 'success' ? <div className="care-success" role="status"><CheckCircle size={36} /><h2 id="contact-modal-title">Request received</h2><p>Your callback request has been accepted for our team. Your preferred time is a request, not a confirmed appointment.</p><a href="tel:+917030247878">Need help sooner? Call +91 7030247878</a><button className="care-button" onClick={onClose}>Close</button></div> : <><p className="care-kicker">LET’S TALK</p><h2 id="contact-modal-title">Book a callback</h2><p>Leave your number and tell us what you need. Email is optional.</p><form onSubmit={submit} className="care-fields">
    <label htmlFor="contact-name">Your name<input id="contact-name" name="name" autoComplete="name" required maxLength={120} value={form.name} onChange={change} /></label>
    <label htmlFor="contact-phone">Mobile number<input id="contact-phone" name="phone" type="tel" autoComplete="tel" required pattern="[+0-9 ()-]{7,25}" maxLength={25} value={form.phone} onChange={change} /></label>
    <label htmlFor="contact-email">Email (optional)<input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={change} /></label>
    <label htmlFor="contact-interest">Service<select id="contact-interest" name="interest" value={form.interest} onChange={change}>{['General Consultation', 'Mutual Funds & Wealth Management', 'Business & Personal Loans', 'Insurance Protection', 'Tax Planning & CA Services', 'Existing Client Support'].map(item => <option key={item}>{item}</option>)}</select></label>
    <label htmlFor="contact-time">Preferred contact time (IST)<select id="contact-time" name="preferredTime" value={form.preferredTime} onChange={change}>{['Please call to arrange', 'Weekday morning (10 AM – 12 PM)', 'Weekday afternoon (12 PM – 4 PM)', 'Weekday evening (4 PM – 6 PM)', 'Saturday (please confirm availability)'].map(item => <option key={item}>{item}</option>)}</select></label>
    <label htmlFor="contact-message">How can we help? (optional)<textarea id="contact-message" name="message" maxLength={2000} rows={3} value={form.message} onChange={change} /></label>
    <small>By submitting, you ask our team to contact you about this enquiry. Do not include account numbers, PAN, health records, passwords or OTPs. <a href="/disclosures">Privacy details</a>.</small>
    {status === 'error' && <p role="alert" className="care-error">{error}</p>}
    <button className="care-button" type="submit" disabled={status === 'submitting'}>{status === 'submitting' ? <><Loader2 size={18} /> Sending…</> : 'Send callback request'}</button>
    <a href={whatsapp} target="_blank" rel="noreferrer" className="care-link">Send these details on WhatsApp</a><small>WhatsApp opens a draft. Press Send there to deliver it.</small><a href="tel:+917030247878">Or call +91 7030247878</a>
    </form></>}
  </div></Modal>;
}
