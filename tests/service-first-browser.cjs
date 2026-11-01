const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'C:/Users/manet/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const server = http.createServer((req, res) => {
    let file = path.resolve('dist', '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(path.resolve('dist') + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.resolve('dist/index.html');
    res.setHeader('Content-Type', ({ '.js': 'application/javascript', '.html': 'text/html', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let submitMode = 'error', submitted;
    const schemes = [ {schemeCode:111111,schemeName:'Fixture Direct Plan Growth'}, {schemeCode:222222,schemeName:'Fixture Regular Plan Growth'}, {schemeCode:333333,schemeName:'Fixture Direct Plan IDCW'} ];
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== base) return route.abort();
      if (url.pathname === '/api/submit-form') { submitted = JSON.parse(route.request().postData()); return route.fulfill({ status: submitMode === 'success' ? 200 : 503, contentType: 'application/json', body: submitMode === 'success' ? '{"success":true}' : '{"error":"Online callback delivery is not available. Please use WhatsApp."}' }); }
      if (url.pathname === '/api/mutual-funds.php' && url.searchParams.get('q') === 'Unavailable') return route.fulfill({status:503,contentType:'application/json',body:'{"error":"Data unavailable"}'});
      if (url.pathname === '/api/mutual-funds.php') { const code = Number(url.searchParams.get('code')); const scheme = schemes.find(s => s.schemeCode === code); return route.fulfill({ contentType: 'application/json', body: JSON.stringify(scheme ? {meta:{scheme_code:code,scheme_name:scheme.schemeName,fund_house:'Fixture house',scheme_category:'Fixture category'},data:[{date:'30-10-2026',nav:'120'},{date:'30-10-2025',nav:'100'},{date:'30-10-2023',nav:'80'},{date:'30-10-2021',nav:'60'}]} : schemes) }); }
      if (url.pathname.startsWith('/api/')) return route.fulfill({status:503,contentType:'application/json',body:'{"error":"Data unavailable"}'});
      return route.continue();
    });
    fs.mkdirSync('audit-results', {recursive:true});
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      for (const route of ['/','/services/investments','/services/loans','/services/insurance','/services/tax','/resources','/mutual-funds','/learn','/client-help','/disclosures','/ipo','/ebooks']) {
        await page.goto(base + route, {waitUntil:'domcontentloaded'});
        await page.locator('main').waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow: ${width} ${route}`);
        assert.equal(await page.locator('h1').count() > 0 || route === '/ebooks', true, `Missing title ${route}`);
        if (route === '/') { await page.locator('img').evaluateAll(images => images.forEach(i => i.loading='eager')); await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0)); assert.equal(await page.locator('.live-market').count(),0); assert.equal(await page.locator('.care-service').count(),4); await page.screenshot({path:`audit-results/service-home-${width}.png`,fullPage:true}); }
      }
      console.log('Routes and overflow passed at',width);
    }
    await page.goto(base+'/services/loans');
    await page.getByRole('button',{name:'Self-employed',exact:true}).click();
    assert.match(await page.locator('.care-checklist').textContent(),/business proof/);
    await page.getByRole('button',{name:'Business',exact:true}).click();
    assert.match(await page.locator('.care-checklist').textContent(),/Entity registration/);
    await page.goto(base+'/');
    await page.getByRole('button',{name:'Open navigation menu'}).click();
    for(let i=0;i<12;i++){ await page.keyboard.press('Tab'); assert.equal(await page.evaluate(()=>!!document.activeElement.closest('.care-mobile-menu')),true); }
    await page.keyboard.press('Escape'); assert.equal(await page.locator('.care-mobile-menu').count(),0);
    await page.getByRole('button',{name:'Book a callback',exact:true}).first().click();
    await page.locator('#contact-name').fill('Browser fixture'); await page.locator('#contact-phone').fill('9876543210');
    await page.locator('#contact-time').selectOption('Weekday morning (10 AM – 12 PM)');
    await page.locator('.care-modal-panel').screenshot({path:'audit-results/callback-mobile.png'});
    await page.getByRole('button',{name:'Send callback request',exact:true}).click(); await page.getByRole('alert').waitFor();
    assert.equal(await page.getByRole('heading',{name:'Request received'}).count(),0);
    assert.match(await page.locator('a[href^="https://wa.me/"]').last().getAttribute('href'),/preferred|Preferred/);
    submitMode='success'; await page.getByRole('button',{name:'Send callback request',exact:true}).click(); await page.getByRole('heading',{name:'Request received'}).waitFor();
    assert.equal(submitted.email,''); assert.equal(submitted.preferredTime,'Weekday morning (10 AM – 12 PM)');
    await page.keyboard.press('Escape');
    await page.locator('#calculators').scrollIntoViewIfNeeded();
    await page.getByLabel('Goal cost today (₹)').fill('120000'); await page.getByLabel('Time in years').fill('1'); await page.getByLabel('Assumed annual return (%)').fill('0'); await page.getByLabel('Assumed annual inflation (%)').fill('0');
    assert.match(await page.locator('.care-result strong').textContent(),/10,000/);
    await page.goto(base+'/mutual-funds'); await page.getByLabel('Search by fund or scheme name').fill('Fixture');
    await page.locator('.care-fund-results li').first().waitFor();
    for(let i=0;i<3;i++){ await page.locator('.care-fund-results button').nth(i).click(); await page.waitForFunction(n=>document.querySelectorAll('.care-fund').length===n,i+1); }
    assert.equal(await page.locator('.care-fund-results button:not([disabled])').count(),0);
    assert.match(await page.locator('.care-fund').first().textContent(),/20.00%/);
    assert.match(await page.locator('.care-fund').nth(2).textContent(),/NAV-only returns are not shown/);
    assert.equal(await page.locator('.care-warning').count(),1);
    await page.screenshot({path:'audit-results/fund-comparison-mobile.png',fullPage:true});
    await page.getByRole('button',{name:'Remove Fixture Regular Plan Growth'}).click(); assert.equal(await page.locator('.care-fund').count(),2);
    await page.getByLabel('Search by fund or scheme name').fill('Unavailable');
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').textContent(),/unavailable/);
    await page.goto(base+'/resources/markets');
    await page.waitForFunction(()=>document.querySelector('.live-market__status')?.textContent.includes('Data unavailable'));
    assert.equal(await page.locator('.live-market__quote').count(),0);
    await page.goto(base+'/company/RELIANCE');
    await page.getByText('Sector comparison unavailable').waitFor();
    assert.equal((await page.locator('main').textContent()).includes('54.2'),false);
    assert.equal((await page.locator('main').textContent()).includes('24.8x'),false);
    assert.deepEqual(errors,[]);
    console.log('Callback failure/success, optional email, preferred time, mobile focus, loan checklists, goal calculation and three-fund comparison passed.');
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
