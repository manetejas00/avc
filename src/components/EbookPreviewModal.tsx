import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Lock, Sparkles, X } from 'lucide-react';
import { EBook } from '../services/ebookService';

interface EbookPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyNow: (book: EBook) => void;
  book: EBook | null;
}

export default function EbookPreviewModal({ isOpen, onClose, onBuyNow, book }: EbookPreviewModalProps) {
  const [activePageNum, setActivePageNum] = useState<1 | 2>(1);

  if (!isOpen || !book) return null;

  const page1 = book.samplePages[0];
  const page2 = book.samplePages[1];
  const currentPage = activePageNum === 1 ? page1 : page2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0D0D0D] border border-[#D4AF37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] text-[11px] font-semibold uppercase tracking-wider">
                <Sparkles size={12} /> Official 2-Page Sample Excerpt
              </div>
              <h2 id="preview-modal-title" className="text-sm md:text-base font-bold text-white truncate max-w-md">
                {book.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Page Selector Tabs */}
            <div className="flex items-center bg-[#181818] p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActivePageNum(1)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  activePageNum === 1
                    ? 'bg-[#D4AF37] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Page 1
              </button>
              <button
                type="button"
                onClick={() => setActivePageNum(2)}
                className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                  activePageNum === 2
                    ? 'bg-[#D4AF37] text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Page 2
              </button>
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
        </div>

        {/* Book Reader Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#080808]">
          {/* Dual Page Layout on Large Screens / Single Page with Page Numbers */}
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Authentic Digital Page Container */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative">
              {/* Header inside page */}
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-white/10 text-xs text-neutral-400 font-mono">
                <span className="truncate max-w-[250px]">{currentPage.chapterTitle}</span>
                <span className="text-[#D4AF37] font-semibold">Page {activePageNum} of {book.pages}</span>
              </div>

              {/* Section Heading */}
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 leading-snug">
                {currentPage.heading}
              </h3>

              {/* Paragraphs */}
              <div className="space-y-4 text-xs md:text-sm text-neutral-300 leading-relaxed">
                {currentPage.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Key Takeaway Box (Page 1) */}
              {currentPage.keyTakeaway && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-transparent border border-[#D4AF37]/30">
                  <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider block mb-1">
                    💡 Key Learning Takeaway
                  </span>
                  <p className="text-xs text-neutral-200 italic font-medium">
                    "{currentPage.keyTakeaway}"
                  </p>
                </div>
              )}

              {/* Bullet Points List (Page 2) */}
              {currentPage.bulletPoints && (
                <div className="mt-6 space-y-2.5">
                  <span className="text-xs text-white font-semibold uppercase tracking-wide block">
                    Execution Framework Summary:
                  </span>
                  <div className="space-y-2 text-xs text-neutral-300">
                    {currentPage.bulletPoints.map((bp, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-[#1A1A1A] p-3 rounded-lg border border-white/5">
                        <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{bp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Page Footer Numbering */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span>{book.author} — {book.title}</span>
                <span>Page {activePageNum}</span>
              </div>
            </div>

            {/* Page Navigation Controls */}
            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setActivePageNum(1)}
                disabled={activePageNum === 1}
                className={`px-4 py-2 rounded-xl flex items-center gap-1 font-semibold transition-all ${
                  activePageNum === 1
                    ? 'opacity-40 cursor-not-allowed text-neutral-500 bg-[#151515]'
                    : 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-white/10'
                }`}
              >
                <ChevronLeft size={16} /> Previous (Page 1)
              </button>

              <div className="text-neutral-400 text-xs font-medium">
                Viewing Sample Page <b className="text-white">{activePageNum}</b> of <b className="text-white">2</b>
              </div>

              <button
                type="button"
                onClick={() => setActivePageNum(2)}
                disabled={activePageNum === 2}
                className={`px-4 py-2 rounded-xl flex items-center gap-1 font-semibold transition-all ${
                  activePageNum === 2
                    ? 'opacity-40 cursor-not-allowed text-neutral-500 bg-[#151515]'
                    : 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-white/10'
                }`}
              >
                Next (Page 2) <ChevronRight size={16} />
              </button>
            </div>

            {/* Locked Content Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/10 via-amber-500/5 to-transparent border border-[#D4AF37]/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] mx-auto flex items-center justify-center">
                <Lock size={20} />
              </div>
              <h4 className="text-sm font-bold text-white">Unlock Remaining {book.pages - 2} Pages</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Get full digital access to all chapters, financial formulas, and trade setups in {book.title} for just ₹{book.sellingPrice}.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#111111] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-400">Special Price:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#D4AF37]">₹{book.sellingPrice}</span>
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
