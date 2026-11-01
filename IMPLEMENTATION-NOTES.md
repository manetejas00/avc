# Service-first website update

Implemented: a simpler service-first home page; four service guides with eligibility, documents, costs, risks and next steps; three loan checklists; a callback form with optional email and preferred IST contact time; call/WhatsApp links; a client-help page; a learning centre; goal/SIP/loan calculators; a Resources hub; and a dated mutual-fund search/comparison tool.

The original director photos and their full portrait frames remain. E-books remain behind the Coming Soon overlay, including direct detail links. The home page no longer loads a trading dashboard or waits for the intro animation. Detailed research lives under Resources.

Accuracy: removed unverified business statistics, registrations and testimonials from public navigation/home/footer/metadata. IPO pages now link to official NSE/BSE/SEBI sources and show no unverified issue or subscription figures. Removed sample RSI/P/E fallbacks and direct TradingView scanner requests. TradingView is used through widgets with attribution. Twelve Data output is disabled unless `TWELVE_DATA_PUBLIC_DISPLAY_APPROVED=true` and a key is configured. Alpha Vantage remains optional and has a 25-call rolling daily cap per server process, in addition to its minute limit; separate instances/restarts do not share that counter.

Fund data: `/api/mutual-funds.php` uses MFapi search and full NAV history, cached for one hour server-side and 15 minutes in the browser. Compare up to three schemes. Direct/Regular and Growth/IDCW labels are derived conservatively from the full scheme name. Returns use the latest common NAV date, a calendar anniversary start date (at most seven days earlier), 1Y absolute return and 3Y/5Y actual-day CAGR. IDCW NAV-only returns are suppressed because distributions are not included. Exact start/end dates are shown. A sample scheme (128629) matched AMFI at NAV 25.3486 dated 30-Oct-2026 on the implementation check. This is a sample check, not verification of every scheme or future response.

Callback delivery: Node saves real requests in the existing admin database and includes preferred time in the message. PHP can deliver via hosting mail only when `CALLBACK_TO_EMAIL` and `CALLBACK_FROM_EMAIL` are configured. No delivery address was supplied for this task. Unconfigured delivery returns HTTP 503 and the form offers a WhatsApp draft or call, without claiming receipt. PHP mail acceptance is not proof of inbox delivery. The user must press Send in WhatsApp. Actual team receipt, retention policy, verified business credentials/figures, office hours/photos and genuine review permissions remain owner-dependent and were explicitly skipped by the user.

Validation: TypeScript and production build; focused lint; calculator and NAV unit regressions; isolated SQLite callback persistence, validation and admin retrieval; and `node tests/service-first-browser.cjs` for desktop/mobile routes, overflow, photos, keyboard focus, callback failure/success, optional email/time, checklists, calculators and three-fund comparison. Browser fixtures never send real messages.

Sources checked:
- https://www.mfapi.in/docs/
- https://portal.amfiindia.com/spages/NAVAll.txt
- https://www.tradingview.com/widget/
- https://twelvedata.com/pricing-business
- https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12663&Mode=0
- https://www.nseindia.com/market-data/all-upcoming-issues-ipo
- https://www.sebi.gov.in/filings/public-issues.html
