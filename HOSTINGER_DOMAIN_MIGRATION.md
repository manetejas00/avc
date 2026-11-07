# Hostinger Domain Migration & Replacement Guide
**AVC Dhanam Solutions Pvt. Ltd.**

- **Current Domain:** `test1.avinyacarefoundation.org`
- **New Primary Domain:** `avcdhanam.com`
- **Hosting Provider:** Hostinger
- **Target Server IP:** `82.112.239.95`
- **SSH Port:** `65002` | **User:** `u382139760`
- **Migration Strategy:** Domain Replacement & Permanent 301 Redirect (Zero Rebuild, 100% Data & Code Preservation)

---

## 1. Executive Summary & Safety Policy

This document provides the complete, authoritative operational plan to migrate and replace the existing test subdomain (`test1.avinyacarefoundation.org`) with the new primary brand domain (`avcdhanam.com`) on Hostinger.

### Key Principles
1. **Zero Rebuild:** The existing React/TypeScript Vite application, Express backend, SQLite database (`data/avc.sqlite`), PHP proxy scripts, and styling are preserved completely intact.
2. **Domain Isolation:** Only `test1.avinyacarefoundation.org` is redirected to `https://avcdhanam.com`. The parent domain `avinyacarefoundation.org` and other subdomains are **not** redirected or modified.
3. **Continuous Availability:** The legacy domain remains active on DNS and web server routing throughout the transition to serve permanent HTTP 301 redirects to avoid broken backlinks, bookmarks, or search rankings.
4. **Data Integrity:** Database files (`data/avc.sqlite`), uploaded media, `.env` secrets, and hosting configs are backed up and verified with cryptographic checksums prior to any DNS or hosting modifications.

---

## 2. Pre-Migration Checklist

Complete all checklist items before making changes in Hostinger hPanel or DNS registrar:

- [ ] **Files Backup:** Full compressed archive of the project repository, `public_html`, and `dist/`.
- [ ] **Database Backup:** Safe snapshot of `data/avc.sqlite` (and WAL/SHM files) using SQLite backup commands; export of MySQL database if MySQL is utilized on the host.
- [ ] **Environment Files Backup:** Secure offline backup of `.env`, `.env.production`, and server configuration files.
- [ ] **DNS Records Audit:** Record current A, CNAME, MX, and TXT records for both `avinyacarefoundation.org` and `avcdhanam.com`.
- [ ] **SSL Readiness:** Confirm domain ownership of `avcdhanam.com` and availability of Hostinger Free Lifetime SSL.
- [ ] **Integrations Audit:** Document all external services (Google Search Console, Google Analytics, WhatsApp API links, Email/SMTP, Financial APIs).
- [ ] **Backup Verification:** Verify that backup archives are valid, non-empty, and can be extracted cleanly.

---

## 3. Backup Procedure

### Automated Backup via Provided Scripts

#### Option A: Server-Side Backup (Hostinger SSH / Terminal)
Connect to your Hostinger server via SSH and execute the included backup script:
```bash
ssh -p 65002 u382139760@82.112.239.95
cd /home/u382139760/domains/test1.avinyacarefoundation.org
bash scripts/backup.sh
```
This script automatically:
1. Creates a timestamped directory at `~/backups/pre_migration_<timestamp>/`.
2. Backs up `.env`, `.env.production`, and `.htaccess` files.
3. Safely backs up SQLite database (`avc.sqlite`) with consistent WAL flushing.
4. Exports MySQL databases if environment credentials exist.
5. Generates a compressed tarball of all website files.
6. Computes SHA256 checksums of all backup artifacts.

#### Option B: Local Machine Backup (PowerShell)
From your local project workspace:
```powershell
.\scripts\backup.ps1 -DestinationDir "..\backups"
```

### Manual Hostinger hPanel Backup Steps
1. Log in to **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Go to **Websites** -> Find `test1.avinyacarefoundation.org` -> Click **Manage**.
3. Under **Files**, click **Backups**.
4. Click **Generate new backup** -> Select **Website Files** and **Databases**.
5. Once generated, click **Download all files** and **Download database**.
6. Store backups in a secure, encrypted offline location.

---

## 4. Hostinger Domain Replacement Procedure

Hostinger hPanel offers two reliable approaches depending on your hosting plan tier:

### Approach A: Change Main Domain (Primary Recommended Method)
If your Hostinger plan allows direct main domain modification:
1. Open **Hostinger hPanel** -> **Websites** -> Click **Manage** on `test1.avinyacarefoundation.org`.
2. In the left navigation menu, expand **Domain** or **Account Details**.
3. Click **Change Domain** (or **Change Main Domain**).
4. Select or enter `avcdhanam.com`.
5. Review the confirmation dialog: Hostinger will re-associate the existing `public_html` directory, databases, and FTP/SSH user with `avcdhanam.com`.
6. Click **Confirm**.

### Approach B: Domain Alias / Parked Domain (Safest Alternative Method)
If direct domain change is not permitted or if you wish to maintain `test1.avinyacarefoundation.org` side-by-side with zero downtime:
1. Go to **Websites** -> **Add Website** or **Domains** -> **Parked Domains (Domain Aliases)**.
2. Add `avcdhanam.com` as a parked domain / alias pointed to the existing document root (`public_html` / `public_html/dist`).
3. If creating a new website entry:
   - Add `avcdhanam.com` under your hosting plan.
   - Configure Git Auto-Deploy pointing to repository `manetejas00/avc`, branch `main`.
   - Set the **Document Root** in hPanel to `public_html/dist` (or keep root with our root `.htaccess` mapping).
   - Copy the database `data/avc.sqlite` to the new directory:
     ```bash
     mkdir -p /home/u382139760/domains/avcdhanam.com/data
     cp -p /home/u382139760/domains/test1.avinyacarefoundation.org/data/avc.sqlite* /home/u382139760/domains/avcdhanam.com/data/
     ```
   - Keep the old website entry `test1.avinyacarefoundation.org` alive with our 301 redirection `.htaccess` active.

---

## 5. DNS Configuration

Point `avcdhanam.com` to Hostinger using the following DNS records:

### Nameservers (If using Hostinger Nameservers)
```text
ns1.dns-parking.com
ns2.dns-parking.com
```

### DNS Zone Records (If managing DNS at registrar / Cloudflare / Route 53)
| Type | Name | Content / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (root) | `82.112.239.95` | 3600 (or Auto) | Points primary domain to Hostinger |
| **CNAME** | `www` | `avcdhanam.com.` | 3600 (or Auto) | Points www to root domain |
| **MX** | `@` | `mx1.hostinger.com` (Priority 5) | 3600 | Hostinger Business Email |
| **MX** | `@` | `mx2.hostinger.com` (Priority 10) | 3600 | Hostinger Business Email |
| **TXT** | `@` | `v=spf1 include:_spf.mail.hostinger.com ~all` | 3600 | Email SPF authorization |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; sp=none; rua=mailto:support@avcdhanam.com` | 3600 | Email DMARC policy |

### Legacy Domain DNS Records
| Type | Name | Content / Value | TTL | Note |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `test1` | `82.112.239.95` | 3600 | **Keep Active!** Routes legacy traffic to 301 redirect |

> [!IMPORTANT]
> Do NOT touch or delete existing DNS records for the main `avinyacarefoundation.org` website or other subdomains. Only `test1` points to this project.

---

## 6. SSL & HTTPS Configuration

1. In **Hostinger hPanel**, navigate to **Security** -> **SSL**.
2. Locate `avcdhanam.com` and `www.avcdhanam.com`.
3. Click **Install SSL** (Let's Encrypt Free Lifetime SSL).
4. Once active (status shows **Active** in green), toggle **Force HTTPS** ON.
5. Ensure SSL is also kept active on `test1.avinyacarefoundation.org` so browsers can establish a secure connection before receiving the 301 redirect (preventing browser SSL warning screens).

---

## 7. Application Configuration & Code Changes

The project has been fully updated for `avcdhanam.com`:

### 1. Web Server Redirection (`.htaccess`, `public/.htaccess`, `dist/.htaccess`)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Permanent 301 Redirect: test1.avinyacarefoundation.org -> https://avcdhanam.com (preserves path & query)
  RewriteCond %{HTTP_HOST} ^test1\.avinyacarefoundation\.org$ [NC]
  RewriteRule ^(.*)$ https://avcdhanam.com/$1 [R=301,L,QSA]

  # 2. Canonical HTTPS & non-www enforcement for avcdhanam.com
  RewriteCond %{HTTP_HOST} ^www\.avcdhanam\.com$ [NC]
  RewriteRule ^(.*)$ https://avcdhanam.com/$1 [R=301,L,QSA]

  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP_HOST} ^(www\.)?avcdhanam\.com$ [NC]
  RewriteRule ^(.*)$ https://avcdhanam.com/$1 [R=301,L,QSA]
  ...
```

### 2. Node.js / Express Backend (`server.js`)
```javascript
// Permanent 301 Redirect for legacy domain and non-canonical hosts
app.use((req, res, next) => {
  const host = (req.hostname || req.get('host') || '').toLowerCase().split(':')[0];
  if (host === 'test1.avinyacarefoundation.org' || host === 'www.avcdhanam.com') {
    return res.redirect(301, `https://avcdhanam.com${req.originalUrl}`);
  }
  if (/^\/(admin(?:\/|$)|ebook-admin-vault(?:\/|$)|v2(?:\/|$))/.test(req.path) || /^test1\./i.test(req.hostname)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});
```

### 3. Frontend & SEO Metadata Verification
- `index.html`:
  - `<link rel="canonical" href="https://avcdhanam.com" />`
  - `<meta property="og:url" content="https://avcdhanam.com" />`
  - `<meta property="og:image" content="https://avcdhanam.com/logo.jpg" />`
- `src/App.tsx`:
  - Dynamic canonical tag updating: `const canonical = 'https://avcdhanam.com' + (pathname === '/ipos' ? '/ipo' : pathname);`
- `public/sitemap.xml`:
  - All 16 public URLs listed under `https://avcdhanam.com/`.
- `public/robots.txt`:
  - `Sitemap: https://avcdhanam.com/sitemap.xml`.

### 4. Laravel Reference Configuration (For companion services or future migrations)
If any companion service utilizes Laravel:
- Update `.env`: `APP_URL=https://avcdhanam.com`
- Update `config/cors.php`: `'allowed_origins' => ['https://avcdhanam.com']`
- Update `config/session.php`: `'domain' => '.avcdhanam.com'`
- Clear and rebuild caches:
  ```bash
  php artisan config:clear
  php artisan cache:clear
  php artisan route:clear
  php artisan view:clear
  php artisan optimize
  ```

---

## 8. Deployment Commands

### Method 1: Git Auto-Deploy (Hostinger hPanel)
1. Commit and push repository updates:
   ```bash
   git add .
   git commit -m "Configure 301 domain redirect from test1 to avcdhanam.com"
   git push origin main
   ```
2. In Hostinger hPanel -> **Advanced** -> **Git**:
   - Ensure repository is set to `manetejas00/avc`, branch `main`.
   - Click **Deploy** (or trigger Webhook).

### Method 2: Direct SSH / SCP Upload
If uploading compiled files directly:
```bash
npm run build
scp -P 65002 -r dist/* u382139760@82.112.239.95:/home/u382139760/domains/avcdhanam.com/public_html/
```

---

## 9. Integrations Verification

| Service | Action Required | Status |
| :--- | :--- | :--- |
| **Google Search Console** | Add property `https://avcdhanam.com`, submit sitemap `https://avcdhanam.com/sitemap.xml`, and initiate Change of Address tool from `test1.avinyacarefoundation.org`. | Pending User Action |
| **Google Analytics** | Update Web Data Stream URL to `https://avcdhanam.com`. | Pending User Action |
| **Sitemap & Robots** | Verified in codebase pointing to `https://avcdhanam.com/sitemap.xml`. | Ready |
| **Email & SMTP** | Ensure `CALLBACK_TO_EMAIL` and `CALLBACK_FROM_EMAIL` (e.g., `support@avcdhanam.com`) are configured in `.env`. | Ready |
| **WhatsApp Chat** | Verified: Links point to `https://wa.me/917030247878` with pre-filled message. | Ready |
| **Financial APIs** | Verify provider domain origin whitelisting for Twelve Data, IndianAPI, Marketaux, MFAPI. | Ready |

---

## 10. Complete Website Testing & Verification

Run the automated verification script from your terminal:

### PowerShell Verification
```powershell
.\scripts\verify-migration.ps1 -PrimaryDomain "avcdhanam.com" -LegacyDomain "test1.avinyacarefoundation.org"
```

### Bash / cURL Verification
```bash
bash scripts/verify-migration.sh
```

### Manual Verification Matrix
| Test Case | Expected Result | Checked |
| :--- | :--- | :---: |
| `http://test1.avinyacarefoundation.org/` | 301 Redirect to `https://avcdhanam.com/` | [ ] |
| `https://test1.avinyacarefoundation.org/services/investments` | 301 Redirect to `https://avcdhanam.com/services/investments` | [ ] |
| `https://test1.avinyacarefoundation.org/resources?tab=calc` | 301 Redirect to `https://avcdhanam.com/resources?tab=calc` | [ ] |
| `http://avcdhanam.com/` | 301 Redirect to `https://avcdhanam.com/` | [ ] |
| `https://www.avcdhanam.com/` | 301 Redirect to `https://avcdhanam.com/` | [ ] |
| `https://avcdhanam.com/` | HTTP 200, valid SSL certificate, loads Vite React app | [ ] |
| Service Pages (`/services/investments`, `loans`, `insurance`, `tax`) | HTTP 200, guides display correctly without 404 | [ ] |
| Form Submissions (`/api/submit-form`) | Callback modal posts successfully; rate limiting operational | [ ] |
| Admin Dashboard (`/admin`, `/admin/dashboard`) | Displays login, authenticates admin, sends `noindex, nofollow` headers | [ ] |
| Mutual Fund Explorer (`/mutual-funds`) | Live NAV and fund queries resolve via proxy | [ ] |
| Responsive Layout | Validated at mobile (390px), tablet (768px), desktop (1440px) viewports | [ ] |

---

## 11. Rollback Procedure

In the unlikely event that DNS or hosting issues require rolling back:

1. **DNS Reversion:**
   - Keep `avcdhanam.com` A record or revert to previous nameservers.
   - Confirm `test1.avinyacarefoundation.org` continues pointing to `82.112.239.95`.
2. **Web Server Reversion:**
   - Restore the `.htaccess` backup:
     ```bash
     cp ~/backups/pre_migration_<timestamp>/configs/.htaccess.root.backup .htaccess
     cp ~/backups/pre_migration_<timestamp>/configs/.htaccess.public.backup public/.htaccess
     cp ~/backups/pre_migration_<timestamp>/configs/.htaccess.public.backup dist/.htaccess
     ```
3. **Database Reversion:**
   - Restore `data/avc.sqlite` from `~/backups/pre_migration_<timestamp>/database/`.
4. **Git Reversion:**
   - Check out previous commit `git checkout HEAD~1`.

---

## 12. Troubleshooting Guide

### 1. SSL Certificate Error / "Not Secure" Warning
- **Cause:** DNS propagation delay or Let's Encrypt rate-limiting during domain propagation.
- **Fix:** In Hostinger hPanel -> **Security** -> **SSL**, click **Reinstall SSL**. Ensure DNS A record `@` strictly resolves to `82.112.239.95` without proxy interference before requesting SSL.

### 2. Redirect Loop (Too Many Redirects)
- **Cause:** Cloudflare / CDN configured with Flexible SSL while Hostinger enforces Full HTTPS, or conflicting rewrite rules.
- **Fix:** Ensure Cloudflare SSL mode is set to **Full (Strict)**. Ensure the `.htaccess` rule uses `RewriteCond %{HTTPS} off` rather than rewriting unconditionally.

### 3. Direct Sub-Page Access Returns 404
- **Cause:** Apache rewrite engine not forwarding SPA client-side routes to `dist/index.html`.
- **Fix:** Verify `mod_rewrite.c` block in `.htaccess` contains `RewriteRule . dist/index.html [L]` (or `RewriteRule . index.html [L]` if document root is `dist`).

### 4. Git Deployment Root Mismatch
- **Cause:** Git clones to `public_html` while built files live in `public_html/dist`.
- **Fix:** Either keep our root `.htaccess` (which proxies root requests into `dist/`), OR set Document Root in hPanel to `public_html/dist`.
