import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const MarketOverview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from('.market-title', {
      y: 20, opacity: 0, duration: 1,
      scrollTrigger: { trigger: containerRef.current, start: 'top 85%' }
    });
    
    gsap.from('.market-widget', {
      y: 40, opacity: 0, duration: 1, delay: 0.2,
      scrollTrigger: { trigger: containerRef.current, start: 'top 80%' }
    });
  }, { scope: containerRef });

  useEffect(() => {
    if (!widgetContainerRef.current) return;
    
    widgetContainerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    
    const script = document.createElement('script');
    script.src = import.meta.env.VITE_TRADINGVIEW_WIDGET_MARKET_OVERVIEW;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "colorTheme": "dark",
        "dateRange": "12M",
        "showChart": true,
        "locale": "in",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "showFloatingTooltip": false,
        "width": "100%",
        "height": "600",
        "tabs": [
          {
            "title": "Indices",
            "symbols": [
              {
                "s": "BSE:SENSEX",
                "d": "Sensex"
              },
              {
                "s": "BSE:BSE-100",
                "d": "BSE 100"
              },
              {
                "s": "BSE:BSE-SMLCAP",
                "d": "BSE Smallcap"
              },
              {
                "s": "BSE:BSE-MIDCAP",
                "d": "Midcap"
              }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Indian Stocks",
            "symbols": [
              {
                "s": "BSE:RELIANCE",
                "d": "Reliance"
              },
              {
                "s": "BSE:TCS",
                "d": "TCS"
              },
              {
                "s": "BSE:HDFCBANK",
                "d": "HDFC Bank"
              },
              {
                "s": "BSE:INFY",
                "d": "Infosys"
              },
              {
                "s": "BSE:ICICIBANK",
                "d": "ICICI Bank"
              },
              {
                "s": "BSE:SBIN",
                "d": "State Bank of India"
              },
              {
                "s": "BSE:BHARTIARTL",
                "d": "Bharti Airtel"
              },
              {
                "s": "BSE:ITC",
                "d": "ITC"
              }
            ],
            "originalTitle": "Indices"
          },
          {
            "title": "Commodities",
            "symbols": [
              {
                "s": "TVC:GOLD",
                "d": "Gold"
              },
              {
                "s": "TVC:SILVER",
                "d": "Silver"
              },
              {
                "s": "TVC:USOIL",
                "d": "Crude Oil"
              }
            ]
          },
          {
            "title": "Sectoral Indices",
            "symbols": [
              {
                "s": "BSE:ITBEES",
                "d": "Nifty IT"
              },
              {
                "s": "BSE:AUTOBEES",
                "d": "Nifty Auto"
              },
              {
                "s": "BSE:FMCGIETF",
                "d": "Nifty FMCG"
              },
              {
                "s": "BSE:TATAETFMET",
                "d": "Nifty Metal"
              },
              {
                "s": "BSE:INFRABEES",
                "d": "Nifty Infra"
              }
            ]
          },
          {
            "title": "US Markets",
            "symbols": [
              {
                "s": "FOREXCOM:SPXUSD",
                "d": "S&P 500"
              },
              {
                "s": "FOREXCOM:NSXUSD",
                "d": "NASDAQ 100"
              },
              {
                "s": "FOREXCOM:DJI",
                "d": "Dow Jones"
              },
              {
                "s": "NASDAQ:AAPL",
                "d": "Apple"
              },
              {
                "s": "NASDAQ:NVDA",
                "d": "Nvidia"
              },
              {
                "s": "NASDAQ:META",
                "d": "Meta"
              },
              {
                "s": "NASDAQ:AMZN",
                "d": "Amazon"
              },
              {
                "s": "NASDAQ:NFLX",
                "d": "Netflix"
              }
            ]
          }
        ]
      }
    `;
    
    widgetContainerRef.current.appendChild(script);
  }, []);

  return (
    <section id="markets" ref={containerRef} className="py-24 bg-surface-elevated overflow-hidden">
      <div className="container-custom">
        <div className="market-title text-center mb-16">
          <h2 className="text-4xl md:text-[52px] font-semibold mb-4 text-text">Live Market Overview</h2>
          <p className="text-text-muted text-lg max-w-3xl mx-auto">
            Track NSE/BSE indices, sectoral performance, global commodities, and major US Markets in real-time.
          </p>
        </div>
        
        <div className="market-widget w-full max-w-5xl mx-auto bg-surface border border-white/5 rounded-card p-4 shadow-xl h-[640px]">
          <div className="tradingview-widget-container h-full w-full" ref={widgetContainerRef}>
            <div className="tradingview-widget-container__widget h-full w-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketOverview;
