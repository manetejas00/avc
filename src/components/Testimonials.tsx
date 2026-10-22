import React, { useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import { Star } from 'lucide-react';

gsap.registerPlugin(Draggable);

const testimonials = [
  { name: 'Rajesh Sharma', role: 'Managing Director, TechVentures Mumbai', content: "AVC Dhanam's SIP and portfolio management guidance helped us structure our wealth tax-efficiently. The transparency and real-time market data give us full control.", image: '/assets/testimonials/client-rajesh.webp' },
  { name: 'Ananya Patel', role: 'VP Product & Investor, Bengaluru', content: "Investing in mutual funds and PMS through AVC has been seamless. Their market analytics and advisor support are top tier.", image: '/assets/testimonials/client-ananya.webp' },
  { name: 'Vikram Mehta', role: 'Co-Founder, Capital Growth', content: "The level of expertise and SEBI compliance rigor AVC provides gives us total confidence for our corporate liquidity investments.", image: '/assets/testimonials/client-vikram.webp' },
  { name: 'Priya Nair', role: 'Senior Financial Strategist, Mumbai', content: "AVC Dhanam simplifies equity research and mutual fund selection. Their personalized consultation helped us hit our long-term wealth goals.", image: '/assets/testimonials/client-priya.webp' },
];

const Testimonials = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.test-title', {
      y: 50, opacity: 0, duration: 1,
      scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
    });

    if (sliderRef.current) {
      // Create infinite loop animation
      const loop = gsap.to(sliderRef.current, {
        x: () => -(sliderRef.current!.scrollWidth / 2),
        ease: "none",
        duration: 30,
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => parseFloat(x) % (sliderRef.current!.scrollWidth / 2))
        }
      });

      // Make it draggable
      Draggable.create(sliderRef.current, {
        type: "x",
        inertia: true,
        onPress() {
          loop.pause();
        },
        onRelease() {
          loop.play();
        }
      });
      
      // Pause on hover for mouse users
      sliderRef.current.addEventListener('mouseenter', () => loop.pause());
      sliderRef.current.addEventListener('mouseleave', () => {
        if (!Draggable.get(sliderRef.current).isDragging) loop.play();
      });
    }
  }, { scope: containerRef });

  return (
    <section id="testimonials" ref={containerRef} className="py-24 bg-surface-elevated overflow-hidden scroll-mt-24" aria-labelledby="testimonials-heading">
      <div className="container-custom">
        <div className="test-title text-center mb-16">
          <h2 id="testimonials-heading" className="text-4xl md:text-[52px] font-semibold mb-4">What Our Clients Say</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Hear from the private wealth clients, business promoters, and corporate treasuries who partner with AVC Dhanam Solutions.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden mask-horizontal pb-8 pt-4 cursor-grab active:cursor-grabbing">
        <div ref={sliderRef} className="flex gap-8 whitespace-normal items-center px-4 w-[fit-content]">
          {[...testimonials, ...testimonials, ...testimonials].map((testimonial, i) => (
            <div 
              key={i} 
              className="w-[400px] shrink-0 bg-surface rounded-card p-8 border border-white/5 flex flex-col gap-6 hover:border-gold-primary/50 transition-colors"
            >
              <div className="flex gap-1 text-gold-primary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg text-text-muted italic line-clamp-4 pointer-events-none">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4 mt-auto pointer-events-none">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  width="48"
                  height="48"
                  loading="lazy"
                  className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]/30 ring-2 ring-[#D4AF37]/10"
                  onError={(e) => {
                    e.currentTarget.src = `${import.meta.env.VITE_UI_AVATARS_API_URL}?name=${encodeURIComponent(testimonial.name)}&background=0d0d0d&color=D4AF37&bold=true`;
                  }}
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-text-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
