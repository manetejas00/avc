import React from 'react';

const partnerLogos = [
  { name: 'Motilal Oswal', src: '/assets/motilal_oswal.png' },
  { name: 'SEBI Authorised', src: '/assets/sebi.png' },
  { name: 'AMFI Registered', src: '/assets/amfi.png' },
  { name: 'NSE', src: '/assets/nse.png' },
  { name: 'BSE', src: '/assets/bse.png' },
  { name: 'MCX', src: '/assets/mcx.png' },
];

const TrustedBy = () => {
  return (
    <section id="about" className="py-16 md:py-24 border-y border-white/5 bg-surface overflow-hidden">
      <div className="container-custom">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Trusted Financial Partner, Rooted in India
          </h2>
          <p className="text-text-muted text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Backed by a network of <span className="text-gold-primary">210+ Bank & NBFC Partners</span>.
          </p>
        </div>
        
        <div className="relative w-full flex overflow-hidden mask-horizontal marquee-container">
          {/* Marquee Inner */}
          <div className="flex gap-4 md:gap-6 items-center w-max animate-marquee pb-4 pt-2 hover:pause">
            {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, i) => (
              <div 
                key={`logo-${i}`} 
                className="w-[140px] h-[70px] sm:w-[160px] sm:h-[80px] md:w-[200px] md:h-[90px] flex items-center justify-center bg-surface-elevated border border-white/5 rounded-2xl p-4 shrink-0 transition-colors duration-300 hover:border-white/20 hover:bg-surface group"
                title={logo.name}
              >
                <span className="text-white/75 group-hover:text-gold-primary font-semibold text-sm sm:text-base md:text-lg text-center transition-colors duration-300">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style>{`
        .mask-horizontal {
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee.hover\\:pause:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
            transform: none;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            width: 100%;
          }
          .mask-horizontal {
            -webkit-mask-image: none;
            mask-image: none;
          }
          .marquee-container {
            overflow: visible;
          }
          /* Hide duplicates in reduced motion mode */
          .animate-marquee > div:nth-child(n+7) {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TrustedBy;
