import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

const articles = [
  { category: 'News', title: 'Understanding SIPs', subtitle: 'How small, regular investments create big wealth over time.', image: 'bg-surface-ii' },
  { category: 'Insights', title: 'The Power of Compounding', subtitle: 'Why starting early matters in mutual funds.', image: 'bg-surface-ii' },
  { category: 'Markets', title: 'Navigating Volatility', subtitle: 'Stay invested or pull out? A guide to rough markets.', image: 'bg-surface-ii' }
];

const Articles = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.article-header > *', {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
    });

    gsap.from('.article-card', {
      y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.1)',
      scrollTrigger: { trigger: '.article-grid', start: 'top 75%' }
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="py-24 bg-surface border-t border-border/50">
      <div className="container-custom">
        <div className="article-header flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Latest Financial Insights</h2>
            <p className="text-text-muted text-lg max-w-xl">
              Stay up to date with the latest market trends, tips, and investment strategies.
            </p>
          </div>
          <button className="group flex items-center gap-2 px-6 py-3 border border-border rounded-full hover:bg-surface-ii transition-colors font-medium text-text">
            View All Posts <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="article-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article, idx) => (
            <a key={idx} href="#" className="article-card group block rounded-card overflow-hidden bg-background border border-border hover:border-primary/50 transition-colors">
              <div className={`w-full aspect-[4/3] ${article.image} relative overflow-hidden flex items-center justify-center`}>
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <span className="text-text-muted opacity-50 group-hover:scale-110 transition-transform duration-700">Financial Image</span>
                 <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {article.category}
                 </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-semibold mb-2 text-text group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="text-text-muted">{article.subtitle}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                  Read More <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Articles;
