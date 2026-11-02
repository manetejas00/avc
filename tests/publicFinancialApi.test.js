import test from 'node:test';
import assert from 'node:assert/strict';
import { handlePublicApi, quoteFromChart, candlesFromChart } from '../services/publicFinancialApi.js';
import { handleIpoRequest, normalizeIssue } from '../services/ipoFeed.js';
import { validateSubmission } from '../services/submissionValidation.js';

const result = { meta: { symbol:'TCS.NS', regularMarketPrice:110, chartPreviousClose:100, regularMarketTime:1793599200, currency:'INR' }, timestamp:[1793599200,1793685600], indicators:{quote:[{open:[100,null],high:[112,null],low:[99,null],close:[110,null],volume:[20,null]}]} };
const req = path => new Request('https://site.example'+path);
const respond = data => new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});

test('quotes preserve provider times and never fabricate prices for incomplete data', () => {
  const quote=quoteFromChart(result);
  assert.equal(quote.price,110);assert.ok(Math.abs(quote.changePercent-10)<0.0001);
  assert.equal(quote.timestamp,new Date(result.meta.regularMarketTime*1000).toISOString());
  assert.throws(()=>quoteFromChart({meta:{symbol:'TCS.NS'}}));
  assert.equal(candlesFromChart(result).length,1);
});

test('stock quote and raw Yahoo compatibility endpoint validate requested symbol', async () => {
  const fetcher=async()=>respond({chart:{result:[result]}});
  const quote=await handlePublicApi(req('/api/stocks/TCS'),{fetcher});assert.equal(quote.status,200);assert.equal((await quote.json()).symbol,'TCS.NS');
  const raw=await handlePublicApi(req('/api/yahoo.php?symbol=TCS.NS'),{fetcher});assert.ok((await raw.json()).chart);
  const mismatch=await handlePublicApi(req('/api/stocks/INFY'),{fetcher});assert.equal(mismatch.status,404);
});

test('bad symbols and periods fail before contacting any provider', async () => {
  let calls=0;const fetcher=async()=>{calls++;throw new Error('must not call');};
  for(const path of ['/api/yahoo.php?symbol=https://evil.example','/api/yahoo.php?symbol=TCS.NS&range=unbounded','/api/company-data.php?symbol=TCS&exchange=OTHER','/api/mutual-funds.php?code=../../etc'])assert.equal((await handlePublicApi(req(path),{fetcher})).status,400);
  assert.equal(calls,0);
});

test('watchlist returns partial successful results when other symbols fail', async () => {
  const response=await handlePublicApi(req('/api/watchlist.php'),{fetcher:async url=>String(url).includes('TCS.NS')?respond({chart:{result:[result]}}):new Response('',{status:429})});
  assert.equal(response.status,200);const body=await response.json();assert.equal(body.data.length,1);assert.equal(body.data[0].symbol,'TCS.NS');
});

test('scoped fund details and legacy fund responses keep their separate contracts', async () => {
  const data={meta:{scheme_code:119598,scheme_name:'Test Fund'},data:[{date:'02-11-2026',nav:'110'},{date:'02-11-2025',nav:'100'}]};
  const fetcher=async url=>String(url).includes('amfi')?new Response('',{status:503}):respond(data);
  const modern=await(await handlePublicApi(req('/api/mutual-funds/119598'),{fetcher})).json();assert.equal(modern.currentNav,110);assert.ok(Math.abs(modern.performance.return1Y-10)<0.0001);assert.equal(modern.performance.return3Y,null);
  const legacy=await(await handlePublicApi(req('/api/mutual-funds.php?code=119598'),{fetcher})).json();assert.equal(legacy.data.length,2);assert.equal(legacy.amfi.status,'unavailable');
});

test('provider configuration never exposes configured secret values', async () => {
  const response=await handlePublicApi(req('/api/providers/status'),{env:()=> 'test-sensitive-value'});
  const body=await response.text();assert.ok(!body.includes('test-sensitive-value'));assert.ok(body.includes('configured'));
});

test('upstream failures produce uncached JSON errors without provider details', async () => {
  const response=await handlePublicApi(req('/api/crypto/market-snapshot'),{fetcher:async()=>{throw new Error('private-provider-details');}});
  assert.equal(response.status,502);assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(!(await response.text()).includes('private-provider-details'));
});

test('unsupported methods and unknown API paths fail with JSON', async () => {
  assert.equal((await handlePublicApi(new Request('https://site.example/api/watchlist.php',{method:'POST'}))).status,405);
  assert.equal((await handlePublicApi(req('/api/not-an-endpoint'))).status,404);
});

test('IPO terms retain official dates and do not estimate missing terms', () => {
  const row={symbol:'TEST',companyName:'Test Issue',series:'EQ',issueStartDate:'01-Nov-2026',issueEndDate:'04-Nov-2026',priceBand:'Rs 100 - 120'};
  const record=normalizeIssue(row,'2026-11-02T00:00:00Z','2026-11-02');assert.equal(record.status,'open');assert.equal(record.minPrice,100);assert.equal(record.maxPrice,120);assert.equal(record.lotSize,undefined);
  assert.equal(normalizeIssue({...row,issueStartDate:'invalid'},'','2026-11-02'),null);
});

test('IPO API reports a full provider outage as unavailable rather than an empty issue list', async () => {
  const response=await handleIpoRequest(req('/api/ipos.php'),async()=>new Response('',{status:503}));assert.equal(response.status,503);assert.ok((await response.json()).error);
});

test('consultation validation rejects invalid fields and trims accepted text', () => {
  assert.ok(validateSubmission({name:['bad']}).error);
  assert.ok(validateSubmission({name:'Test',email:'invalid',phone:'1234567890'}).error);
  assert.ok(validateSubmission({name:'Test',email:'test@example.com',phone:'1234567890',message:'a'.repeat(5001)}).error);
  const valid=validateSubmission({name:' Test ',email:'test@example.com',phone:'+91 1234567890'});assert.equal(valid.value.name,'Test');assert.equal(valid.value.message,'');
});
