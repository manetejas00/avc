const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

(async () => {
  let server;
  if (process.env.AUDIT_START_SERVER === 'true') {
    const mime = { '.js': 'application/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg' };
    const dist = path.resolve('dist');
    server = http.createServer(async (request, response) => {
      try {
        const relative = decodeURIComponent(new URL(request.url, 'http://localhost').pathname).replace(/^\/+/, '');
        let file = path.resolve(dist, relative);
        if (!file.startsWith(dist + path.sep)) file = path.join(dist, 'index.html');
        if (!(await fs.stat(file).catch(() => null))?.isFile()) file = path.join(dist, 'index.html');
        response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
        response.end(await fs.readFile(file));
      } catch { response.writeHead(500); response.end('Audit static server error'); }
    });
    await new Promise(resolve => server.listen(5199, '127.0.0.1', resolve));
    console.log('Local production-build audit server ready');
  }
  const output = path.resolve('audit-results');
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const base = process.env.AUDIT_BASE_URL || (server ? 'http://127.0.0.1:5199' : 'http://127.0.0.1:5175');
  const resultPath = path.join(output, process.env.AUDIT_PREVIEW_ONLY === 'true' ? 'browser-preview.json' : process.env.AUDIT_FLOWS_ONLY === 'true' ? 'browser-flows.json' : 'browser.json');
  const errors = [];
  const consoleErrors = [];
  const networkFailures = [];
  const results = [];
  let authenticated = false;
  const submissions = [{ id: 1, name: 'Isolated audit visitor', email: 'audit@example.test', phone: '9876543210', interest: 'General Consultation', message: 'Isolated browser fixture', status: 'pending', created_at: '2026-10-20T00:00:00Z' }];
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text().slice(0,500)); });
  page.on('requestfailed', request => networkFailures.push({ url: request.url(), error: request.failure()?.errorText }));
  // Deterministic offline providers; no payments, messages or live data mutations.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin && route.request().resourceType() === 'stylesheet') return route.fulfill({ contentType: 'text/css', body: '' });
    if (url.origin !== new URL(base).origin && route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#d4af37"/></svg>' });
    if (url.origin !== new URL(base).origin) return route.fulfill({ status: 200, contentType: url.pathname.endsWith('.js') ? 'application/javascript' : 'application/json', body: url.pathname.endsWith('.js') ? '' : '{"data":[]}' });
    if (url.pathname.startsWith('/api/')) {
      const json = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
      if (url.pathname === '/api/submit-form') return json({ success: true });
      if (url.pathname === '/api/admin/login') {
        if (route.request().postDataJSON()?.password === 'browser-fixture-password') { authenticated = true; return json({ success: true }); }
        return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Invalid credentials."}' });
      }
      if (authenticated && url.pathname === '/api/admin/submissions') return json(submissions);
      if (authenticated && /\/api\/admin\/submissions\/1\/status/.test(url.pathname)) { submissions[0].status = route.request().postDataJSON().status; return json({ success: true }); }
      if (authenticated && url.pathname === '/api/admin/sync-logs') return json([]);
      if (authenticated && url.pathname === '/api/admin/ebooks') return json(Array.from({ length: 6 }, () => ({ introduction: 'Isolated audit fixture', chapters: [], conclusion: 'End of test fixture' })));
      if (url.pathname === '/api/admin/logout') { authenticated = false; return json({ success: true }); }
      if (url.pathname.startsWith('/api/admin/')) return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
      if (url.pathname === '/api/ipo/list') return json([]);
      if (url.pathname === '/api/ipo/stats') return json({ total: 0, upcoming: 0, open: 0, closed: 0, listed7Days: 0 });
      if (url.pathname === '/api/ipo/details/audit-fixture' || url.pathname === '/api/ipo/details/audit-missing') return json({ id: 'audit-fixture', symbol: 'AUDIT', name: 'Isolated IPO browser fixture with a deliberately long company name for layout checks', status: 'open', issueType: 'Mainboard', exchanges: ['NSE', 'BSE'], openDate: '2026-10-20', closeDate: '2026-10-23', minPrice: 90, maxPrice: 100, lotSize: url.pathname.endsWith('audit-missing') ? 0 : 20, minInvestment: 2000, companyDescription: 'Isolated test fixture. '.repeat(25), subscription: { total: 2, qib: 1, nii: 2, retail: 3 }, financials: [{ year: 'Test FY', revenueCr: 100, patCr: 10, netWorthCr: 50 }], documents: { drhpUrl: 'https://example.test/document.pdf' } });
      if (url.pathname.includes('/ipo/details/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"IPO not found"}' });
      if (url.pathname === '/api/market/dashboard') return json([{ symbol: '^NSEI', name: 'Audit fixture', price: 100, change: 1, changePercent: 1, currency: 'INR' }]);
      if (url.pathname === '/api/market/chart') return json([{ timestamp: '2026-01-01', value: 99 }, { timestamp: '2026-01-02', value: 100 }]);
      if (url.pathname === '/api/news/live') return json({ data: [{ title: 'Stock market isolated audit story', description: 'Isolated market news fixture for interaction checks.', image_url: base + '/assets/news/news-indian-equities.webp', url: 'https://example.test/article', source: 'Audit fixture' }] });
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Offline audit fixture"}' });
    }
    return route.continue();
  });
  try {
    const service = await fs.readFile('src/services/ebookService.ts', 'utf8');
    const slugs = [...service.matchAll(/slug: '([^']+)'/g)].map(match => match[1]);
    const routes = ['/', '/v2', '/screener', '/screener?search=TCS', '/company/TCS', '/company/M%26M', '/company/%26%26%26%3F', '/ipo', '/ipos', '/ipo/not-a-real-ipo', '/ipo/audit-fixture', '/ipo/audit-missing', '/ebooks', ...slugs.map(slug => '/ebooks/' + slug), '/ebooks/not-a-book', '/admin', '/admin/dashboard', '/ebook-admin-vault?key=admin', '/not-a-page'];
    for (const route of process.env.AUDIT_PREVIEW_ONLY === 'true' ? ['/preview.html', '/'] : process.env.AUDIT_FLOWS_ONLY === 'true' ? [] : routes) {
      for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        await page.locator('h1,h2').first().waitFor({ timeout: 60000 });
        await page.waitForTimeout(150);
        const measurement = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, title: document.title, headings: document.querySelectorAll('h1').length, brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.getAttribute('src')) }));
        results.push({ route, width, ...measurement, overflow: measurement.document > width + 1 });
        if (process.env.AUDIT_SCREENSHOTS === 'true' && (width === 375 || width === 1440)) await page.screenshot({ path: path.join(output, route.replace(/[^a-z0-9]/gi, '_') + '-' + width + '.png'), fullPage: false, animations: 'disabled', timeout: 20000 });
      }
      console.log('Audited', route);
    }
    if (process.env.AUDIT_PREVIEW_ONLY === 'true') {
      assert.deepEqual(results.filter(item => item.overflow || item.brokenImages.length), []);
      assert.deepEqual(errors, []);
      console.log('Standalone preview and populated homepage passed all seven widths.');
      return;
    }
    await page.goto(base + '/admin');
    await page.getByLabel('Email', { exact: true }).fill('audit@example.test');
    await page.getByLabel('Password', { exact: true }).fill('incorrect');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await assert.doesNotReject(() => page.getByRole('alert').filter({ hasText: 'Invalid credentials.' }).waitFor());
    await page.getByLabel('Password', { exact: true }).fill('browser-fixture-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByText('Isolated audit visitor', { exact: true }).waitFor();
    await page.getByRole('combobox', { name: 'Status for Isolated audit visitor' }).selectOption('completed');
    await page.reload();
    await page.getByRole('combobox', { name: 'Status for Isolated audit visitor' }).waitFor();
    assert.equal(await page.getByRole('combobox', { name: 'Status for Isolated audit visitor' }).inputValue(), 'completed');
    await page.getByLabel('Search consultation requests').fill('unmatched-fixture');
    assert.equal(await page.getByText('Isolated audit visitor', { exact: true }).count(), 0);
    await page.goto(base + '/ebook-admin-vault');
    await page.getByRole('button', { name: 'Download Full Edition (HTML/Printable PDF)' }).waitFor();
    await page.goto(base + '/admin/dashboard');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await page.getByRole('heading', { name: 'Admin Login' }).waitFor();
    await page.goto(base + '/ebook-admin-vault?key=admin');
    await page.getByRole('heading', { name: 'Restricted Admin Access' }).waitFor();
    await page.goto(base + '/ebooks');
    await page.getByPlaceholder('Search by title, topic, author, or keyword (e.g. Fundamental, Technical)...').fill('no matching fixture title');
    assert.equal(await page.getByRole('button', { name: 'Sample', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Reset Filters', exact: true }).click();
    await page.getByRole('button', { name: 'Sample', exact: true }).first().waitFor();
    await page.getByRole('link', { name: 'View Details', exact: true }).first().click();
    await page.waitForURL(/\/ebooks\/[^/?]+/);
    await page.reload();
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.goBack();
    await page.waitForURL(/\/ebooks$/);
    await page.getByRole('button', { name: 'Sample', exact: true }).first().click();
    await page.getByRole('button', { name: 'Page 2', exact: true }).first().click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.getByRole('button', { name: /Buy Now/ }).first().click();
    await page.getByLabel('Full Name').fill('Isolated buyer');
    await page.getByLabel('Mobile Number').fill('not-a-phone');
    await page.getByLabel('Email Address').fill('audit@example.test');
    await page.getByRole('button', { name: /Continue to Purchase Assistance/ }).click();
    await page.getByRole('alert').filter({ hasText: 'Valid 10-digit mobile number' }).waitFor();
    await page.getByLabel('Mobile Number').fill('9876543210');
    await page.getByRole('button', { name: /Continue to Purchase Assistance/ }).click();
    await page.getByRole('heading', { name: 'Direct Purchase Assistance' }).waitFor();
    assert.match(await page.getByRole('link', { name: 'Buy via WhatsApp' }).getAttribute('href'), /^https:\/\/wa\.me\//);
    await page.keyboard.press('Escape');
    await page.goto(base + '/');
    await page.getByRole('button', { name: 'Start your financial journey', exact: true }).click();
    await page.getByLabel('Full Name').fill('Audit visitor');
    await page.getByLabel('Email Address').fill('audit@example.test');
    await page.getByLabel('Phone Number').fill('9876543210');
    await page.getByRole('button', { name: 'Schedule Consultation' }).click();
    await page.getByText('Thank You!', { exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    for (const name of ['SIP Calculator', 'Home Loan EMI', 'Lumpsum Investment', 'Retirement Planning']) {
      await page.getByRole('button', { name, exact: true }).click();
      assert.doesNotMatch(await page.locator('.v1-calculator__value').innerText(), /NaN|Infinity/);
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await page.getByRole('button', { name: 'Open navigation menu', exact: true }).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.setViewportSize({ width: 768, height: 375 });
    await page.getByRole('button', { name: 'Start your financial journey', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    for (let index = 0; index < 8; index++) await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').contains(document.activeElement)), true);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Learn more about Investment & Wealth Services', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Read insight', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    assert.equal(await page.getByRole('dialog').locator('a').getAttribute('href'), 'https://example.test/article');
    await page.keyboard.press('Escape');
    await page.locator('.faq-item button').first().click();
    assert.equal(await page.locator('.faq-item button').first().getAttribute('aria-expanded'), 'false');
    await page.getByRole('button', { name: /Read More Questions/ }).click();
    assert.equal(await page.locator('.faq-item').count(), 18);
    await page.getByRole('button', { name: 'Show Less Questions', exact: true }).click();
    assert.equal(await page.locator('.faq-item').count(), 4);
    await page.getByRole('link', { name: 'Privacy Policy', exact: true }).click();
    await page.getByRole('dialog').waitFor();
    await page.keyboard.press('Escape');
    await page.goto(base + '/ipo/audit-fixture');
    await page.getByRole('slider', { name: 'Number of lots' }).focus();
    await page.keyboard.press('End');
    assert.equal(await page.getByRole('slider', { name: 'Number of lots' }).inputValue(), '100');
    assert.equal(await page.getByRole('button', { name: 'Increase lots', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: 'sHNI (₹2L - ₹10L)', exact: true }).click();
    assert.equal(await page.getByRole('slider', { name: 'Number of lots' }).inputValue(), '101');
    await page.getByRole('slider', { name: 'Number of lots' }).focus();
    await page.keyboard.press('End');
    assert.equal(await page.getByRole('button', { name: 'Increase lots', exact: true }).isDisabled(), true);
    await page.goto(base + '/ipo/audit-missing');
    await page.getByText('The source price and lot size do not support a calculation for the displayed investor categories.', { exact: true }).waitFor();
    await fs.writeFile(resultPath, JSON.stringify({ results, errors, consoleErrors, networkFailures }, null, 2));
    assert.deepEqual(errors, []);
    assert.deepEqual(results.filter(item => item.overflow), []);
    assert.deepEqual(results.filter(item => item.brokenImages.length), []);
    console.log(`Browser audit passed: ${results.length} route/viewport combinations plus login, consultation and Escape flows.`);
  } finally {
    await fs.writeFile(resultPath, JSON.stringify({ results, errors, consoleErrors, networkFailures }, null, 2));
    await browser.close();
    if (server) server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
