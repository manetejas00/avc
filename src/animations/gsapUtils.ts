import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const revealUp = (elements: string | Element | NodeList, trigger: Element | string, delay = 0) => {
  return gsap.from(elements, {
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    delay,
    scrollTrigger: {
      trigger: trigger,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
  });
};

export const revealScale = (elements: string | Element | NodeList, trigger: Element | string) => {
  return gsap.from(elements, {
    scale: 0.95,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: trigger,
      start: 'top 85%',
    },
  });
};

export const staggerCards = (elements: string | Element | NodeList, trigger: Element | string) => {
  return gsap.from(elements, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: trigger,
      start: 'top 80%',
    },
  });
};

export const sectionReveal = (section: Element | string) => {
  return gsap.fromTo(section, 
    { opacity: 0, y: 30 },
    {
      opacity: 1, 
      y: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
      }
    }
  );
};
