import React, { useEffect, useRef } from 'react';

const TradingViewTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clean up previous script if re-rendering
    containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    
    const script = document.createElement('script');
    script.src = import.meta.env.VITE_TRADINGVIEW_WIDGET_TICKER_TAPE;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {
            "proName": "BSE:SENSEX",
            "title": "Sensex"
          },
          {
            "proName": "BSE:ITBEES",
            "title": "Nifty IT"
          },
          {
            "proName": "BSE:AUTOBEES",
            "title": "Nifty Auto"
          },
          {
            "proName": "BSE:HDFCBANK",
            "title": "HDFC Bank"
          },
          {
            "proName": "BSE:TCS",
            "title": "TCS"
          },
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "NASDAQ 100"
          },
          {
            "proName": "BSE:RELIANCE",
            "title": "Reliance"
          },
          {
            "proName": "BSE:INFY",
            "title": "Infosys"
          },
          {
            "proName": "BSE:ICICIBANK",
            "title": "ICICI Bank"
          },
          {
            "proName": "BSE:SBIN",
            "title": "State Bank of India"
          },
          {
            "proName": "NASDAQ:AAPL",
            "title": "Apple"
          },
          {
            "proName": "NASDAQ:GOOGL",
            "title": "Google"
          },
          {
            "proName": "NASDAQ:AMZN",
            "title": "Amazon"
          },
          {
            "proName": "NASDAQ:TSLA",
            "title": "Tesla"
          },
          {
            "proName": "NASDAQ:MSFT",
            "title": "Microsoft"
          }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": "dark",
        "locale": "in"
      }
    `;
    
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default TradingViewTicker;
