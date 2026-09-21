import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowRight, Calendar, ExternalLink, ImageOff, X } from 'lucide-react';

interface Article {
  category: string;
  title: string;
  subtitle: string;
  link: string;
  image: string;
  date: string;
  details: string;
  takeaways?: string[];
}

const fallbackArticles: Article[] = [
  { category: 'Guides', title: 'Understanding SIPs', subtitle: 'How small, regular investments create big wealth over time.', link: '#', image: '/assets/news/guides/sip-guide.png', date: 'Investment basics', details: 'A Systematic Investment Plan (SIP) invests a fixed amount at regular intervals instead of attempting to predict the best day to invest. It can make investing more manageable by turning a long-term goal into a consistent monthly habit.\n\nBecause markets move up and down, regular investing may purchase more units when prices are lower and fewer when prices are higher. This does not remove market risk or guarantee returns, but it can reduce the pressure of trying to time every investment decision.\n\nThe amount, fund selection, investment horizon, and risk level should be based on your personal goals and reviewed periodically.', takeaways: ['Build a regular investing habit that fits your cash flow.', 'Choose funds and time horizons that match your goals.', 'Review your plan periodically instead of reacting to short-term moves.'] },
  { category: 'Guides', title: 'The Power of Compounding', subtitle: 'Why starting early matters in mutual funds.', link: '#', image: '/assets/news/guides/compounding-guide.png', date: 'Long-term investing', details: 'Compounding is the process through which investment returns may themselves begin to generate further returns over time. The length of time invested can therefore be as important as the amount invested.\n\nStarting earlier gives a portfolio more time to experience potential growth and recover from normal market fluctuations. Consistent contributions can be helpful because they keep the plan moving even when conditions are uncertain.\n\nCompounding is not guaranteed and every investment carries risk. Diversification, a suitable asset mix, and a long-term perspective remain essential.', takeaways: ['Time in the market can matter more than trying to predict it.', 'Regular contributions help keep long-term plans consistent.', 'Diversification and risk suitability still matter.'] },
  { category: 'Guides', title: 'Navigating Volatility', subtitle: 'A guide to reviewing your investment plan during uncertain markets.', link: '#', image: '/assets/news/guides/volatility-guide.png', date: 'Market perspective', details: 'Market volatility is a normal feature of investing. Prices may move sharply because of economic releases, corporate results, interest-rate expectations, or global events, even when a long-term investment plan has not changed.\n\nBefore acting on a short-term movement, revisit the reasons you invested: your goal, timeframe, liquidity needs, and tolerance for risk. A portfolio that was suitable when markets were calm should still be reviewed against those same factors when markets are unsettled.\n\nIf your circumstances or goals have changed, consider discussing the next step with a qualified adviser rather than making a rushed decision.', takeaways: ['Short-term price moves are not always a reason to change a plan.', 'Check your goals, time horizon, and liquidity needs first.', 'Seek professional guidance before making major changes.'] }
];

const Articles = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news?limit=10');
        if (!res.ok) throw new Error('Failed to fetch news');
        
        const data = await res.json();
        
        if (!data.articles?.length) throw new Error('No items in news feed');
        
        // Clean up descriptions if needed
        const parsedArticles = data.articles.map((item: any) => {
          let cleanDesc = item.summary || '';
          cleanDesc = cleanDesc.replace(/<[^>]*>?/gm, '').trim();
          if (cleanDesc.length > 100) cleanDesc = cleanDesc.substring(0, 100) + '...';
          
          return {
            category: item.category || 'News',
            title: item.title,
            subtitle: cleanDesc,
            link: item.url || '#',
            image: typeof item.image === 'string' && item.image.startsWith('https://') ? item.image : '',
            date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Latest news',
            details: item.summary || cleanDesc
          };
        });
        
        setArticles(parsedArticles);
        setLoading(false);
      } catch (err) {
        setArticles(fallbackArticles);
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  useGSAP(() => {
    if (loading) return; // Wait for items to be present in DOM

    gsap.from('.article-header > *', {
      y: 15, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: containerRef.current, start: 'top 85%' }
    });

    gsap.from('.article-card', {
      y: 20, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.1)',
      scrollTrigger: { trigger: '.article-grid', start: 'top 80%' }
    });
  }, { scope: containerRef, dependencies: [loading] });

  return (
    <section id="news" ref={containerRef} className="py-24 bg-surface border-t border-white/5/50">
      <div className="container-custom">
        <div className="article-header flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Latest Financial Insights</h2>
            <p className="text-text-muted text-lg max-w-xl">
              Stay up to date with the latest market trends, tips, and investment strategies.
            </p>
          </div>
          {articles.length > 3 && <button type="button" onClick={() => setShowAll(current => !current)} className="group flex items-center gap-2 px-6 py-3 border border-white/5 rounded-full hover:bg-surface-elevated transition-colors font-medium text-text">
            {showAll ? 'Show less' : `View all posts (${articles.length})`} <ArrowRight size={18} className={`transition-transform ${showAll ? '-rotate-90' : 'group-hover:translate-x-1'}`} />
          </button>}
        </div>

        <div className="article-grid grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             // Skeleton loading state
             Array.from({ length: 3 }).map((_, idx) => (
               <div key={idx} className="block rounded-card overflow-hidden bg-background border border-white/5 animate-pulse">
                 <div className="w-full aspect-[4/3] bg-surface-elevated"></div>
                 <div className="p-8">
                   <div className="h-6 bg-surface-elevated rounded w-3/4 mb-4"></div>
                   <div className="h-4 bg-surface-elevated rounded w-full mb-2"></div>
                   <div className="h-4 bg-surface-elevated rounded w-5/6"></div>
                 </div>
               </div>
             ))
          ) : (
            (showAll ? articles : articles.slice(0, 3)).map((article, idx) => (
              <button key={idx} type="button" onClick={() => setSelectedArticle(article)} className="article-card group block w-full rounded-card overflow-hidden bg-background border border-white/5 hover:border-gold-primary/50 transition-colors text-left">
                <div className={`w-full aspect-[4/3] ${!article.image ? 'bg-surface-elevated' : ''} relative overflow-hidden flex items-center justify-center`}>
                   
                   {article.image ? (
                     <img src={article.image} onError={(event) => { event.currentTarget.closest('img')?.remove(); }} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" loading="lazy" />
                   ) : (
                     <>
                       <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                       <span className="flex items-center gap-2 text-text-muted opacity-60"><ImageOff size={18} />Image unavailable</span>
                     </>
                   )}
                   
                   <div className="absolute top-4 left-4 flex gap-2">
                     <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                        {article.category}
                     </div>
                     {article.date && (
                       <div className="bg-surface-elevated/80 backdrop-blur text-text text-xs font-bold px-3 py-1 rounded-full z-10">
                          {article.date}
                       </div>
                     )}
                   </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-3 text-text group-hover:text-gold-primary transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-text-muted line-clamp-3">{article.subtitle}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-gold-primary">
                    Read Full Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="article-modal-title" onMouseDown={() => setSelectedArticle(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-card border border-gold-primary/30 bg-background shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="relative h-56 bg-surface-elevated sm:h-72">{selectedArticle.image ? <img src={selectedArticle.image} onError={(event) => { event.currentTarget.remove(); }} alt={selectedArticle.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-text-muted"><ImageOff size={24} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent" /><button type="button" onClick={() => setSelectedArticle(null)} aria-label="Close article details" className="absolute right-4 top-4 rounded-full bg-black/70 p-2 text-white transition hover:bg-gold-primary hover:text-black"><X size={20} /></button></div>
            <div className="p-6 pt-0 sm:p-10 sm:pt-0"><div className="mb-4 flex flex-wrap items-center gap-3 text-xs"><span className="rounded-full bg-primary px-3 py-1 font-bold text-white">{selectedArticle.category}</span><span className="flex items-center gap-1 text-text-muted"><Calendar size={14} />{selectedArticle.date}</span></div><h2 id="article-modal-title" className="text-3xl font-semibold text-text sm:text-4xl">{selectedArticle.title}</h2><div className="mt-5 whitespace-pre-line text-lg leading-8 text-text-muted">{selectedArticle.details}</div>{selectedArticle.takeaways?.length ? <div className="mt-8 rounded-2xl border border-gold-primary/20 bg-gold-primary/5 p-5"><h3 className="text-base font-semibold text-gold-secondary">Key takeaways</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-text-muted">{selectedArticle.takeaways.map((takeaway) => <li key={takeaway} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-primary" />{takeaway}</li>)}</ul></div> : null}<div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={() => setSelectedArticle(null)} className="rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-text hover:bg-surface-elevated">Close</button>{selectedArticle.link !== '#' && <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-gold-secondary">Read source <ExternalLink size={15} /></a>}</div></div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Articles;
