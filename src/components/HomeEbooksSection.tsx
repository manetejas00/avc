import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import EbookCard from './EbookCard';
import EbookCheckoutModal from './EbookCheckoutModal';
import EbookPreviewModal from './EbookPreviewModal';
import { EBook, getFeaturedEBooks } from '../services/ebookService';

export default function HomeEbooksSection() {
  const featuredBooks = getFeaturedEBooks(4);

  const [checkoutBook, setCheckoutBook] = useState<EBook | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [previewBook, setPreviewBook] = useState<EBook | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleBuyNow = (book: EBook) => {
    setCheckoutBook(book);
    setIsCheckoutOpen(true);
  };

  const handlePreview = (book: EBook) => {
    setPreviewBook(book);
    setIsPreviewOpen(true);
  };

  return (
    <section className="v1-ebooks-section py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} /> Financial Education & Publishing
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Institutional <span className="text-[#D4AF37]">Stock Market E-Books</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Master equity investing, fundamental analysis, technical charting, and portfolio risk management with our battle-tested digital publications.
          </p>
        </div>

        <Link
          to="/ebooks"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-white font-bold text-xs md:text-sm transition-all hover:border-[#D4AF37]/40 text-center self-start md:self-auto group"
        >
          Explore All E-Books <ArrowUpRight size={16} className="text-[#D4AF37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Featured E-Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredBooks.map((book) => (
          <EbookCard
            key={book.id}
            book={book}
            onBuyNow={handleBuyNow}
            onPreview={handlePreview}
          />
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="mt-12 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-[#0D0D0D] via-[#151515] to-[#0D0D0D] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-1">Looking for a specific trading topic?</h3>
            <p className="text-xs text-neutral-400">Browse our complete collection of 6+ specialized investing and trading handbooks.</p>
          </div>
        </div>

        <Link
          to="/ebooks"
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-xs md:text-sm hover:brightness-110 transition-all text-center flex-shrink-0 shadow-md shadow-[#D4AF37]/10"
        >
          View E-Book Catalog →
        </Link>
      </div>

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
    </section>
  );
}
