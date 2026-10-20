# Responsive audit — 20 October 2026

Framework: React 18, React Router, TypeScript, Vite, Tailwind and shared CSS; GSAP animations.

Routes inspected: /, /v2, /screener, /company/:ticker, /ipo, /ipos, /ipo/:id, /ebooks, /ebooks/:slug, /ebook-admin-vault. The concurrent session also added /admin and /admin/dashboard during this audit. Shared V1Nav/V1Footer, contact/checkout/preview/service/news/legal dialogs, market widgets, calculators, admin login and tables were inspected.

This session preserved the responsive changes already present and corrected mobile menu closing markup; e-book filter/metadata/pricing wrapping; flexible e-book cover height; IPO breadcrumb wrapping and registrar email readability; reusable button touch sizing; admin login duplicate attributes/error output; GSAP helper reduced-motion behavior; V2 mobile illustration flow and newsletter input contrast.

Verification limitations: the working tree is actively being edited by another session (confirmed by user). Initial TypeScript/build/lint attempts encountered incomplete dependencies; dependency repair later failed on registry DNS resolution. Subsequent checks were retried against the changing checkout. Browser attempts to open localhost timed out twice. No viewport or interaction pass is claimed.

Pending visual matrix for every route and representative detail record: widths 320, 375, 390, 768, 1024, 1280 and 1440; portrait and landscape. Confirm page scrollWidth <= clientWidth, navigation/menu/Escape/Tab behavior, focus restoration, dropdowns, filters, form validation, all dialogs including short landscape heights, calculators, tables, fixed/sticky elements, footer, images and reduced-motion behavior. Verify live provider frames and authenticated admin data with the relevant services running.

Final checks: targeted git diff --check passed. TypeScript returned errors in the concurrently edited EbookAdminVaultPage (useSearchParams, setBooks, books unresolved) and a duplicate AdminDashboard search aria-label; this session removed that duplicate. Build/lint sequence was interrupted after bundling stalled. No successful production-build or lint result is claimed.

Release follow-up: production TypeScript + Vite build passed; ESLint passed with zero warnings; isolated API regression passed using AUDIT_SQLITE_BUILTIN=true outside the sandbox. Browser viewport verification remains pending. User authorized deploying all current changes.
