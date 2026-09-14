import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 bg-surface border-t border-border/50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="bg-white rounded-xl p-2 shadow-md inline-block mb-3">
              <img src="/logo.jpg" alt="AVC Dhanam Logo" className="h-16 w-auto object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-text">AVC Dhanam Solutions Pvt. Ltd.</span>
            <span className="text-sm text-text-muted">Virar West, Mumbai</span>
          </div>
          
          <div className="text-sm text-text-muted text-center max-w-md">
            SEBI-authorised Sub Broker of Motilal Oswal & AMFI-registered Mutual Fund Distributor.
            <br />
            © {new Date().getFullYear()} All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-text-muted">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
