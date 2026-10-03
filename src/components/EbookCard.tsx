import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Eye, Layers, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from 'lucide-react';
import { EBook } from '../services/ebookService';

interface EbookCardProps {
  book: EBook;
  onBuyNow: (book: EBook) => void;
  onPreview: (book: EBook) => void;
}

export default function EbookCard({ book, onBuyNow, onPreview }: EbookCardProps) {
  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-amber-400 text-black font-bold';
      case 'Featured':
        return 'bg-emerald-500 text-black font-bold';
      case 'Popular':
        return 'bg-purple-500 text-white font-bold';
      case 'Advanced':
        return 'bg-rose-500 text-white font-bold';
      default:
        return 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30';
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'trending': return <TrendingUp size={36} />;
      case 'chart': return <Layers size={36} />;
      case 'zap': return <Zap size={36} />;
      case 'shield': return <ShieldCheck size={36} />;
      default: return <BookOpen size={36} />;
    }
  };

  return (
    <div className="group relative bg-[#0D0D0D] border border-white/10 hover:border-[#D4AF37]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/5 hover:-translate-y-1">
      {/* Top Cover Visual */}
      <div className="relative mb-5">
        <div
          className={`w-full h-56 rounded-xl bg-gradient-to-br ${book.coverGradient} p-6 flex flex-col justify-between relative overflow-hidden border border-white/10 shadow-lg group-hover:scale-[1.01] transition-transform duration-300`}
        >
          {/* Subtle Background Glow */}
          <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/10">
              {book.category}
            </span>

            {book.badge && (
              <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${getBadgeStyle(book.badge)}`}>
                {book.badge}
              </span>
            )}
          </div>

          {/* Book Title & Icon on Cover */}
          <div className="z-10 text-white">
            <div className="text-[#D4AF37] mb-2 opacity-90">{renderIcon(book.coverIcon)}</div>
            <h3 className="text-base font-bold text-white line-clamp-2 leading-tight drop-shadow-sm">
              {book.title}
            </h3>
            <p className="text-[11px] text-neutral-300 mt-1 font-medium">{book.author}</p>
          </div>

          <div className="z-10 flex items-center justify-between text-[11px] text-neutral-300 border-t border-white/10 pt-2">
            <span>{book.pages} Pages</span>
            <span>{book.difficulty}</span>
          </div>
        </div>
      </div>

      {/* Book Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Level */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{book.rating}</span>
              <span className="text-neutral-500 font-normal">({book.reviewsCount})</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-neutral-300">
              {book.difficulty}
            </span>
          </div>

          {/* Title & Short Description */}
          <Link to={`/ebooks/${book.slug}`} className="group-hover:text-[#D4AF37] transition-colors">
            <h4 className="text-base font-bold text-white mb-1.5 line-clamp-1">{book.title}</h4>
          </Link>
          <p className="text-xs text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
            {book.shortDescription}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div>
          <div className="flex items-baseline justify-between p-3 rounded-xl bg-[#141414] border border-white/5 mb-4">
            <div>
              <span className="text-xs text-neutral-400 block text-[10px] uppercase font-semibold">Special Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#D4AF37]">₹{book.sellingPrice}</span>
                <span className="text-xs text-neutral-500 line-through">₹{book.originalPrice}</span>
              </div>
            </div>
            <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {book.discountPercent}% OFF
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPreview(book)}
                className="py-2.5 px-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-neutral-200 hover:text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye size={14} className="text-[#D4AF37]" /> Sample
              </button>

              <Link
                to={`/ebooks/${book.slug}`}
                className="py-2.5 px-3 rounded-xl bg-[#1A1A1A] hover:bg-[#252525] border border-white/10 text-neutral-200 hover:text-white font-medium text-xs transition-colors text-center"
              >
                View Details
              </Link>
            </div>

            <button
              type="button"
              onClick={() => onBuyNow(book)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#D4AF37]/10"
            >
              Buy Now · ₹{book.sellingPrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
