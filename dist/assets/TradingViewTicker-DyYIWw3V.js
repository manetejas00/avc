import{r as i,j as r}from"./index-C2R2Q7_J.js";const s=()=>{const e=i.useRef(null);return i.useEffect(()=>{if(!e.current)return;e.current.innerHTML='<div class="tradingview-widget-container__widget"></div>';const t=document.createElement("script");t.src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",t.type="text/javascript",t.async=!0,t.innerHTML=`
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
    `,e.current.appendChild(t);const a=e.current;return()=>{a.replaceChildren()}},[]),r.jsxs("div",{className:"tradingview-widget-container",ref:e,children:[r.jsx("div",{className:"tradingview-widget-container__widget"}),r.jsx("div",{className:"tradingview-widget-copyright",children:r.jsx("a",{href:"https://www.tradingview.com/",target:"_blank",rel:"noreferrer",children:"Market data by TradingView"})})]})};export{s as default};
