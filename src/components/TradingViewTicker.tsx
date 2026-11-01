import React, { useEffect, useRef, useState } from 'react';

const TradingViewTicker = () => {
  const [failed, setFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous script if re-rendering
    containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.onerror = () => setFailed(true);
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          {
            "proName": "BSE:SENSEX",
            "title": "Sensex · BSE"
          },
          {
            "proName": "BSE:ITBEES",
            "title": "ITBEES ETF · BSE"
          },
          {
            "proName": "BSE:HDFCBANK",
            "title": "HDFC Bank · BSE"
          },
          {
            "proName": "BSE:TCS",
            "title": "TCS · BSE"
          },
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500 CFD · FOREXCOM"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "NASDAQ 100 CFD · FOREXCOM"
          },
          {
            "proName": "BSE:RELIANCE",
            "title": "Reliance · BSE"
          },
          {
            "proName": "BSE:INFY",
            "title": "Infosys · BSE"
          },
          {
            "proName": "BSE:ICICIBANK",
            "title": "ICICI Bank · BSE"
          },
          {
            "proName": "BSE:SBIN",
            "title": "State Bank of India · BSE"
          },
          {
            "proName": "NASDAQ:AAPL",
            "title": "Apple · NASDAQ"
          },
          {
            "proName": "NASDAQ:GOOGL",
            "title": "Google · NASDAQ"
          },
          {
            "proName": "NASDAQ:AMZN",
            "title": "Amazon · NASDAQ"
          },
          {
            "proName": "NASDAQ:TSLA",
            "title": "Tesla · NASDAQ"
          },
          {
            "proName": "NASDAQ:MSFT",
            "title": "Microsoft · NASDAQ"
          }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": "dark",
        "locale": "in"
      }
    `;

    const container = containerRef.current;
    container.appendChild(script);
    return () => container.replaceChildren();
  }, []);

  return (
    <div>{failed && <p role="status">Data unavailable. TradingView could not load.</p>}<div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div><p className="market-source-note">Source: TradingView widgets. Instruments and exchanges are labelled above. Quotes may be delayed or end-of-day. Quote date/time and exact delay are unavailable in this ticker; open the instrument link to verify. ETFs and CFDs are not index values.</p></div>
  );
};

export default TradingViewTicker;
