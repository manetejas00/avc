import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Star } from 'lucide-react';
import { testimonialDrafts } from '../data/testimonials';

export default function Testimonials() {
  const viewport = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; scroll: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (paused || hovered || focused || dragging || reducedMotion) return;
    let frame = 0, last = 0;
    const tick = (now: number) => {
      const element = viewport.current, width = group.current?.offsetWidth;
      if (element && width && last) {
        const next = element.scrollLeft + Math.min(now - last, 64) * 0.04;
        element.scrollLeft = next >= width ? next % width : next;
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, hovered, focused, dragging, reducedMotion]);

  return <section id="testimonials" className="py-24 bg-surface-elevated overflow-hidden scroll-mt-24" aria-labelledby="testimonials-heading">
    <div className="container-custom"><div className="test-title text-center mb-16">
      <h2 id="testimonials-heading" className="text-4xl md:text-[52px] font-semibold mb-4">Testimonials</h2>
      <p className="text-text-muted text-lg max-w-2xl mx-auto">Illustrative testimonial drafts—not actual client reviews. Names, roles and images are not verified client identities.</p>
    </div></div>
    <div className="original-testimonial-viewport mask-horizontal" ref={viewport} tabIndex={0} role="region" aria-label="Illustrative testimonial drafts. Scroll horizontally to read all four."
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onPointerDown={event => { if (event.pointerType !== 'mouse' || event.button !== 0) return; drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); event.preventDefault(); }}
      onPointerMove={event => { if (drag.current) event.currentTarget.scrollLeft = drag.current.scroll - (event.clientX - drag.current.x); }}
      onPointerUp={() => { drag.current = null; setDragging(false); }} onPointerCancel={() => { drag.current = null; setDragging(false); }}>
      <div className="original-testimonial-track">
        {[0, 1].map(copy => <div ref={copy === 0 ? group : undefined} className={`original-testimonial-group ${copy ? 'original-testimonial-clone' : ''}`} key={copy} aria-hidden={copy ? true : undefined}>
          {testimonialDrafts.map(review => <article key={review.id} className="original-testimonial-card bg-surface rounded-card p-8 border border-white/5 hover:border-gold-primary/50 transition-colors">
            <div className="flex gap-1 text-gold-primary" aria-hidden="true">{[1,2,3,4,5].map(star => <Star key={star} size={16} fill="currentColor"/>)}</div>
            <p className="original-testimonial-label">Illustrative draft—not a verified client review</p>
            <p className="original-testimonial-quote">“{review.quote}”</p>
            <div className="original-testimonial-person">
              <img src={review.image} alt="Illustrative profile image; identity unverified" width="48" height="48" loading="lazy" draggable={false}/>
              <div><h3>{review.name}</h3><p>{review.role}</p><p className="original-testimonial-identity">Illustrative profile · not a verified client</p></div>
            </div>
          </article>)}
        </div>)}
      </div>
    </div>
    {!reducedMotion && <div className="client-review-controls"><button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Start automatic testimonials' : 'Pause automatic testimonials'}>{paused ? <Play size={18}/> : <Pause size={18}/>}</button></div>}
  </section>;
}
