import React from 'react';
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

function App() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Process />
      <Benefits />
      <Features />
      <Calculators />
      <MutualFundNav />
      <MarketOverview />
      <FAQ />
      <Articles />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
