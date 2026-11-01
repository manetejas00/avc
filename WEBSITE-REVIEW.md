# AVC Dhanam website review — 1 November 2026

The existing V1 template is retained: fonts, palette, navigation, footer, section order, hero and service carousels, director cards, calculator suite and existing routes. No new theme, homepage replacement or generated people were added.

## Initial review, before changes

- The contact modal simulated success with a timer and sent no enquiry. The live `/api/submit-form` returned HTTP 404.
- The Hostinger account had PHP/SQLite support, but no Node executable, active application server, enquiry database or admin login configuration.
- The ticker labelled ITBEES as an index and FOREXCOM CFDs as index values. One ETF symbol was empty.
- Frontend and backend IPO code manufactured missing financials, issue sizes, subscriptions and registrar details. Unknown profiles could return an unrelated IPO.
- The homepage, footer, metadata and FAQs asserted registrations, partner counts, client counts, AUM, office hours and community statistics without evidence in the supplied materials. Review names, quotations, portraits and consent were unverified.
- News fallbacks manufactured market headlines and publication timestamps. PHP proxies included fallback credentials.
- Existing director photographs were present. Large hero and service images could be optimised without replacing them.

## Completed in the existing components

- Clear service descriptions and next steps, covering wealth management, stocks, mutual funds, SIPs, PMS, AIF, pre-IPO/unlisted shares, IPOs, loans and insurance. Availability and provider eligibility must be confirmed; no guaranteed returns or approvals.
- Existing service pop-ups contain investment explanations and loan document checklists for salaried, self-employed and business applicants.
- Existing FAQs provide a short learning section. No Resources section existed, so navigation and route organisation were retained.
- The team’s final instruction was **call and WhatsApp only**. Contact actions use the existing +91 7030247878 number. The simulated callback form is removed. **No database, login or dashboard account was created.** Existing email remains unchanged in the footer.
- Both existing director photographs retained with responsive WebP copies. Existing hero/service image content also retained. The ten 1280px copies total 977,176 bytes versus 6,930,023 bytes for the source images (86% smaller); original assets remain available.
- Existing illustrative scenes are labelled as illustrations rather than claimed office/event photography. No new testimonials or office photographs were generated.
- Unverified statistics, credentials, partner claims, office hours and reviews are withheld. The existing review section states that verified reviews are not yet available.
- SIP, EMI, lump-sum and retirement calculators retain their interface, state assumptions, exclude fees/taxes explicitly and describe outputs as estimates. SIP and EMI were independently checked using month-by-month cash flows. Retirement’s 25× rule is explicitly a rule of thumb, not a complete retirement plan.
- TradingView ticker retained, with exchange labels, explicit ETF/CFD labels and source/delay limitations. The ticker does not expose quote timestamps; the page says so and links each instrument to its source view. No guessed time/delay is published.
- Market overview retains its layout. Quotes include source, exchange/venue, quote time and delay status. Charts must match the selected instrument. Daily closing ranges are identified correctly. Missing/failed data uses “Data unavailable”. Watchlist movers are not described as exchange-wide rankings.
- Invented company metric fallbacks removed. Undated fundamentals are withheld. Unavailable dividend data no longer asserts that no dividend was announced.
- IPO routes retain their template but withhold all data pending a dated list checked against official notices/documents. No subscriptions or guessed figures are shown. An official NSE link is provided.
- News requires a genuine HTTPS publisher link and publication date. Fabricated news baselines and fallback secret keys are removed. Browser news uses a server proxy.
- Twelve Data requires explicit commercial-licence configuration. Alpha Vantage is excluded from public provider cascades. No secret API key values were found in the built browser bundles.
- Keyboard focus stays inside contact, service, article, legal and mobile-menu dialogs. Mobile inputs retain readable sizing; main contact actions meet 44px/48px touch sizing.
- Mutual-fund explorer is inside the existing investment-service pop-up, without a new page or homepage section. MFapi supplies scheme search, dated NAV and history; PHP caches responses for one hour, the browser for five minutes. Comparison is limited to three schemes and uses identical start/end dates across schemes. 1Y is absolute NAV change; 3Y/5Y are annualised over actual elapsed days. Missing periods show “Data unavailable”. IDCW return comparisons are withheld because distributions require total-return treatment.
- The official AMFI file was checked. Its current format includes separate Plan and Option columns; the parser supports both six- and eight-column rows using the final NAV/date fields. Scheme 125497 matched MFapi at NAV 197.8812, dated 31 October 2026. Each selection reports matched, mismatched, different-date or unavailable cross-check status; none is implied to pass.

## Evidence still needed from the business

Before restoring any such claims, supply current registration evidence and registered entity names; provider/partner authorisations; dated client/AUM/experience figures; genuine reviews with permission; verified office/event photographs; confirmed office hours; and any proposed fee statements. Any future callback feature needs an approved receiving system and working access for the team. Current contact is call/WhatsApp only by request.

A verified IPO list would need individual official notices/offer documents and verification timestamps. No list is published until that evidence is available. Exact market-feed delays are not exposed by every source and must not be invented.

## Validation

- Production TypeScript/Vite build passed.
- Eight focused tests passed: independent calculator cash-flow checks, comparison dates/missing-history cases, withholding unverified IPO data, scroll locking and session-price changes.
- PHP proxy and modified backend syntax checks passed.
- Local responsive review: 320, 375, 491, 768 and 1280px document widths matched their viewports, with no loaded broken images or missing homepage anchor targets.
- The final main contact actions do not submit a website form. No messages were sent and no customer data was collected during testing.
- Repository-wide lint has existing unused imports and hook/refresh warnings outside this change. It is not reported as a passing check.

## Primary sources consulted

- MFapi API and caching documentation: https://www.mfapi.in/docs/
- Official AMFI NAV file: https://portal.amfiindia.com/spages/NAVAll.txt
- AMFI NAV entry point: https://www.amfiindia.com/net-asset-value
- TradingView widget data limitations: https://www.tradingview.com/widget-docs/faq/data/
- TradingView supported widget markets: https://www.tradingview.com/widget-docs/markets/
- Alpha Vantage quota information: https://www.alphavantage.co/support/
- Official NSE IPO notices: https://www.nseindia.com/market-data/all-upcoming-issues-ipo
- SEBI investor education on NAV: https://investor.sebi.gov.in/securities-mf-investments.html
- SEBI investor education on PMS risks/eligibility: https://investor.sebi.gov.in/pms_final.html
- AMFI mutual-fund risks: https://www.amfiindia.com/investor/knowledge-center-info?zoneName=riskInMutualFunds

## Follow-up: news images and watchlist feeds

The PHP-hosted site now has an independent fixed watchlist endpoint for twelve NSE stocks, cached for three minutes. Gainers and losers load independently of the index feed. Each tab separates loading, failed-feed and no-matching-movement states. Coverage and constituent symbols are disclosed; this is not an exchange-wide ranking. The stock parser rejects unknown symbols, symbol mismatches, duplicates, non-INR instruments and missing quote timestamps.

The news endpoint uses official BusinessLine and Livemint RSS media attachments for article-specific images. The rotating generic illustrations have been removed from the endpoint, cards and article pop-up. A failed or absent publisher image produces a labelled unavailable state. News responses with sufficient publisher images are cached for five minutes; text-only fallback responses are not persisted by that server cache. The frontend uses a new cache version to avoid older browser responses. Publisher redirects use HTTPS with a maximum of three redirects. Image resources remain on publisher hosts.

Validation: twelve stock chart responses returned; gainers and losers were independently checked in the browser; six articles returned their own publisher image URLs; sampled image URLs returned HTTP 200 with image content types. Production build passed. Nine focused tests passed, including the new watchlist validation test.

## Follow-up: confirmed figures, company data and fund history (1 November 2026)

The owner confirmed the five prior hero figures: 8+ years, 500+ clients, ₹15+ crore AUM, 210+ bank/NBFC relationships and 10+ Chartered Accountants. These are restored as owner-confirmed business figures. The count-up starts when visible after the loader, runs once and respects reduced-motion preferences. This confirmation does not establish registrations or partner authorisations.

A PHP company-data adapter now supplies exchange-matched TradingView RSI, trailing P/E, sector/industry and 52-week ranges. Source quote time and the provider delay flag are displayed. Dividend records use the same adapter, with separate loading, retry and missing-announcement states. NSE watchlist links retain their exchange. Company metadata now uses normal sentence case, 14px text and 1.7 line height instead of the inherited uppercase heading style.

The exact reported fund, scheme 153963, returned 212 NAV records from 17 December 2025 to 29 October 2026, with latest NAV/date matching AMFI. It cannot support a full-year return yet. The comparison now includes 1/3/6-month absolute returns and change since the first common available NAV. Longer periods explain the actual history coverage. Numeric results within each row use common dates, and a younger scheme does not hide results for older eligible schemes. IDCW returns remain excluded because payouts need total-return treatment.

The IPO page now publishes one manually reviewed issue, Bombay Coated and Special Steels Limited, checked at 2026-11-01T17:28:33Z against the official NSE upcoming-issues feed and SEBI abridged prospectus. This is explicitly a dated subset rather than a live market-wide list. Unchecked lot size, minimum investment, subscriptions, listing date and financial figures are omitted. Sources: https://www.nseindia.com/api/all-upcoming-issues?category=ipo and https://www.sebi.gov.in/filings/public-issues/oct-2026/bombay-coated-and-special-steels-limited-rhp_105447.html .

Validation: all ten sampled local feeds passed (BSE/NSE company profiles, dividends, young/mature funds, scheme search, watchlist, publisher news and NSE/BSE index histories). Eleven focused tests passed, PHP syntax and production build passed. Company pages at 320/768/1280px and hero/IPO at 375px had no horizontal document overflow or loaded broken images. Browser checks confirmed short-period Axis returns, AMFI match, readable comparison text and final business counters. Existing whole-repository lint limitations remain as recorded above.

Contact remains call and WhatsApp only; no database or login was created.
