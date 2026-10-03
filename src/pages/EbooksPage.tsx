import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Filter, HelpCircle, Layers, Search, ShieldCheck, Sparkles, TrendingUp, X } from 'lucide-react';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';
import RegulatoryDisclaimer from '../components/RegulatoryDisclaimer';
import EbookCard from '../components/EbookCard';
import EbookCheckoutModal from '../components/EbookCheckoutModal';
import EbookPreviewModal from '../components/EbookPreviewModal';
import { ALL_CATEGORIES, EBook, FilterCategory, getEBooks } from '../services/ebookService';

export default function EbooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = (searchParams.get('category') as FilterCategory) || 'All';

  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>(categoryParam);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [checkoutBook, setCheckoutBook] = useState<EBook | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [previewBook, setPreviewBook] = useState<EBook | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const handleCategorySelect = (cat: FilterCategory) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  const books = getEBooks({
    search: searchQuery,
    category: selectedCategory,
    difficulty: selectedDifficulty
  });

  const handleBuyNow = (book: EBook) => {
    setCheckoutBook(book);
    setIsCheckoutOpen(true);
  };

  const handlePreview = (book: EBook) => {
    setPreviewBook(book);
    setIsPreviewOpen(true);
  };

  // SEO Metadata Update
  useEffect(() => {
    document.title = 'Stock Market E-Books & Investing Guides | AVC Dhanam Solutions';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Download premium stock market e-books in India. Master fundamental analysis, technical analysis, long-term investing, portfolio management, and option trading strategies.'
      );
    }
  }, []);

  // JSON-LD Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'AVC Dhanam Stock Market E-Books',
    'description': 'Premium financial education e-books for stock market investors in India.',
    'numberOfItems': books.length,
    'itemListElement': books.map((b, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'item': {
        '@type': 'Book',
        'name': b.title,
        'author': { '@type': 'Person', 'name': b.author },
        'offers': {
          '@type': 'Offer',
          'price': b.sellingPrice,
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock'
        }
      }
    }))
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <V1Nav />

      {/* Main Container */}
      <main className="flex-1 pt-24 md:pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-neutral-400 flex items-center gap-2">
          <a href="/" className="hover:text-[#D4AF37] transition-colors">Home</a>
          <span>/</span>
          <span className="text-[#D4AF37] font-medium">Stock Market E-Books</span>
        </nav>

        {/* Hero Section */}
        <section className="mb-12 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Premium Financial Education
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Master the Stock Market with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F4D675] to-[#B8962E]">
              Institutional-Grade E-Books
            </span>
          </h1>
          <p className="text-sm md:text-base text-neutral-400 leading-relaxed">
            Practical, battle-tested handbooks covering Fundamental Analysis, Technical Charting, Portfolio Risk Management, and Long-Term Compounding in Indian Equity Markets.
          </p>
        </section>

        {/* Search & Filter Bar */}
        <section className="mb-10 space-y-6">
          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, topic, author, or keyword (e.g. Fundamental, Technical)..."
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 focus:border-[#D4AF37] text-white text-sm outline-none transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
            {ALL_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold shadow-md shadow-[#D4AF37]/20 scale-[1.02]'
                      : 'bg-[#0D0D0D] border border-white/10 text-neutral-300 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Difficulty Dropdown Filter */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-neutral-400">
            <span>Showing <b className="text-white">{books.length}</b> E-Book{books.length !== 1 ? 's' : ''}</span>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#D4AF37]" />
              <span>Level:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                aria-label="Filter e-books by difficulty level"
                className="bg-[#0D0D0D] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#D4AF37]"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </section>

        {/* E-Books Grid */}
        {books.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {books.map((book) => (
              <EbookCard
                key={book.id}
                book={book}
                onBuyNow={handleBuyNow}
                onPreview={handlePreview}
              />
            ))}
          </section>
        ) : (
          <div className="text-center py-16 bg-[#0D0D0D] rounded-2xl border border-white/5 my-8">
            <BookOpen size={48} className="text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No E-Books Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
              We couldn't find any books matching your current search or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Why Learn With AVC Dhanam Trust Feature Grid */}
        <section className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-[#0D0D0D] to-[#121212] border border-white/10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Why Learn With AVC Dhanam Solutions?
            </h2>
            <p className="text-xs text-neutral-400">
              Direct insights from 8+ years of capital market consultancy and wealth management experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-xl bg-[#151515] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mx-auto flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Practical Indian Market Focus</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tailored specifically to NSE & BSE equity markets, SEBI regulations, and Indian tax frameworks.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151515] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Institutional Quality</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Written by experienced Directors and research advisory teams with real market exposure.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#151515] border border-white/5 space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 mx-auto flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Digital PDF Delivery</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Read seamlessly on any device (Smartphone, Tablet, PC, Kindle) with lifetime access.
              </p>
            </div>
          </div>
        </section>

        {/* Regulatory Disclaimer Component */}
        <div className="mt-12">
          <RegulatoryDisclaimer />
        </div>
      </main>

      <V1Footer />

      {/* Modals */}
      <EbookCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        book={checkoutBook}
      />

      <EbookPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onBuyNow={handleBuyNow}
        book={previewBook}
      />
    </div>
  );
}
