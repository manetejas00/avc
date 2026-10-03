import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function SiteLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(() => {
    const loader = loaderRef.current;
    if (!loader) return;
    const timeline = gsap.timeline({ onComplete: () => setVisible(false) });
    timeline.fromTo('.site-loader__mark', { autoAlpha: 0, y: 18, scale: .9 }, { autoAlpha: 1, y: 0, scale: 1, duration: .7, ease: 'power3.out' })
      .fromTo('.site-loader__line', { scaleX: 0 }, { scaleX: 1, duration: .7, ease: 'power2.inOut' }, '-=.35')
      .to('.site-loader__mark', { y: -8, duration: .35, ease: 'power2.inOut' })
      .to(loader, { autoAlpha: 0, duration: .48, ease: 'power2.out' }, '+=.15');
  }, { scope: loaderRef });

  if (!visible) return null;
  return <div ref={loaderRef} className="site-loader" role="status" aria-label="Loading AVC Dhanam">
    <div className="site-loader__content"><img className="site-loader__mark" src="/logo_gold_transparent.svg" alt="AVC Dhanam" /><span className="site-loader__line" /><small>BUILDING CLARITY</small></div>
  </div>;
}
