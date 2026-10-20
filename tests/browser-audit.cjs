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
  const errors = [];
  const results = [];
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(60000);
  page.on('pageerror', error => errors.push(error.message));
  // Deterministic offline providers; no payments, messages or live data mutations.
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin && route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#d4af37"/></svg>' });
    if (url.origin !== new URL(base).origin) return route.fulfill({ status: 200, contentType: url.pathname.endsWith('.js') ? 'application/javascript' : 'application/json', body: url.pathname.endsWith('.js') ? '' : '{"data":[]}' });
    if (url.pathname.startsWith('/api/')) {
      const json = data => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
      if (url.pathname === '/api/submit-form') return json({ success: true });
      if (url.pathname === '/api/admin/login') return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Invalid credentials."}' });
      if (url.pathname.startsWith('/api/admin/')) return route.fulfill({ status: 401, contentType: 'application/json', body: '{"error":"Unauthorized"}' });
      if (url.pathname === '/api/ipo/list') return json([]);
      if (url.pathname === '/api/ipo/stats') return json({ total: 0, upcoming: 0, open: 0, closed: 0, listed7Days: 0 });
      if (url.pathname.includes('/ipo/details/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"IPO not found"}' });
      if (url.pathname === '/api/market/dashboard') return json([{ symbol: '^NSEI', name: 'Audit fixture', price: 100, change: 1, changePercent: 1, currency: 'INR' }]);
      if (url.pathname === '/api/market/chart') return json([{ timestamp: '2026-01-01', value: 99 }, { timestamp: '2026-01-02', value: 100 }]);
      if (url.pathname === '/api/news/live') return json({ data: [] });
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Offline audit fixture"}' });
    }
    return route.continue();
  });
  try {
    const service = await fs.readFile('src/services/ebookService.ts', 'utf8');
    const slugs = [...service.matchAll(/slug: '([^']+)'/g)].map(match => match[1]);
    const routes = ['/', '/v2', '/screener', '/screener?search=TCS', '/company/TCS', '/ipo', '/ipos', '/ipo/not-a-real-ipo', '/ebooks', ...slugs.map(slug => '/ebooks/' + slug), '/ebooks/not-a-book', '/admin', '/admin/dashboard', '/ebook-admin-vault?key=admin', '/not-a-page'];
    for (const route of routes) {
      for (const width of [320, 375, 390, 768, 1024, 1280, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(base + route, { waitUntil: 'domcontentloaded' });
        await page.locator('h1,h2').first().waitFor({ timeout: 60000 });
        await page.waitForTimeout(150);
        const measurement = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, title: document.title, headings: document.querySelectorAll('h1').length, brokenImages: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.getAttribute('src')) }));
        results.push({ route, width, ...measurement, overflow: measurement.document > width + 1 });
        if (width === 375 || width === 1440) await page.screenshot({ path: path.join(output, route.replace(/[^a-z0-9]/gi, '_') + '-' + width + '.png'), fullPage: true });
      }
      console.log('Audited', route);
    }
    await page.goto(base + '/admin');
    await page.getByLabel('Email', { exact: true }).fill('audit@example.test');
    await page.getByLabel('Password', { exact: true }).fill('incorrect');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await assert.doesNotReject(() => page.getByRole('alert').filter({ hasText: 'Invalid credentials.' }).waitFor());
    await page.goto(base + '/');
    await page.getByRole('button', { name: 'Start your financial journey' }).click();
    await page.getByLabel('Full Name').fill('Audit visitor');
    await page.getByLabel('Email Address').fill('audit@example.test');
    await page.getByLabel('Phone Number').fill('9876543210');
    await page.getByRole('button', { name: 'Schedule Consultation' }).click();
    await page.getByText('Thank You!', { exact: true }).waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await fs.writeFile(path.join(output, 'browser.json'), JSON.stringify({ results, errors }, null, 2));
    assert.deepEqual(errors, []);
    assert.deepEqual(results.filter(item => item.overflow), []);
    assert.deepEqual(results.filter(item => item.brokenImages.length), []);
    console.log(`Browser audit passed: ${results.length} route/viewport combinations plus login, consultation and Escape flows.`);
  } finally {
    await fs.writeFile(path.join(output, 'browser.json'), JSON.stringify({ results, errors }, null, 2));
    await browser.close();
    if (server) server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
