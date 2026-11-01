import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { testimonialDrafts } from '../data/testimonials';

export default function Testimonials() {
  const reviews = testimonialDrafts;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const rotating = reviews.length > 1 && !paused && !hovered && !focused && !reducedMotion;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % reviews.length), 6000);
    return () => window.clearInterval(timer);
  }, [rotating, reviews.length]);
  const review = reviews[index % Math.max(1, reviews.length)];
  const move = (step: number) => setIndex(current => (current + step + reviews.length) % reviews.length);

  return <section id="testimonials" className="py-24 bg-surface-elevated overflow-hidden scroll-mt-24" aria-labelledby="testimonials-heading">
    <div className="container-custom">
      <div className="text-center mb-8">
        <h2 id="testimonials-heading" className="text-4xl md:text-[52px] font-semibold mb-4">Testimonials</h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">Illustrative testimonial drafts—not actual client reviews. Names, roles and images are not verified client identities.</p>
      </div>
      {review ? <div className="client-review-carousel max-w-2xl mx-auto" role="region" aria-roledescription="carousel" aria-label="Illustrative testimonial drafts"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className="client-review-card bg-surface rounded-card p-8 border border-white/5" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${reviews.length}`} aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
          <div className="illustrative-story-content">
            <p className="illustrative-story-label">Illustrative testimonial draft—not a verified client review</p>
            <p className="client-review-quote">“{review.quote}”</p>
            <div className="illustrative-story-person"><img src={review.image} className="illustrative-avatar testimonial-draft-photo" alt="Illustrative profile image; identity unverified" width="64" height="64" loading="lazy"/><div><p className="client-review-name">{review.name}</p><p className="illustrative-person-label">{review.role}</p><p className="illustrative-person-label">Illustrative profile · not a verified client</p></div></div>
          </div>
        </div>
        {reviews.length > 1 && <div className="client-review-controls">
          <button type="button" onClick={() => move(-1)} aria-label="Previous example"><ChevronLeft size={20}/></button>
          <span className="client-review-position">{index + 1} / {reviews.length}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next example"><ChevronRight size={20}/></button>
          {!reducedMotion && <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Start automatic examples' : 'Pause automatic examples'}>{paused ? <Play size={18}/> : <Pause size={18}/>}</button>}
        </div>}
      </div> : <div className="max-w-2xl mx-auto bg-surface rounded-card p-8 border border-white/5 text-text-muted text-center">Reviews will be shared only with the reviewer’s permission. To understand our services, <a className="text-gold-primary underline" href="tel:+917030247878">speak with the team</a>.</div>}
    </div>
  </section>;
}
