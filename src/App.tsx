import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import V1Landing from './components/V1Landing';
import ScreenerPage from './pages/ScreenerPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import IpoPage from './pages/IpoPage';
import IpoDetailsPage from './pages/IpoDetailsPage';
import EbooksPage from './pages/EbooksPage';
import EbookDetailsPage from './pages/EbookDetailsPage';
import V2Page from '../v2/V2Page';
import SiteLoader from './components/SiteLoader';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);
  return null;
}

const HomePage = () => <V1Landing />;

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <SiteLoader />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/ipo" element={<IpoPage />} />
          <Route path="/ipos" element={<IpoPage />} />
          <Route path="/ipo/:id" element={<IpoDetailsPage />} />
          <Route path="/ebooks" element={<EbooksPage />} />
          <Route path="/ebooks/:slug" element={<EbookDetailsPage />} />
          <Route path="/company/:ticker" element={<CompanyDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}


export default App;
