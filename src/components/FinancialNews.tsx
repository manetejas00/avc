import React, { useEffect, useState } from 'react';
import { ExternalLink, Clock } from 'lucide-react';

interface NewsArticle {
  headline: string;
  source: string;
  url: string;
  summary: string;
  datetime: number;
  image: string;
}

const FinancialNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Note: For real news, Finnhub or Marketaux API needs to be connected in backend.
  // For demonstration, we will use static fallback if API is not yet implemented or fails.
  useEffect(() => {
    // We would normally fetch from /api/news
    // Mocking for now to ensure beautiful UI until backend API for news is added.
    const mockNews: NewsArticle[] = [
      {
        headline: "NIFTY crosses new milestone as foreign inflows surge",
        source: "MarketWatch",
        url: "#",
        summary: "Indian equities continued their record-breaking rally on Friday, supported by strong macroeconomic data and aggressive buying by FIIs.",
        datetime: Date.now() / 1000 - 3600,
        image: "/assets/news/news-indian-equities.webp"
      },
      {
        headline: "RBI signals potential rate cut in upcoming policy review",
        source: "Financial Times",
        url: "#",
        summary: "The central bank hinted at softening its stance on interest rates as inflation stays within the target band for the third consecutive month.",
        datetime: Date.now() / 1000 - 7200,
        image: "/assets/news/news-rbi-policy.webp"
      },
      {
        headline: "Tech giants drive S&P 500 to historic highs",
        source: "Bloomberg",
        url: "#",
        summary: "Wall Street closed sharply higher, with technology sector leading the charge amid positive earnings surprises from major AI hardware makers.",
        datetime: Date.now() / 1000 - 14400,
        image: "/assets/news/news-global-economy.webp"
      }
    ];

    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <section id="news" className="py-section-mobile md:py-section bg-background">
      <div className="container-custom">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">Market Insights</h2>
            <p className="text-text-muted">Stay updated with the latest financial news.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((article, idx) => (
              <a 
                key={idx} 
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:-translate-y-1"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.headline}
                    loading="lazy" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold px-2 py-1 bg-surface-ii rounded text-primary">{article.source}</span>
                    <span className="text-xs text-text-muted flex items-center">
                      <Clock size={12} className="mr-1" />
                      {Math.round((Date.now() / 1000 - article.datetime) / 3600)}h ago
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{article.headline}</h3>
                  <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-1">{article.summary}</p>
                  <div className="flex items-center text-primary text-sm font-medium mt-auto">
                    Read article <ExternalLink size={14} className="ml-1" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FinancialNews;
