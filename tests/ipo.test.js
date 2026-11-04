import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

test('IPO feed preserves source values, filters correctly and reports source failures', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'avc-ipo-test-'));
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  let calls = 0;
  try {
    for (const name of ['apiClient', 'ipoService']) {
      const source = await readFile(`src/services/${name}.ts`, 'utf8');
      const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace('import.meta.env.VITE_API_BASE_URL', "''").replace("'./apiClient'", "'./apiClient.mjs'");
      await writeFile(path.join(directory, name + '.mjs'), compiled);
    }
    const service = await import(pathToFileURL(path.join(directory, 'ipoService.mjs')));
    const record = { id: 'fixture', name: 'Isolated fixture' };
    assert.deepEqual(service.enrichIpoDetails(record), record);
    assert.equal(service.enrichIpoDetails({ ...record, documents: { drhpUrl: 'javascript:alert(1)' } }).documents.drhpUrl, undefined);
    const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const records = [
      {id:'active',symbol:'ACTIVE',name:'Active fixture',status:'open',issueType:'Mainboard',exchanges:['NSE'],minPrice:78,maxPrice:82,lotSize:182},
      {id:'next',symbol:'NEXT',name:'Upcoming fixture',status:'upcoming',issueType:'SME',exchanges:['BSE'],minPrice:0,maxPrice:0},
      {id:'listed',symbol:'LISTED',name:'Listed fixture',status:'listed',listingDate:today,issueType:'Mainboard',exchanges:['NSE']},
      {id:'old',symbol:'OLD',name:'Old fixture',status:'listed',listingDate:'2020-01-01',issueType:'Mainboard',exchanges:['NSE']}
    ];
    globalThis.fetch = async url => { calls++; assert.equal(url,'/api/ipo'); return {ok:true, headers:new Headers({'content-type':'application/json'}),json:async()=>({source:'NSE',checkedAt:new Date().toISOString(),data:records,warnings:[],stale:false,coverage:'fixture'})}; };
    const list=await service.fetchIpoList({tab:'all'});
    assert.equal(list.length,4);assert.equal(list[0].lotSize,182);assert.equal(list[1].subscription,undefined);
    assert.equal((await service.fetchIpoList({tab:'upcoming',exchange:'bse',segment:'sme'}))[0].symbol,'NEXT');
    assert.equal((await service.fetchIpoList({tab:'listed_7days'})).length,1);
    assert.deepEqual(await service.fetchIpoList({search:'not-a-real-issuer'}),[]);
    assert.equal((await service.fetchIpoDetail('active')).name,'Active fixture');
    assert.equal((await service.fetchIpoStats()).listed7Days,1);
    await assert.rejects(service.fetchIpoDetail('does-not-exist'),/not included/);
    assert.ok(calls>0);
    globalThis.fetch=async()=>({ok:false,status:503});
    await assert.rejects(service.fetchIpoList({}),/Unable to load/);
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async (_url, { signal }) => { assert.equal(signal.aborted, true); throw new DOMException('Aborted', 'AbortError'); };
    await assert.rejects(service.fetchIpoList({}, controller.signal), error => error.name === 'AbortError');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    await rm(directory, { recursive: true, force: true });
  }
});
