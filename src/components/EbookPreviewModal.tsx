import React from 'react';
import { BookOpen, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';
import { EBook } from '../services/ebookService';

interface EbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (book: EBook) => void;
  book: EBook | null;
}

export default function EbookPreviewModal({ isOpen, onClose, onBuyNow, book }: EbookPreviewModalProps) {
  if (!isOpen || !book) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0D0D0D] border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 md:p-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles size={14} /> Free Sample Excerpt
            </div>
            <h2 id="preview-modal-title" className="text-lg md:text-xl font-bold text-white truncate max-w-md">
              {book.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
            aria-label="Close sample preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-2">
          {/* Sample Title Box */}
          <div className="p-4 rounded-xl bg-[#151515] border border-white/5">
            <span className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wide">
              {book.sampleExcerpt.chapterTitle}
            </span>
            <p className="text-xs text-neutral-400 mt-1">
              This official sample excerpt is provided for preview purposes. The complete e-book contains {book.pages} pages of in-depth strategies, formulas, and practical financial models.
            </p>
          </div>

          {/* Sample Excerpt Paragraphs */}
          <div className="space-y-4 text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
            {book.sampleExcerpt.content.map((paragraph, idx) => (
              <p key={idx} className="bg-[#111111]/50 p-4 rounded-xl border border-white/5">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Table of Contents Preview */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-[#D4AF37]" /> Table of Contents Overview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {book.tableOfContents.map((toc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#151515] border border-white/5 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">{toc.chapter}: {toc.title}</span>
                    <span className="text-[11px] text-neutral-400">{toc.summary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Content Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 via-amber-500/5 to-transparent border border-[#D4AF37]/30 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] mx-auto flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h4 className="text-sm font-bold text-white">Unlock the Remaining Chapters ({book.pages} Pages)</h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              Get instant lifetime digital access to the full version of {book.title} for just ₹{book.sellingPrice}.
            </p>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-400">Special Price:</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-[#D4AF37]">₹{book.sellingPrice}</span>
              <span className="text-xs text-neutral-500 line-through">₹{book.originalPrice}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onBuyNow(book);
            }}
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-xs md:text-sm hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            Buy Full E-Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
