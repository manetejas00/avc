import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { illustrativeStories } from '../data/testimonials';
import IllustratedAvatar from './IllustratedAvatar';

export default function Testimonials() {
  const reviews = illustrativeStories.slice(0, 10);
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
        <h2 id="testimonials-heading" className="text-4xl md:text-[52px] font-semibold mb-4">Everyday financial journeys</h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">Illustrative examples—not actual client reviews. All names, characters and situations are fictional.</p>
      </div>
      {review ? <div className="client-review-carousel max-w-2xl mx-auto" role="region" aria-roledescription="carousel" aria-label="Fictional financial planning examples"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        <div className="client-review-card bg-surface rounded-card p-8 border border-white/5" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${reviews.length}`} aria-live={rotating ? 'off' : 'polite'} aria-atomic="true">
          <div className="illustrative-story-content">
            <p className="illustrative-story-label">Fictional example · {review.topic}</p>
            <p className="client-review-quote">{review.story}</p>
            <div className="illustrative-story-person"><IllustratedAvatar variant={review.avatar}/><div><p className="client-review-name">{review.name}</p><p className="illustrative-person-label">Fictional character · illustrated avatar</p></div></div>
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
