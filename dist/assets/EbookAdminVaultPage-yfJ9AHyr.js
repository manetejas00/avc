import{r as d,j as e,n as y,S as N}from"./index-C34yuU_1.js";import{E as c}from"./ebookService-Cq8QOSHE.js";import{L as v}from"./lock-BcggYqeb.js";import{D,F as A}from"./file-text-B5_vtfDn.js";function E(){var h;const[b,g]=d.useState(c),[r,x]=d.useState(c[0]),[j,m]=d.useState(!1);if(d.useEffect(()=>{window.scrollTo({top:0,left:0,behavior:"instant"});const t=new AbortController;return fetch("/api/admin/ebooks",{signal:t.signal}).then(async i=>{if(!i.ok)throw new Error("Authentication required");const o=await i.json(),l=c.map((a,n)=>({...a,fullBookContent:o[n]}));g(l),x(l[0]),m(!0)}).catch(()=>m(!1)),()=>t.abort()},[]),!j)return e.jsx("div",{className:"min-h-screen bg-[#050505] text-white flex items-center justify-center p-4",children:e.jsxs("div",{className:"max-w-md w-full p-8 rounded-2xl bg-[#0D0D0D] border border-red-500/30 text-center space-y-4 shadow-2xl",children:[e.jsx("div",{className:"w-16 h-16 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center border border-red-500/20",children:e.jsx(v,{size:32})}),e.jsx("h1",{className:"text-xl font-bold text-white",children:"Restricted Admin Access"}),e.jsx("p",{className:"text-xs text-neutral-400 leading-relaxed",children:"This endpoint is restricted for administrative inspection only. Please sign in with your administrator account to access the full e-book repository."}),e.jsx("div",{className:"p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] break-words text-[#D4AF37]",children:e.jsx("a",{href:"/admin",className:"underline",children:"Sign in to continue"})})]})});const w=t=>{var n,p,u;const i=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${t.title} - Complete Edition</title>
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
  <h1>${t.title}</h1>
  <div className="meta">
    <strong>Author:</strong> ${t.author} (${t.authorTitle})<br>
    <strong>Category:</strong> ${t.category} | <strong>Level:</strong> ${t.difficulty} | <strong>Pages:</strong> ${t.pages} Pages<br>
    <strong>Publication Year:</strong> ${t.publishedYear} | <strong>Format:</strong> Full Unlocked PDF Edition
  </div>

  <div className="box">
    <strong>Executive Summary:</strong> ${t.fullDescription}
  </div>

  <div className="toc">
    <h3>Table of Contents</h3>
    <ul>
      ${t.tableOfContents.map(s=>`<li><strong>${s.chapter}: ${s.title}</strong> — ${s.summary}</li>`).join("")}
    </ul>
  </div>

  <h2>Introduction</h2>
  <p>${((n=t.fullBookContent)==null?void 0:n.introduction)||t.fullDescription}</p>

  ${((p=t.fullBookContent)==null?void 0:p.chapters.map(s=>`
    <h2>Chapter ${s.number}: ${s.title}</h2>
    ${s.sections.map(f=>`
      <h3>${f.heading}</h3>
      <p>${f.body}</p>
    `).join("")}
  `).join(""))||""}

  <h2>What You Will Learn & Key Takeaways</h2>
  <ul>
    ${t.whatYouWillLearn.map(s=>`<li>${s}</li>`).join("")}
  </ul>

  <h2>Conclusion & Actionable Steps</h2>
  <p>${((u=t.fullBookContent)==null?void 0:u.conclusion)||"Apply these principles with discipline, maintain strict risk management, and build long-term financial freedom."}</p>

  <hr style="margin-top: 40px;">
  <p style="font-size: 0.8rem; color: #888; text-align: center;">© ${new Date().getFullYear()} AVC Dhanam Solutions Pvt. Ltd. All rights reserved. Confidential Admin Copy.</p>
</body>
</html>`,o=new Blob([i],{type:"text/html"}),l=URL.createObjectURL(o),a=document.createElement("a");a.href=l,a.download=`${t.slug}-full-edition.html`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(l)};return e.jsx("div",{className:"min-h-screen bg-[#050505] text-white font-sans p-4 sm:p-6 md:p-12",children:e.jsxs("div",{className:"max-w-7xl mx-auto space-y-8",children:[e.jsxs("div",{className:"p-6 rounded-2xl bg-[#0D0D0D] border border-[#D4AF37]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1",children:[e.jsx(y,{size:16})," Confidential Admin Vault"]}),e.jsx("h1",{className:"text-2xl font-extrabold text-white",children:"Full E-Book Download & Reader API"}),e.jsx("p",{className:"text-xs text-neutral-400 mt-1",children:"Secret administrative repository to inspect, generate, and download complete publications."})]}),e.jsxs("div",{className:"px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2",children:[e.jsx(N,{size:14})," Secret API Key Active"]})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3",children:b.map(t=>e.jsxs("button",{type:"button",onClick:()=>x(t),className:`p-3 rounded-xl text-left transition-all border ${r.id===t.id?"bg-[#D4AF37]/20 border-[#D4AF37] text-white shadow-lg":"bg-[#0D0D0D] border-white/10 text-neutral-400 hover:text-white hover:border-white/30"}`,children:[e.jsx("span",{className:"text-[10px] text-[#D4AF37] font-bold block uppercase",children:t.category}),e.jsx("h3",{className:"text-xs font-semibold truncate mt-1 text-white",children:t.title}),e.jsxs("span",{className:"text-[10px] text-neutral-400 block mt-1",children:[t.pages," Pages · ₹",t.sellingPrice]})]},t.id))}),e.jsxs("div",{className:"p-4 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-6",children:[e.jsxs("div",{className:"flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/10 gap-4",children:[e.jsxs("div",{children:[e.jsx("span",{className:"text-xs text-[#D4AF37] font-bold uppercase tracking-wider",children:r.category}),e.jsx("h2",{className:"text-2xl font-bold text-white mt-1",children:r.title}),e.jsxs("p",{className:"text-xs text-neutral-400 mt-1",children:["Author: ",r.author," (",r.authorTitle,")"]})]}),e.jsxs("button",{type:"button",onClick:()=>w(r),className:"py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-black font-bold text-xs md:text-sm hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 max-w-full justify-center",children:[e.jsx(D,{size:16})," Download Full Edition (HTML/Printable PDF)"]})]}),e.jsxs("div",{className:"space-y-6 text-xs md:text-sm leading-relaxed text-neutral-300",children:[e.jsxs("div",{className:"p-4 rounded-xl bg-[#151515] border border-white/5 space-y-2",children:[e.jsx("h3",{className:"text-sm font-bold text-white",children:"Book Overview"}),e.jsx("p",{children:r.fullDescription})]}),(h=r.fullBookContent)==null?void 0:h.chapters.map(t=>e.jsxs("div",{className:"p-5 rounded-xl bg-[#121212] border border-white/5 space-y-3",children:[e.jsxs("h3",{className:"text-base font-bold text-[#D4AF37]",children:["Chapter ",t.number,": ",t.title]}),t.sections.map((i,o)=>e.jsxs("div",{className:"space-y-1",children:[e.jsx("h4",{className:"text-xs font-semibold text-white uppercase tracking-wide",children:i.heading}),e.jsx("p",{className:"text-neutral-400",children:i.body})]},o))]},t.number))]})]}),e.jsxs("div",{className:"p-6 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3 text-xs",children:[e.jsxs("h3",{className:"text-sm font-bold text-white flex items-center gap-2",children:[e.jsx(A,{size:16,className:"text-[#D4AF37]"})," Authenticated API"]}),e.jsx("p",{className:"text-neutral-400",children:"The full e-book repository requires an authenticated administrator session:"}),e.jsxs("div",{className:"space-y-2 font-mono text-[11px] break-words",children:[e.jsx("div",{className:"p-3 rounded-lg bg-[#151515] border border-white/5 text-emerald-400",children:"GET /api/admin/ebooks"}),e.jsx("div",{className:"p-3 rounded-lg bg-[#151515] border border-white/5 text-amber-400",children:"Sign in at /admin. Full content is excluded from public responses and browser bundles."})]})]})]})})}export{E as default};
