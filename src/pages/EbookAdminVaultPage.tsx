import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, Download, FileText, Lock, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { EBOOKS_DATA, EBook } from '../services/ebookService';

export default function EbookAdminVaultPage() {
  const [searchParams] = useSearchParams();
  const secretKey = searchParams.get('key');
  const [selectedBook, setSelectedBook] = useState<EBook>(EBOOKS_DATA[0]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Secret access validation key
    if (secretKey === 'avc_secret_2026' || secretKey === 'admin' || secretKey === '7030247878') {
      setIsAuthorized(true);
    }
  }, [secretKey]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/30 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20">
            <Lock size={32} />
          </div>
          <h1 className="text-xl font-bold text-white">Restricted Admin Access</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            This endpoint is restricted for administrative inspection only. Please append your secret key parameter to access the full e-book repository.
          </p>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-[#D4AF37]">
            /ebook-admin-vault?key=avc_secret_2026
          </div>
        </div>
      </div>
    );
  }

  const handleDownloadFullBookHtml = (book: EBook) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${book.title} - Complete Edition</title>
  <style>
    body { font-family: 'Georgia', serif; background: #fafafa; color: #111; max-width: 800px; margin: 40px auto; padding: 40px; line-height: 1.8; }
    h1 { font-family: 'Helvetica Neue', sans-serif; font-size: 2.2rem; border-bottom: 3px solid #D4AF37; padding-bottom: 12px; margin-bottom: 8px; color: #000; }
    h2 { font-family: 'Helvetica Neue', sans-serif; font-size: 1.5rem; color: #B8962E; margin-top: 32px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    h3 { font-family: 'Helvetica Neue', sans-serif; font-size: 1.2rem; color: #333; margin-top: 24px; }
    .meta { font-family: sans-serif; font-size: 0.9rem; color: #666; margin-bottom: 32px; }
    .box { background: #f0f7ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px; font-style: italic; }
    .toc { background: #f9f9f9; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px; margin: 24px 0; font-family: sans-serif; }
    .toc li { margin-bottom: 8px; }
    @media print { body { max-width: 100%; margin: 0; padding: 0; } }
  </style>
</head>
<body>
  <div className="meta">AVC DHANAM SOLUTIONS · OFFICIAL FULL PUBLICATION</div>
  <h1>${book.title}</h1>
  <div className="meta">
    <strong>Author:</strong> ${book.author} (${book.authorTitle})<br>
    <strong>Category:</strong> ${book.category} | <strong>Level:</strong> ${book.difficulty} | <strong>Pages:</strong> ${book.pages} Pages<br>
    <strong>Publication Year:</strong> ${book.publishedYear} | <strong>Format:</strong> Full Unlocked PDF Edition
  </div>

  <div className="box">
    <strong>Executive Summary:</strong> ${book.fullDescription}
  </div>

  <div className="toc">
    <h3>Table of Contents</h3>
    <ul>
      ${book.tableOfContents.map(t => `<li><strong>${t.chapter}: ${t.title}</strong> — ${t.summary}</li>`).join('')}
    </ul>
  </div>

  <h2>Introduction</h2>
  <p>${book.fullBookContent?.introduction || book.fullDescription}</p>

  ${book.fullBookContent?.chapters.map(ch => `
    <h2>Chapter ${ch.number}: ${ch.title}</h2>
    ${ch.sections.map(sec => `
      <h3>${sec.heading}</h3>
      <p>${sec.body}</p>
    `).join('')}
  `).join('') || ''}

  <h2>What You Will Learn & Key Takeaways</h2>
  <ul>
    ${book.whatYouWillLearn.map(w => `<li>${w}</li>`).join('')}
  </ul>

  <h2>Conclusion & Actionable Steps</h2>
  <p>${book.fullBookContent?.conclusion || 'Apply these principles with discipline, maintain strict risk management, and build long-term financial freedom.'}</p>

  <hr style="margin-top: 40px;">
  <p style="font-size: 0.8rem; color: #888; text-align: center;">© ${new Date().getFullYear()} AVC Dhanam Solutions Pvt. Ltd. All rights reserved. Confidential Admin Copy.</p>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.slug}-full-edition.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck size={16} /> Confidential Admin Vault
            </div>
            <h1 className="text-2xl font-extrabold text-white">Full E-Book Download & Reader API</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Secret administrative repository to inspect, generate, and download complete publications.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
            <Sparkles size={14} /> Secret API Key Active
          </div>
        </div>

        {/* E-Books Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {EBOOKS_DATA.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBook(b)}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedBook.id === b.id
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-lg'
                  : 'bg-[#0D0D0D] border-white/10 text-neutral-400 hover:text-white hover:border-white/30'
              }`}
            >
              <span className="text-[10px] text-[#D4AF37] font-bold block uppercase">{b.category}</span>
              <h3 className="text-xs font-semibold truncate mt-1 text-white">{b.title}</h3>
              <span className="text-[10px] text-neutral-400 block mt-1">{b.pages} Pages · ₹{b.sellingPrice}</span>
            </button>
          ))}
        </div>

        {/* Selected Book Full Reader & Download Box */}
        <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">{selectedBook.category}</span>
              <h2 className="text-2xl font-bold text-white mt-1">{selectedBook.title}</h2>
              <p className="text-xs text-neutral-400 mt-1">Author: {selectedBook.author} ({selectedBook.authorTitle})</p>
            </div>

            <button
              type="button"
              onClick={() => handleDownloadFullBookHtml(selectedBook)}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-xs md:text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 flex-shrink-0"
            >
              <Download size={16} /> Download Full Edition (HTML/Printable PDF)
            </button>
          </div>

          {/* Chapters Breakdown */}
          <div className="space-y-6 text-xs md:text-sm leading-relaxed text-neutral-300">
            <div className="p-4 rounded-xl bg-[#151515] border border-white/5 space-y-2">
              <h3 className="text-sm font-bold text-white">Book Overview</h3>
              <p>{selectedBook.fullDescription}</p>
            </div>

            {selectedBook.fullBookContent?.chapters.map((ch) => (
              <div key={ch.number} className="p-5 rounded-xl bg-[#121212] border border-white/5 space-y-3">
                <h3 className="text-base font-bold text-[#D4AF37]">Chapter {ch.number}: {ch.title}</h3>
                {ch.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wide">{sec.heading}</h4>
                    <p className="text-neutral-400">{sec.body}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoint Documentation */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={16} className="text-[#D4AF37]" /> Secret API Endpoints Summary
          </h3>
          <p className="text-neutral-400">Use these direct endpoints to query e-book content programmatically:</p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="p-3 rounded-lg bg-[#151515] border border-white/5 text-emerald-400">
              GET /api/admin/ebook-download?id={selectedBook.slug}&key=avc_secret_2026
            </div>
            <div className="p-3 rounded-lg bg-[#151515] border border-white/5 text-amber-400">
              GET /api/admin/ebooks-vault?key=avc_secret_2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
