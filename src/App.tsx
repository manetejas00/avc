import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import Process from './components/Process';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Calculators from './components/Calculators';
import MutualFundNav from './components/MutualFundNav';
import MarketOverview from './components/MarketOverview';
import FAQ from './components/FAQ';
import Articles from './components/Articles';
import CTA from './components/CTA';
import Footer from './components/Footer';
import MarketDashboard from './components/MarketDashboard';
import MutualFundExplorer from './components/MutualFundExplorer';
import FinancialNews from './components/FinancialNews';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';

const HomePage = () => (
  <>
    <Navbar />
    <Hero />
    <TrustedBy />
    <MarketDashboard />
    <Process />
    <Benefits />
    <MutualFundExplorer />
    <Features />
    <Calculators />
    <MutualFundNav />
    <MarketOverview />
    <FinancialNews />
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
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
