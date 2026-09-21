import React from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Process from './components/Process';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Calculators from './components/Calculators';
import MarketOverview from './components/MarketOverview';
import FAQ from './components/FAQ';
import Articles from './components/Articles';
import CTA from './components/CTA';
import Footer from './components/Footer';
import MutualFundExplorer from './components/MutualFundExplorer';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import ScreenerPage from './pages/ScreenerPage';
import V2Page from '../v2/V2Page';

const HomePage = () => (
  <>
    <Navbar />
    <Hero />
    <TrustedBy />
    <Process />
    <Benefits />
    <MutualFundExplorer />
    <Features />
    <Calculators />
    <MarketOverview />
    <FAQ />
    <Articles />
    <CTA />
    <Footer />
  </>
);

function App() {
  return (
    <div className="min-h-screen bg-background font-sans text-text">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/v2" element={<V2Page />} />
          <Route path="/screener" element={<ScreenerPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
