import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import V1Landing from './components/V1Landing';
import ScreenerPage from './pages/ScreenerPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import V2Page from '../v2/V2Page';
import SiteLoader from './components/SiteLoader';

const HomePage = () => <V1Landing />;

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <SiteLoader />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/company/:ticker" element={<CompanyDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
