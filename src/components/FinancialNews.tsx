import { Clock, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';

type NewsArticle = { headline: string; source: string; url: string; summary: string; datetime: number; image: string };

export default function FinancialNews() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  useEffect(() => {
    const articles: NewsArticle[] = [
      { headline: 'NIFTY crosses new milestone as foreign inflows surge', source: 'MarketWatch', url: '#', summary: 'Indian equities continued their record-breaking rally, supported by strong macroeconomic data and foreign institutional buying.', datetime: Date.now() / 1000 - 3600, image: '/assets/news/news-indian-equities.webp' },
      { headline: 'RBI signals potential rate cut in upcoming policy review', source: 'Financial Times', url: '#', summary: 'The central bank hinted at a softer interest-rate stance as inflation remains within its target range.', datetime: Date.now() / 1000 - 7200, image: '/assets/news/news-rbi-policy.webp' },
      { headline: 'Tech giants drive global equities higher', source: 'Bloomberg', url: '#', summary: 'Technology shares led a broad market rally amid positive earnings surprises from major AI hardware makers.', datetime: Date.now() / 1000 - 14400, image: '/assets/news/news-global-economy.webp' },
    ];
    const timer = window.setTimeout(() => setNews(articles), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return <section id="news" className="bg-background py-section-mobile md:py-section">
    <div className="container-custom">
      <div className="mb-10"><p className="eyebrow mb-4">Market intelligence</p><h2 className="mb-2">Market Insights</h2><p className="text-text-muted">A concise view of the stories shaping markets.</p></div>
      {!news.length ? <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-primary border-t-transparent" /></div> :
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{news.map((article) => <a key={article.headline} href={article.url} className="card-premium card-premium-hover group flex overflow-hidden">
          <div className="flex min-h-[330px] flex-1 flex-col"><div className="h-44 overflow-hidden"><img src={article.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /></div>
          <div className="flex flex-1 flex-col p-6"><div className="mb-3 flex items-center justify-between text-xs"><span className="rounded-full bg-gold-primary/10 px-2.5 py-1 font-semibold text-gold-secondary">{article.source}</span><span className="flex items-center gap-1 text-text-muted"><Clock size={12} />{Math.round((Date.now() / 1000 - article.datetime) / 3600)}h ago</span></div>
          <h3 className="mb-3 text-xl transition-colors group-hover:text-gold-secondary">{article.headline}</h3><p className="mb-4 flex-1 text-sm text-text-muted">{article.summary}</p><span className="flex items-center gap-1 text-sm font-semibold text-gold-secondary">Read article <ExternalLink size={14} /></span></div></div>
        </a>)}</div>}
    </div>
  </section>;
}
