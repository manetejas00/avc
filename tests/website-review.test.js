import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
async function compiled(name) {
  const directory=await mkdtemp(path.join(tmpdir(),'avc-review-'));
  const source=await readFile(`src/utils/${name}.ts`,'utf8');
  const file=path.join(directory,'module.mjs');
  await writeFile(file,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
  return { module:await import(pathToFileURL(file)), clean:()=>rm(directory,{recursive:true,force:true}) };
}
test('SIP and EMI agree with independent month-by-month cash-flow models, including zero rates',async()=>{
  const {module:p,clean}=await compiled('planning');
  try {
    for(const rate of [0,6,12]) {
      let balance=0;for(let month=0;month<120;month++)balance=(balance+5000)*(1+rate/1200);
      assert.ok(Math.abs(p.sipEstimate(5000,rate,10)-balance)<0.0001);
      const emi=p.loanEmi(500000,rate,10);let outstanding=500000;
      for(let month=0;month<120;month++)outstanding=outstanding*(1+rate/1200)-emi;
      assert.ok(Math.abs(outstanding)<0.0001);
    }
  }finally{await clean();}
});
test('Fund comparison uses common dates and refuses missing periods or invalid NAVs',async()=>{
  const {module:f,clean}=await compiled('fundComparison');
  try {
    const first=[{date:'30-10-2026',nav:'120'},{date:'29-10-2026',nav:'119'},{date:'29-10-2025',nav:'100'}];
    const second=[{date:'29-10-2026',nav:'220'},{date:'29-10-2025',nav:'200'}];
    const result=f.compareNav([first,second],1);
    assert.equal(result.end,Date.UTC(2026,9,29));assert.equal(result.start,Date.UTC(2025,9,29));
    assert.ok(Math.abs(result.values[0]-19)<1e-10);assert.ok(Math.abs(result.values[1]-10)<1e-10);
    assert.equal(f.compareNav([first,second],3),null);
    assert.equal(f.compareNav([[{date:'30-02-2026',nav:'2'}]],1),null);
    assert.equal(f.compareNav([first,[]],1),null);
    assert.equal(f.planType('ABC Direct Plan Growth'),'Direct');assert.equal(f.optionType('ABC Dividend Reinvestment'),'IDCW');
  }finally{await clean();}
});

test('New fund shows short-period returns and reasons for missing long history without hiding older fund results',async()=>{
 const {module:f,clean}=await compiled('fundComparison');
 try {
  const young={name:'Axis sample Growth Option',data:[{date:'29-10-2026',nav:'11'},{date:'29-09-2026',nav:'10'},{date:'29-07-2026',nav:'9'},{date:'29-04-2026',nav:'8'},{date:'17-12-2025',nav:'7'}]};
  const old={name:'Older Direct Growth',data:[...young.data,{date:'29-10-2025',nav:'6'},{date:'27-10-2023',nav:'5'},{date:'29-10-2021',nav:'4'}]};
  const short=f.compareFundPeriod([young],'1m');assert.ok(Math.abs(short.results[0].value-10)<1e-10);
  const year=f.compareFundPeriod([young,old],'1y');assert.equal(year.results[0].value,null);assert.match(year.results[0].reason,/First available NAV: 17 Dec 2025/);assert.ok(year.results[1].value>0);
  const long=f.compareFundPeriod([young,old],'3y');assert.equal(long.results[0].value,null);assert.ok(long.results[1].value>0);assert.equal(long.annualised,true);
  const since=f.compareFundPeriod([young],'since');assert.ok(Math.abs(since.results[0].value-(11/7-1)*100)<1e-10);
  const mixed=f.compareFundPeriod([young,{...young,name:'Regular IDCW'}],'1m');assert.ok(mixed.results[0].value>0);assert.match(mixed.results[1].reason,/IDCW payouts/);
 }finally{await clean();}
});

test('Company metrics require matching exchange, currency and source time; missing values stay missing',async()=>{
 const {module:c,clean}=await compiled('companyData');
 try {
  const payload={symbol:'BSE:SBIN',values:{exchange:'BSE',currency:'INR',update_time:1793444404,update_mode:'delayed_streaming_900',description:'State Bank of India',close:961,RSI:47.2,price_earnings_ttm:10.29,sector:'Finance',industry:'Regional Banks',price_52_week_low:933.85,price_52_week_high:1234.8}};
  const result=c.parseCompanyProfile(payload,'BSE:SBIN');assert.equal(result.pe,10.29);assert.equal(result.sector,'Finance');assert.equal(result.delay,'Source delay: 15 minutes');assert.ok(result.timestamp);
  assert.throws(()=>c.parseCompanyProfile(payload,'NSE:SBIN'));
  assert.throws(()=>c.parseCompanyProfile({...payload,values:{...payload.values,update_time:null}},'BSE:SBIN'));
  assert.equal(c.parseCompanyProfile({...payload,values:{...payload.values,price_earnings_ttm:null,RSI:101}},'BSE:SBIN').pe,null);
  assert.equal(c.parseCompanyProfile({...payload,values:{...payload.values,RSI:101}},'BSE:SBIN').rsi,null);
 }finally{await clean();}
});
