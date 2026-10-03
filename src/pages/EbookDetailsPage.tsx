import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Globe,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  User
} from 'lucide-react';
import { V1Footer, V1Nav } from '../components/V1SiteChrome';
import RegulatoryDisclaimer from '../components/RegulatoryDisclaimer';
import EbookCard from '../components/EbookCard';
import EbookCheckoutModal from '../components/EbookCheckoutModal';
import EbookPreviewModal from '../components/EbookPreviewModal';
import { EBook, getEBookBySlug, getRelatedEBooks } from '../services/ebookService';

export default function EbookDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<EBook | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<EBook[]>([]);

  const [checkoutBook, setCheckoutBook] = useState<EBook | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [previewBook, setPreviewBook] = useState<EBook | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (slug) {
      const found = getEBookBySlug(slug);
      if (found) {
        setBook(found);
        setRelatedBooks(getRelatedEBooks(slug, 3));
      } else {
        navigate('/ebooks', { replace: true });
      }
    }
  }, [slug, navigate]);

  // SEO Metadata Update
  useEffect(() => {
    if (book) {
      document.title = `${book.title} | AVC Dhanam E-Books`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `Buy ${book.title} by ${book.author}. ${book.shortDescription} Price: ₹${book.sellingPrice} (${book.discountPercent}% OFF).`
        );
      }
    }
  }, [book]);

  if (!book) return null;

  const handleBuyNow = (targetBook: EBook = book) => {
    setCheckoutBook(targetBook);
    setIsCheckoutOpen(true);
  };

  const handlePreview = (targetBook: EBook = book) => {
    setPreviewBook(targetBook);
    setIsPreviewOpen(true);
  };

  // Product & Book JSON-LD Schema
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': book.title,
    'description': book.fullDescription,
    'category': book.category,
    'brand': { '@type': 'Brand', 'name': 'AVC Dhanam Solutions' },
    'offers': {
      '@type': 'Offer',
      'price': book.sellingPrice,
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock',
      'url': window.location.href
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': book.rating,
      'reviewCount': book.reviewsCount
    }
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
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-neutral-400 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/ebooks" className="hover:text-[#D4AF37] transition-colors">E-Books</Link>
          <ChevronRight size={12} />
          <span className="text-[#D4AF37] font-medium truncate max-w-xs">{book.title}</span>
        </nav>

        {/* Top Product Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16 items-start">
          {/* Left Column: Visual Cover Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-4">
              <div
                className={`w-full h-[420px] rounded-2xl bg-gradient-to-br ${book.coverGradient} p-8 flex flex-col justify-between border border-white/10 shadow-2xl relative overflow-hidden`}
              >
                {book.coverImage && (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                )}

                {/* Dark Overlay gradient over image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/60 z-0 pointer-events-none" />

                <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none z-0" />

                <div className="flex justify-between items-start z-10">
                  <span className="px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {book.category}
                  </span>

                  {book.badge && (
                    <span className="px-3 py-1 rounded-md text-xs uppercase font-bold tracking-wider bg-[#D4AF37] text-black">
                      {book.badge}
                    </span>
                  )}
                </div>

                <div className="z-10 text-white space-y-2">
                  {!book.coverImage && (
                    <div className="text-[#D4AF37]">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
                    {book.title}
                  </h1>
                  <p className="text-xs md:text-sm text-neutral-200 drop-shadow">{book.subtitle}</p>
                </div>

                <div className="z-10 flex items-center justify-between text-xs text-neutral-200 border-t border-white/20 pt-3 drop-shadow">
                  <span>Author: <b>{book.author}</b></span>
                  <span>{book.pages} Pages</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-white/5 flex items-center gap-3 text-xs text-neutral-400">
                <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
                <span>Protected Digital PDF. Instant delivery after purchase confirmation.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Book Details & Purchase CTA */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mb-2">
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span>{book.rating}</span>
                  <span className="text-neutral-500 font-normal">({book.reviewsCount} Reader Reviews)</span>
                </div>
                <span>•</span>
                <span className="text-neutral-300">{book.difficulty} Level</span>
                <span>•</span>
                <span className="text-neutral-300">{book.language}</span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-3">
                {book.title}
              </h1>

              <p className="text-sm md:text-base text-neutral-300 leading-relaxed mb-4">
                {book.shortDescription}
              </p>

              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <User size={14} className="text-[#D4AF37]" />
                <span>By <b className="text-white">{book.author}</b> ({book.authorTitle})</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#D4AF37]/30 space-y-4 shadow-xl">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold block mb-1">
                    Special Offer Price
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-[#D4AF37]">₹{book.sellingPrice}</span>
                    <span className="text-base text-neutral-500 line-through">₹{book.originalPrice}</span>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Save {book.discountPercent}% Today
                </span>
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleBuyNow(book)}
                  className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
                >
                  Buy Now · ₹{book.sellingPrice}
                </button>

                <button
                  type="button"
                  onClick={() => handlePreview(book)}
                  className="py-3.5 px-6 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} className="text-[#D4AF37]" /> Read Sample Excerpt
                </button>
              </div>

              <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-white/5">
                <span>Format: {book.format}</span>
                <span>Language: {book.language}</span>
                <span>Pages: {book.pages}</span>
              </div>
            </div>

            {/* Specifications Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-white/5 text-center">
                <FileText size={18} className="text-[#D4AF37] mx-auto mb-1" />
                <span className="text-neutral-400 block text-[10px]">Length</span>
                <span className="font-bold text-white">{book.pages} Pages</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-white/5 text-center">
                <Globe size={18} className="text-emerald-400 mx-auto mb-1" />
                <span className="text-neutral-400 block text-[10px]">Language</span>
                <span className="font-bold text-white">{book.language}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-white/5 text-center">
                <Layers size={18} className="text-purple-400 mx-auto mb-1" />
                <span className="text-neutral-400 block text-[10px]">Difficulty</span>
                <span className="font-bold text-white">{book.difficulty}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0D0D] border border-white/5 text-center">
                <Download size={18} className="text-amber-400 mx-auto mb-1" />
                <span className="text-neutral-400 block text-[10px]">Format</span>
                <span className="font-bold text-white">Digital PDF</span>
              </div>
            </div>

            {/* What Reader Will Learn */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" /> What You Will Learn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300">
                {book.whatYouWillLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections: Description & Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-7 space-y-8">
            {/* Detailed Description */}
            <section className="p-6 md:p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white">About This E-Book</h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {book.fullDescription}
              </p>
            </section>

            {/* Table of Contents */}
            <section className="p-6 md:p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-[#D4AF37]" /> Table of Contents
              </h2>

              <div className="space-y-3">
                {book.tableOfContents.map((toc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#151515] border border-white/5 flex items-start gap-3 text-xs"
                  >
                    <span className="px-2 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-[11px]">
                      {toc.chapter}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{toc.title}</h3>
                      <p className="text-neutral-400">{toc.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sample Excerpt Preview Section */}
            <section className="p-6 md:p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} className="text-[#D4AF37]" /> Sample Excerpt
                </h2>
                <button
                  type="button"
                  onClick={() => handlePreview(book)}
                  className="text-xs text-[#D4AF37] hover:underline font-semibold"
                >
                  Expand Full Sample →
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#151515] border border-white/5 text-xs text-neutral-300 space-y-3">
                <span className="text-[#D4AF37] font-semibold block uppercase">
                  {book.samplePages[0].chapterTitle}
                </span>
                {book.samplePages[0].paragraphs.slice(0, 2).map((paragraph, idx) => (
                  <p key={idx} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column: Author Bio & Sticky Buy Card */}
          <div className="lg:col-span-5 space-y-6">
            {/* Author Profile */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-base">
                  {book.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{book.author}</h3>
                  <p className="text-xs text-[#D4AF37]">{book.authorTitle}</p>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed pt-2 border-t border-white/5">
                Experienced market strategists providing empirical research and structured wealth management principles for Indian investors.
              </p>
            </div>

            {/* Sticky Buy Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111111] to-[#0D0D0D] border border-[#D4AF37]/30 space-y-4 shadow-xl">
              <div className="text-center">
                <span className="text-xs text-neutral-400 block mb-1">Instant Digital Access</span>
                <div className="text-3xl font-extrabold text-[#D4AF37]">₹{book.sellingPrice}</div>
                <span className="text-xs text-neutral-500 line-through">₹{book.originalPrice} ({book.discountPercent}% OFF)</span>
              </div>

              <button
                type="button"
                onClick={() => handleBuyNow(book)}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
              >
                Buy Now · ₹{book.sellingPrice}
              </button>

              <div className="text-[11px] text-neutral-400 space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Instant PDF Access
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Compatible with Phone, PC, Kindle
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Lifetime Updates
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related E-Books */}
        {relatedBooks.length > 0 && (
          <section className="mb-16 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">Expand Your Knowledge</span>
                <h2 className="text-xl md:text-2xl font-bold text-white">Related E-Books</h2>
              </div>
              <Link to="/ebooks" className="text-xs text-[#D4AF37] hover:underline font-semibold">
                Explore All E-Books →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBooks.map((relBook) => (
                <EbookCard
                  key={relBook.id}
                  book={relBook}
                  onBuyNow={handleBuyNow}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          </section>
        )}

        <RegulatoryDisclaimer />
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
