import React, { useEffect, useRef } from 'react';

const TradingViewTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous script if re-rendering
    containerRef.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `
      {
        "symbols": [
          { "proName": "NSE:NIFTY", "title": "NIFTY 50 · NSE" },
          { "proName": "BSE:SENSEX", "title": "SENSEX · BSE" },
          { "proName": "SP:SPX", "title": "S&P 500" },
          { "proName": "NASDAQ:IXIC", "title": "NASDAQ Composite" }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "adaptive",
        "colorTheme": "dark",
        "locale": "en"
      }
    `;

    containerRef.current.appendChild(script);
    const container = containerRef.current;
    return () => { container.replaceChildren(); };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div><div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" target="_blank" rel="noreferrer">Market data by TradingView</a></div>
    </div>
  );
};

export default TradingViewTicker;
