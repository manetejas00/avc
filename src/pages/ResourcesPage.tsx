import { lazy, Suspense } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GuidanceLayout } from './GuidancePages';
const LiveMarketOverview = lazy(() => import('../components/LiveMarketOverview'));
const TradingViewTicker = lazy(() => import('../components/TradingViewTicker'));

export default function ResourcesPage() {
  const links = [
    ['Mutual fund explorer', '/mutual-funds', 'Search schemes, see NAV dates and compare up to three plans.'],
    ['Planning calculators', '/#calculators', 'Estimate a monthly goal contribution, SIP value or loan EMI.'],
    ['Learning centre', '/learn', 'Plain-language answers about SIPs, NAV, loans and insurance.'],
    ['Loan checklist', '/services/loans#loan-checklist', 'Prepare documents for salaried, self-employed or business applicants.'],
    ['Market tools', '/resources/markets', 'Explore dated market quotes and TradingView widgets.'],
    ['Equity screener', '/screener', 'Research companies; confirm source data before using it.'],
    ['IPO research', '/ipo', 'Official exchange and offer-document sources.'],
    ['E-books', '/ebooks', 'Our education library is coming soon.'],
  ];
  return <GuidanceLayout><section className="care-section"><p className="care-kicker">EXPLORE AT YOUR OWN PACE</p><h1>Resources for better questions.</h1><p className="care-intro">Tools and explanations to support your research. They do not replace product documents or advice suited to your circumstances.</p><div className="care-grid three">{links.map(([title, href, text]) => <a className="care-card care-service" href={href} key={href}><h2>{title}</h2><p>{text}</p><span className="care-card-link">Explore <ArrowUpRight size={17} /></span></a>)}</div></section></GuidanceLayout>;
}

export function MarketsPage() {
  return <GuidanceLayout><section className="care-section"><p className="care-kicker">MARKET RESEARCH</p><h1>Market data, with context.</h1><p>Widgets below are supplied by TradingView. Their displayed instrument names, exchange labels, availability and delay notices apply. A widget is not a general-purpose data API. The separate quote panel identifies its own source and timestamps.</p><Suspense fallback={<p>Loading market tools…</p>}><TradingViewTicker /></Suspense><p><a href="https://www.tradingview.com/widget/" target="_blank" rel="noreferrer">TradingView widgets & source</a> · Instrument availability and delays vary. If a widget is unavailable, use its provider link; no substitute instrument is shown.</p></section><Suspense fallback={<p>Loading quotes…</p>}><LiveMarketOverview /></Suspense></GuidanceLayout>;
}

export function VerifiedIpoPage() {
  return <GuidanceLayout><section className="care-section"><p className="care-kicker">OFFICIAL SOURCES FIRST</p><h1>IPO research</h1><p className="care-intro">Check the current exchange notice and final offer documents before making an application.</p><div className="care-card"><h2>Verified IPO list: data unavailable</h2><p>No current issue has been manually verified for publication here. Unverified subscription figures, grey-market premiums and automatic “expected gain” figures are not displayed.</p><p>Verification time: not available. A future issue entry will include its source document, exchange, applicable dates and the time it was checked.</p></div><div className="care-grid three care-ipo-sources"><a className="care-card" href="https://www.nseindia.com/market-data/all-upcoming-issues-ipo" target="_blank" rel="noreferrer"><h2>NSE public issues</h2><p>Check issue notices and exchange information.</p><span>Open official source ↗</span></a><a className="care-card" href="https://www.bseindia.com/publicissue.html" target="_blank" rel="noreferrer"><h2>BSE public issues</h2><p>Check the exchange’s public issue information.</p><span>Open official source ↗</span></a><a className="care-card" href="https://www.sebi.gov.in/filings/public-issues.html" target="_blank" rel="noreferrer"><h2>SEBI offer documents</h2><p>Read applicable filings and risk factors.</p><span>Open official source ↗</span></a></div><p>An IPO allocation or listing gain is not guaranteed. Verify issue dates, price band, lot size, issuer details and application process in the current official documents. A draft filing alone does not confirm an open offer.</p></section></GuidanceLayout>;
}
