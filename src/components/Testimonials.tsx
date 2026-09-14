import React, { useRef } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { useGSAP } from '@gsap/react';
import { Star } from 'lucide-react';

gsap.registerPlugin(Draggable);

const testimonials = [
  { name: 'Alex Johnson', role: 'Product Manager', content: "Bemine AI has completely transformed how our team collaborates. The intuitive interface and powerful features save us hours every week.", image: '/assets/686f231d23a1ec789d4370af_Portrait%20of%20Young%20Man.jpeg' },
  { name: 'Sarah Lee', role: 'Design Lead', content: "I've tried many tools, but Bemine stands out. The AI assistant is incredibly smart and integrates perfectly into our workflow.", image: '/assets/686f231d23a1ec789d4370bd_Portrait%20of%20Asian%20Man%20(1).jpeg' },
  { name: 'Michael Chen', role: 'CTO', content: "The scalability and security of Bemine gave us the confidence to roll it out company-wide. It's been a game-changer for our productivity.", image: '/assets/686f231d23a1ec789d4370bc_Confident%20Young%20Man.jpeg' },
  { name: 'Emily Davis', role: 'Marketing Director', content: "Tracking progress and coordinating campaigns has never been easier. The visual clarity Bemine provides is unmatched.", image: '/assets/686f231d23a1ec789d4370a3_Contemplative%20Portrait.jpeg' },
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
    <section ref={containerRef} className="py-24 bg-surface-ii overflow-hidden">
      <div className="container-custom">
        <div className="test-title text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4">What Our Clients Say</h2>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Hear from the teams that use Bemine AI every day.
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden mask-horizontal pb-8 pt-4 cursor-grab active:cursor-grabbing">
        <div ref={sliderRef} className="flex gap-8 whitespace-normal items-center px-4 w-[fit-content]">
          {[...testimonials, ...testimonials, ...testimonials].map((testimonial, i) => (
            <div 
              key={i} 
              className="w-[400px] shrink-0 bg-surface rounded-card p-8 border border-border flex flex-col gap-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-1 text-primary">
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
                  className="w-12 h-12 rounded-full object-cover border border-border"
                  onError={(e) => {
                    e.currentTarget.src = `${import.meta.env.VITE_UI_AVATARS_API_URL}?name=${testimonial.name}&background=ff661a&color=fff`;
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
