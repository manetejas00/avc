import { Clock, ExternalLink, Globe, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFinancialNews, FinancialNewsItem } from '../services/financialApi';

export default function FinancialNews() {
  const [scope, setScope] = useState<'india' | 'global'>('india');
  const [news, setNews] = useState<FinancialNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getFinancialNews(scope, 6, controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) {
          setNews(items);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [scope]);

  return (
    <section id="news" className="bg-background py-section-mobile md:py-section">
      <div className="container-custom">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-2">Market Intelligence</p>
            <h2 className="mb-2">Financial News &amp; Insights</h2>
            <p className="text-text-muted">Real-time intelligence streaming from premier financial sources.</p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-elevated border border-white/5">
            <button
              type="button"
              onClick={() => setScope('india')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                scope === 'india'
                  ? 'bg-gold-primary text-black shadow-md'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <TrendingUp size={14} />
              <span>Indian Markets</span>
            </button>
            <button
              type="button"
              onClick={() => setScope('global')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                scope === 'global'
                  ? 'bg-gold-primary text-black shadow-md'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              <Globe size={14} />
              <span>Global Economy</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-primary border-t-transparent" />
          </div>
        ) : !news.length ? (
          <div className="p-12 text-center rounded-2xl bg-surface border border-white/5 text-text-muted">
            No live articles currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {news.slice(0, 3).map((article, index) => (
              <a
                key={`${article.title}-${index}`}
                href={article.url}
                target={article.url !== '#' ? '_blank' : '_self'}
                rel="noreferrer"
                className="card-premium card-premium-hover group flex overflow-hidden"
              >
                <div className="flex min-h-[330px] flex-1 flex-col">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      width="400"
                      height="176"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/news/news-indian-equities.webp';
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gold-primary font-bold px-1.5 py-0.5 rounded bg-gold-primary/10 border border-gold-primary/20">
                          0{index + 1}
                        </span>
                        <span className="rounded-full bg-gold-primary/10 px-2.5 py-1 font-semibold text-gold-secondary">
                          {article.source}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-text-muted">
                        <Clock size={12} />
                        {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h3 className="mb-3 text-lg font-bold transition-colors group-hover:text-gold-secondary line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mb-4 flex-1 text-xs text-text-muted line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gold-secondary">
                      Read source <ExternalLink size={13} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
