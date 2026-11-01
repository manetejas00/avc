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
