import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck, TrendingUp, Award, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#070A0B] text-gray-300 border-t border-[#D4AF37]/30 pt-16 pb-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D4AF37]/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container-custom relative z-10">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#D4AF37]/20">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="#" className="inline-block group focus:outline-none">
              <img
                src="/logo_gold_transparent.svg"
                alt="AVCDHANAM Solutions Logo"
                className="h-10 sm:h-12 w-auto drop-shadow-[0_2px_10px_rgba(212,175,55,0.4)] transition-transform duration-300 group-hover:scale-105"
              />
            </a>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              AVC Dhanam Solutions Private Limited is a SEBI-authorised Sub Broker of Motilal Oswal Financial Services and an AMFI-registered Mutual Fund Distributor in Mumbai, empowering Indian investors with smart wealth growth strategies.
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#F5C542] shrink-0 mt-0.5" />
                <span>Shop No. 4/5, Ground Floor, Royal Palms, Virar West, Palghar, Mumbai, Maharashtra - 401303, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#F5C542] shrink-0" />
                <a href="tel:+919820000000" className="hover:text-[#F5C542] transition-colors">+91 98200 00000 / +91 22 2800 0000</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#F5C542] shrink-0" />
                <a href="mailto:support@avcdhanam.com" className="hover:text-[#F5C542] transition-colors">support@avcdhanam.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-[#F5C542] shrink-0" />
                <span>Mon - Sat: 9:00 AM - 6:30 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Site Map) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">Site Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Home Overview</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Financial Services</a></li>
              <li><a href="#markets" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Stock Markets <span className="bg-[#D4AF37]/20 text-[#F5C542] text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase">Live</span></a></li>
              <li><a href="#mutual-funds" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Mutual Fund Explorer</a></li>
              <li><a href="#calculators" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Wealth Calculators</a></li>
              <li><a href="#news" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> Financial News</a></li>
              <li><a href="#faq" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5"><span>•</span> FAQ & Support</a></li>
              <li><a href="/admin" className="hover:text-[#F5C542] transition-colors flex items-center gap-1.5 text-[#D4AF37]"><span>🔒</span> Admin Portal Login</a></li>
            </ul>
          </div>

          {/* Column 3: Products & Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">Products & Offerings</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Mutual Fund SIP & Lumpsum</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Portfolio Management (PMS)</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Alternative Investment (AIF)</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Equity & Algo Trading</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">IPO Application Advisory</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Gold & Commodity Markets</a></li>
              <li><a href="#services" className="hover:text-[#F5C542] transition-colors">Term Insurance & Loans</a></li>
            </ul>
          </div>

          {/* Column 4: Regulatory & SEBI Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">SEBI & AMFI Registrations</h4>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="p-3 rounded-xl bg-[#0F1517] border border-[#D4AF37]/20 flex items-start gap-2">
                <ShieldCheck className="text-[#F5C542] shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-gray-200 block">SEBI Sub Broker</strong>
                  <span>Motilal Oswal Sub-Broker Code: <strong>MOSB-48192</strong></span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0F1517] border border-[#D4AF37]/20 flex items-start gap-2">
                <Award className="text-[#F5C542] shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-gray-200 block">AMFI Mutual Fund Distributor</strong>
                  <span>ARN Registration: <strong>ARN-184920</strong></span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#F5C542] hover:underline flex items-center gap-1"
                >
                  <span>🌐</span> XML Sitemap <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Disclaimer Notice */}
        <div className="py-6 border-b border-[#D4AF37]/10 text-xs text-gray-400 space-y-2 leading-relaxed">
          <p>
            <strong className="text-gray-300">Disclaimer & Risk Disclosure:</strong> Mutual Fund investments are subject to market risks, read all scheme-related documents carefully before investing. Past performance is not indicative of future returns. AVC Dhanam Solutions Private Limited is an AMFI registered mutual fund distributor and SEBI registered sub-broker for Motilal Oswal. We do not provide guaranteed returns or unauthorized financial advice.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div>
            © {currentYear} <strong>AVC Dhanam Solutions Pvt. Ltd.</strong> All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#F5C542] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#F5C542] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#F5C542] transition-colors">Disclosures</a>
            <a href="/sitemap.xml" className="hover:text-[#F5C542] transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
