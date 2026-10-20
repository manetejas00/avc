import React, { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import V1Landing from './components/V1Landing';
import SiteLoader from './components/SiteLoader';
const ScreenerPage = lazy(() => import('./pages/ScreenerPage'));
const CompanyDetailsPage = lazy(() => import('./pages/CompanyDetailsPage'));
const IpoPage = lazy(() => import('./pages/IpoPage'));
const IpoDetailsPage = lazy(() => import('./pages/IpoDetailsPage'));
const EbooksPage = lazy(() => import('./pages/EbooksPage'));
const EbookDetailsPage = lazy(() => import('./pages/EbookDetailsPage'));
const EbookAdminVaultPage = lazy(() => import('./pages/EbookAdminVaultPage'));
const V2Page = lazy(() => import('../v2/V2Page'));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));

function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  useLayoutEffect(() => {
    const titles: Record<string, string> = {
      '/': 'AVC Dhanam Solutions Pvt. Ltd. | Financial Consultant in Virar West & Mumbai',
      '/screener': 'Equity Screener | AVC Dhanam Solutions',
      '/admin': 'Admin Login | AVC Dhanam Solutions',
      '/admin/dashboard': 'Admin Dashboard | AVC Dhanam Solutions',
      '/ebook-admin-vault': 'E-book Admin Vault | AVC Dhanam Solutions',
      '/v2': 'Ork | Banking'
    };
    document.title = titles[pathname] || 'AVC Dhanam Solutions';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Explore financial consultancy, investment education, market research, loans and insurance with AVC Dhanam Solutions in Virar West and Mumbai.');
    const canonical = `https://avcdhanam.com${pathname === '/ipos' ? '/ipo' : pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical);
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots); }
    robots.setAttribute('content', pathname.startsWith('/admin') || pathname === '/ebook-admin-vault' || pathname === '/v2' ? 'noindex, nofollow' : 'index, follow');
  }, [pathname]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' }); } catch { /* Invalid URL fragments have no target. */ }
      } else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, hash]);
  return null;
}

const HomePage = () => <V1Landing />;

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <SiteLoader />
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div role="status" className="min-h-screen grid place-content-center">Loading page…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/ipo" element={<IpoPage />} />
          <Route path="/ipos" element={<IpoPage />} />
          <Route path="/ipo/:id" element={<IpoDetailsPage />} />
          <Route path="/ebooks" element={<EbooksPage />} />
          <Route path="/ebooks/:slug" element={<EbookDetailsPage />} />
          <Route path="/ebook-admin-vault" element={<EbookAdminVaultPage />} />
          <Route path="/company/:ticker" element={<CompanyDetailsPage />} />
          <Route path="*" element={<main className="min-h-screen grid place-content-center gap-4 p-8 text-center"><h1 className="text-3xl">Page not found</h1><p>The requested page does not exist.</p><a href="/" className="underline">Return home</a></main>} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
}


export default App;
