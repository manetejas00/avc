import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url), ts = require('typescript');
function load(file) { const exports = {}; new Function('exports', ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports); return exports; }
const { sipFutureValue, goalMonthly, loanEmi } = load('../src/utils/planning.ts');
const { navTime, fundReturn, commonNavDate, planLabels } = load('../src/utils/fundComparison.ts');
test('SIP uses start-of-month contributions; zero-rate and goal cases are finite', () => {
 assert.equal(sipFutureValue(5000, 10, 0), 600000);
 let independent = 0; for (let month = 0; month < 120; month++) independent = (independent + 5000) * 1.01;
 assert.ok(Math.abs(sipFutureValue(5000, 10, 12) - independent) < .01);
 const goal = goalMonthly(1000000, 10, 8, 5);
 assert.ok(Math.abs(sipFutureValue(goal.monthly, 10, 8) - 1000000 * 1.05 ** 10) < .01);
});
test('EMI amortizes loan and supports zero interest', () => {
 assert.equal(loanEmi(120000, 1, 0), 10000);
 const emi = loanEmi(1000000, 10, 8); let balance = 1000000;
 for (let month = 0; month < 120; month++) balance = balance * (1 + .08 / 12) - emi;
 assert.ok(Math.abs(balance) < .01);
 assert.ok(Math.abs(emi - 12132.7594) < .001);
});
const fund = (name, data) => ({ meta: {scheme_code:1, scheme_name:name}, data });
const growth = fund('Example Direct Plan Growth', [{date:'30-10-2026',nav:'120'}, {date:'30-10-2025',nav:'100'}, {date:'30-10-2023',nav:'80'}]);
test('NAV dates are validated and common comparison date uses all selections', () => {
 assert.ok(Number.isNaN(navTime('31-02-2026')));
 assert.equal(commonNavDate([growth, fund('Second Regular Growth', [{date:'29-10-2026',nav:'21'},{date:'30-10-2025',nav:'20'}])]), '30-10-2025');
 assert.equal(commonNavDate([growth, fund('Other Growth',[{date:'01-01-2024',nav:'5'}])]), null);
});
test('returns use actual calendar anchors and suppress missing history and IDCW', () => {
 assert.ok(Math.abs(fundReturn(growth,1,'30-10-2026').value-20) < .0001);
 assert.equal(fundReturn(growth,5,'30-10-2026'),null);
 assert.equal(fundReturn(fund('Example Direct IDCW',growth.data),1,'30-10-2026'),null);
 assert.equal(fundReturn(fund('Example Growth',[{date:'30-10-2026',nav:'120'},{date:'01-10-2025',nav:'100'}]),1,'30-10-2026'),null);
 assert.deepEqual(planLabels('Example Direct Plan - Growth Option'),{plan:'Direct',option:'Growth'});
 assert.deepEqual(planLabels('Example Regular - IDCW'),{plan:'Regular',option:'IDCW / Dividend'});
});
