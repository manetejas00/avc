import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 bg-surface border-t border-border/50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex items-center justify-center h-8 w-8 bg-gradient-to-tr from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200 leading-none">
                  AVCDHANAM
                </span>
                <span className="text-[9px] uppercase tracking-widest text-text-muted mt-0.5 font-medium">
                  Solutions Pvt Ltd
                </span>
              </div>
            </div>

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
