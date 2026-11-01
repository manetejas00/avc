import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiled = ts.transpileModule(readFileSync(new URL('../src/utils/yahooQuote.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
new Function('exports', compiled)(exports);
const { parseYahooQuote } = exports;
const meta = { regularMarketPrice: 23053.1, regularMarketTime: 1793354471, gmtoffset: 19800, chartPreviousClose: 24317.15 };
test('uses session change instead of the three-month chart baseline', () => {
 const q = parseYahooQuote('^NSEI', { meta: { ...meta, fulldayChange: 116.35 } });
 assert.equal(q.change, 116.35);
 assert.ok(Math.abs(q.changePercent - 0.50727) < 0.001);
 assert.equal(q.lastUpdated, new Date(meta.regularMarketTime * 1000).toISOString());
});
test('derives previous session close from history, ignoring current-session bar', () => {
 const q = parseYahooQuote('^NSEI', { meta, timestamp: [1793268000, meta.regularMarketTime], indicators: { quote: [{ close: [22936.75, 23053.1] }] } });
 assert.ok(Math.abs(q.change - 116.35) < 0.001);
});
test('rejects quotes with only a three-month baseline or no actual timestamp', () => {
 assert.equal(parseYahooQuote('^NSEI', {meta}), null);
 assert.equal(parseYahooQuote('^NSEI', {meta:{regularMarketPrice:10,previousClose:9}}), null);
});
