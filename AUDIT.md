# Website audit — 20 October 2026

This audit changes the existing React/Vite and Express/SQLite implementation. No production deployment, real database migration run, credential rotation, payment, email, SMS or message delivery was performed. Existing uncommitted changes and work from a concurrent responsive-audit session were preserved. `RESPONSIVE-AUDIT.md` belongs to that session; its deployment authorizations and results are separate.

## Inventory and scope

Source inventory: 46 TSX files, 97 button declarations and six form declarations, including legacy components not mounted by the current router. The generated `audit-results/source-inventory.json` records component imports and 265 individual control declarations with file/line and source markup. The router, public PHP proxies, Express endpoints, SQLite schema, provider integrations, environment example and deployment instructions were inspected.

Routes: `/`, `/v2`, `/screener` (search and company query variants), `/company/:ticker`, `/ipo`, `/ipos`, `/ipo/:id`, `/ebooks`, all six `/ebooks/:slug` records, `/ebook-admin-vault`, `/admin`, `/admin/dashboard`, invalid route and missing-record states. Shared flows include navigation/mobile menu, service/news/legal dialogs, FAQ, four calculators, consultation form, e-book category/difficulty/search filters, preview pages, purchase assistance, dashboard search/status/logout and protected vault downloads.

## Checklist

Statuses distinguish executable verification from source inspection. A source fix alone is not a browser pass.

| Item | Status and evidence |
| --- | --- |
| Framework, route and dependency inventory | Verified by source inspection; React 18, TypeScript, Vite, Tailwind, GSAP, Express 5 and SQLite. |
| Existing project instructions | Root/parent instruction files searched; deployment instructions read before edits. |
| Consultation persistence | Fixed fake timed success; form now POSTs to the existing API and reports real errors. API insert/read/restart persistence passed using an isolated SQLite database and test-only driver adapter. |
| Form validation | Server rejects missing, non-text, whitespace-only, invalid email/phone and oversized values; boundary cases passed. Client field limits match server limits. |
| Duplicate submissions/loading | Existing submit-disabled state retained, submit guard added. Does not impose uniqueness on legitimate repeated consultations. |
| Admin routes and errors | Fixed missing routes, removed published demo credentials, associated labels, added visible login/dashboard errors and retry. Focused browser login, error, unauthorized redirect, search, status refresh and logout checks passed. |
| Admin data/status/search | Status allowlist and record-not-found checks passed. Dashboard status requests check success, prevent concurrent updates and refresh; search now filters rows. |
| Admin authentication | Unauthorized requests and forged query-key access rejected. Login, invalid credentials, cookie flags, logout, rate limiting and preserved credentials across restart passed. |
| Startup password reset | Removed default account creation and repeated password overwrites; existing admin passwords remain unchanged. Regression passed. |
| JWT configuration | Removed known fallback secret; production requires a secret of at least 32 characters. Development uses a random ephemeral secret. |
| CSRF/input/error handling | Cross-origin writes rejected; bounded body parsing and JSON errors added; malformed JSON/query inputs tested. Parameterized SQL retained. |
| Private e-book content | Moved six full-book bodies from public client data to `services/ebookContent.js`; authenticated, no-store endpoint serves them. Removed client/query-string key authorization. API access tests passed. |
| Public e-book previews/catalogue | Existing public metadata and two-page samples retained. Full-book data no longer ships in the public service module. |
| Checkout | Preserved existing call/WhatsApp assistance; strengthened validation and removed misleading secure-payment/instant-delivery wording. No payment gateway or order-fulfillment backend exists. |
| IPO data integrity | Removed fabricated fallback listings, shifting dates, invented financials/subscription/registrar values and first-record substitution for invalid IDs. Empty arrays remain empty. Focused regression tests passed. |
| IPO source/status/cache | Provider keys moved server-side; group status preserved when absent on individual records; concurrent backend aggregation coalesced. Live provider verification blocked. |
| Crypto cache | Fixed double normalization of already normalized cached records. Fresh-cache, stale-cache and no-extra-provider-call regression passed. |
| Market chart/time/search | Fixed selected-market fallback history, stale interval callback, missing INR chart allowlist, Yahoo timestamp conversion and empty dashboard success. Added query limits and mutual-fund request timeouts. Live provider checks blocked. |
| News/cache | Existing news invalidation tested against SQLite. Removed browser-exposed Marketaux credential and early client-key prerequisite; PHP uses server environment. Live ingestion remains blocked. |
| Routing/refresh/invalid URLs | Missing admin routes restored; visible not-found page replaces silent home redirect; unknown API paths return JSON 404; missing assets and unknown Express routes return 404. Hash navigation respects section targets. |
| `/v2` assets | Imported AVIF files through Vite so production emits the assets; fixed mobile Support anchor. |
| Build/performance | Production TypeScript + Vite build passed. Route code splitting reduced the main JS chunk from approximately 569 KB to 386 KB; final TypeScript/Vite build passed after source edits. |
| Lint | ESLint passed with zero warnings after TypeScript-aware unused-variable rules and real unused imports/effect dependencies were corrected. |
| Responsive layouts/accessibility | Existing concurrent responsive fixes preserved. The browser matrix and focused interactions passed as detailed below; screenshot review remains blocked. Screenshot capture timed out and is separately blocked. |
| Reduced motion | Existing route/component reduced-motion guards inspected. Browser tests request reduced motion. FAQ toggle/show-all and scroll animations now respect that preference. Normal-motion animation visual QA remains blocked until reliable screenshot capture. |
| SEO | Per-route canonical URL, initial title/description reset, private/prototype noindex and staging/private response headers added; original canonical brand domain retained. Existing sitemap/robots inspected. Decorative duplicate e-book headings were corrected; company detail titles are route-specific. |
| Deployment/source exposure | Corrected documented requirement for an Express backend. Apache blocks source/secrets/database/archive paths and directory listing. Native Apache/PHP configuration cannot be executed here. |
| Tracked secrets/archive | `.env` and stale `dist.zip` removed from Git index, retained locally and ignored. No credentials changed. Git history and old copies remain an owner-managed remediation item. |
| User-specific ownership | Only administrator-owned management endpoints exist; no ordinary customer accounts or per-customer CRUD implementation was found. Not applicable to add unrequested account features. |
| Register/reset/upload/delete flows | No implemented customer registration, password reset, upload or delete endpoints in current application. Not applicable; no such unrelated features added. |
| Private/admin indexing | Client noindex and Express/Apache response headers added; authentication remains the access control. |

## Explicit blockers and remaining limitations

- The installed `better-sqlite3` package lacks its native binary for the available Node 24 runtime. Normal backend startup cannot be certified. API regression uses Node's real SQLite through the explicitly opt-in **test-only** adapter; production still uses `better-sqlite3`.
- Dependency repair was attempted and failed with registry DNS/metadata errors. Original dependencies were restored; no dependency-version upgrade is claimed.
- Browser external providers are mocked: TradingView widgets/scanner/dividends, Yahoo, Indian API, Marketaux and external image/font services have not been certified live. No production API keys, customer data or real side effects were used.
- Edge screenshot capture timed out. Programmatic browser/layout results must not be described as a visual screenshot review. Portrait/landscape modal behavior and all animated states require successful visual QA where not explicitly covered by the browser runner.
- `/v2` remains an existing Ork prototype with placeholder registration/login, pricing and blog destinations, a no-op newsletter form and unrelated FAQ copy. No corresponding product, account or subscription backend exists. Completing these product flows requires approved business/content requirements; content/branding were not invented or replaced.
- E-books have no implemented online payment or automatic fulfillment service. Existing assistance links can be inspected without sending a WhatsApp message or placing a call; actual purchase/delivery remains outside local verification.
- Admin submissions are currently returned as one array; large-dataset pagination and multi-instance rate-limit storage remain source-identified scalability limitations. Existing small-data business behavior was preserved.
- Apache/PHP runtime, cURL, reverse-proxy HTTPS/Host handling, production backups and actual hosting were not exercised. Static-only hosting cannot support consultation persistence, admin authentication or private vault access; use the documented Node backend.
- Previously exposed keys/default passwords may remain in Git history, old archives or an existing database. Rotation/history remediation requires the owner's action; this audit intentionally did not change credentials or delete real records.

## Verification runs

- Production TypeScript/Vite build: passed; main JS 386.40 KB (gzip 130.11 KB), with separate route chunks.
- ESLint: passed, zero warnings.
- Sequential isolated regression suite: **3 tests passed, 0 failed**, covering HTTP/auth/persistence, IPO integrity and crypto/news cache behavior. Earlier attempts exposed sandbox localhost restrictions and a parallel-run connection reset; the sequential rerun passed. Command: `node --test --test-concurrency=1 tests/api.test.js tests/ipo.test.js tests/services.test.js` with `AUDIT_SQLITE_BUILTIN=true`.
- Browser matrix: **168 route/viewport checks across 24 route variants passed** at 320, 375, 390, 768, 1024, 1280 and 1440 pixels. No document horizontal overflow, broken local images or uncaught page errors were detected with external-provider fixtures. Populated/missing-data IPO fixtures and special/invalid company tickers are included. The expanded interaction rerun passed after correcting the duplicate e-book h1. Evidence: `audit-results/browser.json`. A separate 14-check run passed for `/preview.html` and the homepage with populated news fixtures (`audit-results/browser-preview.json`), covering all seven widths. That gives 25 distinct route/page variants and 175 unique route/width combinations. No screenshot pass is claimed.

- Focused browser flow suite: **passed**. Covers invalid/successful login, dashboard status persistence after refresh and search, logout, authenticated/denied vault, e-book search/reset, details/direct refresh/back, preview page switching, checkout invalid/valid input and assistance link, consultation success, four calculators, mobile menu Escape, landscape focus containment, service/news/privacy dialogs, FAQ show-more/show-less and reduced motion, IPO category boundaries and missing lot-size behavior. External services and data are fixtures; no calls/messages/payments are sent. Evidence: `audit-results/browser-flows.json`.
- Final homepage/preview diagnostics: no console errors or failed network requests under the fixture setup.
- Public bundle scan: known old password/vault-key/provider-key markers and a protected full-book introduction were absent from all emitted client JS chunks.

## Changed files

Backend/security: `server.js`, `services/crypto.js`, `services/market.js`, `services/ipo.js`, new `services/ebookContent.js`.

Frontend: `src/App.tsx`, admin login/dashboard, consultation and e-book checkout, vault, IPO service, e-book service, API client, live market overview, home news loading, screener query synchronization, and V2 asset imports. IPO calculator bounds now follow the displayed category limits and avoid calculations with missing values; company ticker sanitization preserves ampersands. Additional small unused-import/effect fixes touch the catalogue/detail/legacy components listed by `git diff`.

Configuration/documentation/tests: `.env.example`, `.gitignore`, `.eslintrc.cjs`, `.htaccess`, `public/.htaccess`, PHP Indian API/Marketaux proxies, `vite.config.ts`, `package.json`, `DEPLOYMENT.md`, this report and `tests/`. The standalone branding preview also received viewport/language/noindex metadata. Its content is preserved. Build output in `dist/` is regenerated. `.env` and `dist.zip` were removed from version control while their local files remain. Concurrent Git activity may already include earlier audit changes in commits. Existing/concurrent responsive edits to shared CSS/components are separate and preserved.
