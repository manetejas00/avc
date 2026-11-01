import { useEffect, useRef, useState } from 'react';
export default function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const element = useRef<HTMLElement>(null);
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const target = element.current;
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0, started = false;
    let loaderObserver: MutationObserver | null = null;
    setDisplay(0);
    const observer = new IntersectionObserver(entries => {
      if (started || !entries.some(entry => entry.isIntersecting)) return;
      started = true; observer.disconnect();
      const animate = () => {
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / 1400);
          setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      };
      if (document.querySelector('.site-loader')) {
        loaderObserver = new MutationObserver(() => {
          if (!document.querySelector('.site-loader')) { loaderObserver?.disconnect(); animate(); }
        });
        loaderObserver.observe(document.body, { childList: true, subtree: true });
      } else animate();
    }, { threshold: 0.2 });
    observer.observe(target);
    return () => { observer.disconnect(); loaderObserver?.disconnect(); cancelAnimationFrame(frame); };
  }, [value]);
  return <strong ref={element} className="count-up"><span aria-hidden="true">{prefix}{display.toLocaleString('en-IN')}{suffix}</span><span className="sr-only">{prefix}{value.toLocaleString('en-IN')}{suffix}</span></strong>;
}
