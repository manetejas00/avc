import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, ShieldCheck, Award, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="blueprint-footer text-gray-300 pt-12 pb-7 relative overflow-hidden">
      <div className="container-custom relative z-10">
        <div className="blueprint-footer__ruler"><span>END OF DRAWING</span><span>DOCUMENT AVC-2026-01</span><span>REVISION 01</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-7 py-9 border-y border-white/40">
          
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4 blueprint-footer__brand">
            <a href="#" className="inline-block group focus:outline-none">
              <img
                src="/logo_gold_transparent.svg"
                alt="AVCDHANAM Solutions Logo"
                className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </a>
            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              AVC Dhanam Solutions Private Limited is a SEBI-authorised Sub Broker of Motilal Oswal Financial Services and an AMFI-registered Mutual Fund Distributor in Mumbai, empowering Indian investors with smart wealth growth strategies.
            </p>

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-cyan-300 shrink-0 mt-0.5" />
                <span>Shop No. 4/5, Ground Floor, Royal Palms, Virar West, Palghar, Mumbai, Maharashtra - 401303, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-cyan-300 shrink-0" />
                <a href="tel:+919820000000" className="blueprint-footer__link">+91 98200 00000 / +91 22 2800 0000</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-cyan-300 shrink-0" />
                <a href="mailto:support@avcdhanam.com" className="blueprint-footer__link">support@avcdhanam.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock size={16} className="text-cyan-300 shrink-0" />
                <span>Mon - Sat: 9:00 AM - 6:30 PM (IST)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links (Site Map) */}
          <div className="space-y-3">
            <h4 className="blueprint-footer__heading">01 / Site Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#" className="blueprint-footer__link">— Home Overview</a></li><li><a href="#services" className="blueprint-footer__link">— Financial Services</a></li><li><a href="#markets" className="blueprint-footer__link">— Stock Markets <span className="blueprint-live">Live</span></a></li><li><a href="#calculators" className="blueprint-footer__link">— Wealth Calculators</a></li><li><a href="#news" className="blueprint-footer__link">— Financial News</a></li><li><a href="#faq" className="blueprint-footer__link">— FAQ & Support</a></li>
            </ul>
          </div>

          {/* Column 3: Products & Services */}
          <div className="space-y-3">
            <h4 className="blueprint-footer__heading">02 / Offerings</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><a href="#services" className="blueprint-footer__link">Mutual Fund SIP & Lumpsum</a></li><li><a href="#services" className="blueprint-footer__link">Portfolio Management (PMS)</a></li><li><a href="#services" className="blueprint-footer__link">Alternative Investment (AIF)</a></li><li><a href="#services" className="blueprint-footer__link">Equity & Algo Trading</a></li><li><a href="#services" className="blueprint-footer__link">IPO Application Advisory</a></li><li><a href="#services" className="blueprint-footer__link">Gold & Commodity Markets</a></li><li><a href="#services" className="blueprint-footer__link">Term Insurance & Loans</a></li>
            </ul>
          </div>

          {/* Column 4: Regulatory & SEBI Details */}
          <div className="space-y-3">
            <h4 className="blueprint-footer__heading">03 / Registrations</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="blueprint-registration flex items-start gap-2">
                <ShieldCheck className="text-cyan-300 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-white block">SEBI Sub Broker</strong>
                  <span>Motilal Oswal Sub-Broker Code: <strong>MOSB-48192</strong></span>
                </div>
              </div>
              <div className="blueprint-registration flex items-start gap-2">
                <Award className="text-cyan-300 shrink-0 mt-0.5" size={16} />
                <div>
                  <strong className="text-white block">AMFI Mutual Fund Distributor</strong>
                  <span>ARN Registration: <strong>ARN-184920</strong></span>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blueprint-footer__link text-xs flex items-center gap-1"
                >
                  <span>🌐</span> XML Sitemap <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="py-5 border-b border-white/30 text-xs text-white/60 space-y-2 leading-relaxed">
          <p>
            <strong className="text-cyan-200">Risk Disclosure /</strong> Mutual Fund investments are subject to market risks, read all scheme-related documents carefully before investing. Past performance is not indicative of future returns. AVC Dhanam Solutions Private Limited is an AMFI registered mutual fund distributor and SEBI registered sub-broker for Motilal Oswal. We do not provide guaranteed returns or unauthorized financial advice.
          </p>
        </div>

        <div className="pt-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60">
          <div>
            © {currentYear} <strong>AVC Dhanam Solutions Pvt. Ltd.</strong> All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="blueprint-footer__link">Privacy Policy</a><a href="#" className="blueprint-footer__link">Terms of Service</a><a href="#" className="blueprint-footer__link">Disclosures</a><a href="/sitemap.xml" className="blueprint-footer__link">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
