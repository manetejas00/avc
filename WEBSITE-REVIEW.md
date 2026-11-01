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

## Follow-up: connected IPO feed and review carousel

The fixed one-issue snapshot has been replaced by a PHP adapter for the three endpoints used by NSE's own IPO page: all-upcoming-issues?category=ipo, ipo-current-issue and public-past-issues. The live server requires HTTP/1.1 for these requests. The adapter retrieves them concurrently, keeps only equity/SME issues and past issues closed within 90 days, deduplicates symbols, and enriches up to twelve active/upcoming notices through ipo-detail. Dates, price bands, exact bid lots, registrar names and HTTPS NSE document links are preserved when supplied; missing fields are not guessed. One-lot cost is labelled arithmetic at the upper band rather than minimum application eligibility. BSE issues explicitly marked isBse retain BSE classification. This is NSE-feed coverage and may omit BSE-only issues.

The five-minute server cache holds only complete list responses. If every upstream fails, an existing response up to 24 hours old can be returned with an explicit stale warning and its original retrieval time. Partial source failures are disclosed. Bid ratios are withheld because different NSE feeds describe different bid scopes; no subscription timestamp is invented. Listed-within-seven-days filtering uses actual supplied listing dates and India calendar dates. Refresh requests the endpoint rather than reloading a bundled snapshot.

Local integration returned 87 records: three open, one upcoming, five closed and 78 listed, without feed warnings. BCSSL's official issue detail supplied a 182-share lot; VPFL supplied 1,200. Eleven focused tests passed, including feed failure, filters, detail lookup and last-seven-day filtering; PHP syntax and production build passed.

A review carousel is prepared for up to ten client-approved reviews with six-second looping, previous/next/pause controls, hover/focus pause and reduced-motion support. No testimonials, names or photographs have been invented or published. The review dataset remains empty until genuine client feedback and publication permission are provided.

## Follow-up: deployment asset recovery

The reported red error referenced IpoDetailsPage-BWQn5F3E.js from a previous browser bundle. The default build had removed that file. Production builds now traverse the JavaScript/CSS dependency graphs reachable from the last five deployed entry pages and restore those hashed assets. Older retained archives are not recursively retained forever. Deep application routes revalidate their HTML, and missing assets return 404 instead of the application HTML. Vite preload errors trigger at most one cache-bypassing refresh per minute per tab; offline and blocked-storage cases show a readable recovery screen with manual refresh and home actions. Raw error stacks are no longer rendered publicly.

Production build and focused deployment-recovery/IPO tests passed. Recovery tests check preserving route/query/hash, preventing repeat refreshes, avoiding offline reloads and tolerating unavailable browser storage. The exact reported old chunk and its recent dependency graph are included in the production assets. See Vite's documented load-error handling: https://vite.dev/guide/build.html#load-error-handling .

## Follow-up: approved fictional examples

The owner explicitly approved ten fictional examples with Indian names and illustrated avatars, labelled “Illustrative examples—not actual client reviews.” The existing carousel now contains ten educational planning scenarios written in the third person. The heading is Everyday financial journeys; navigation labels say Examples. The disclosure appears above the carousel, and every slide repeats Fictional example plus Fictional character / illustrated avatar beside the name. Original SVG characters are decorative illustrations, not real-person photos. No ratings, client results or endorsements are asserted. The six-second carousel retains manual previous/next/pause controls, hover/focus pause, and reduced-motion support. Production build passed.

## Follow-up: restore owner-selected original testimonial drafts

At the owner's request, the ten new planning examples have been replaced with only the four original testimonial entries and image paths found in commit 15aa53d (also present in 3fa3bb9 and e90af05): Rajesh Sharma, Ananya Patel, Vikram Mehta and Priya Nair. The original names, role text and quote text are preserved exactly. These predate the latest changes. In view of the owner's statement that genuine reviews are not available, the section and every card clearly label them illustrative testimonial drafts, not actual/verified client reviews. Profile images are identified as illustrative and identities remain unverified. No ratings or independent verification are added. Automatic rotation and accessible controls are preserved.

## Follow-up: original testimonial template

Restored the original horizontal strip of 400px rounded cards, gold decorative stars, italic quotes and 48px circular profile images, using the four unchanged original entries. The strip loops across two matching groups; duplicated content is hidden from assistive technology. Mouse dragging, native touch/keyboard scrolling, hover/focus pause and a manual pause button are included. Reduced motion removes automatic scrolling and the duplicated group. Cards shrink to fit mobile viewports and preserve full quote text. Existing illustrative disclosures remain visible above the strip and within each card. Production build passed.
