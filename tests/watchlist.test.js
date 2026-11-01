import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,writeFile,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
test('watchlist uses valid dated stock quotes, separates gainers/losers and rejects unknown or duplicate instruments',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'avc-watchlist-test-'));
 try {
  for(const name of ['yahooQuote','watchlist']){
   const code=ts.transpileModule(await readFile(`src/utils/${name}.ts`,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText.replace("'./yahooQuote'","'./yahooQuote.mjs'");
   await writeFile(path.join(directory,name+'.mjs'),code);
  }
  const {parseWatchlist}=await import(pathToFileURL(path.join(directory,'watchlist.mjs')));
  const quote=(symbol,change)=>({symbol,result:{meta:{symbol,currency:'INR',regularMarketPrice:100,regularMarketChange:change,regularMarketTime:1793354400}}});
  const missingTime=quote('INFY.NS',1);delete missingTime.result.meta.regularMarketTime;
  const mismatch=quote('AXISBANK.NS',1);mismatch.result.meta.symbol='TCS.NS';
  const result=parseWatchlist({data:[quote('TCS.NS',5),quote('RELIANCE.NS',-2),quote('ITC.NS',0),quote('TCS.NS',9),quote('FAKE.NS',50),missingTime,mismatch]});
  assert.equal(result.count,3);assert.deepEqual(result.gainers.map(x=>x.symbol),['TCS']);assert.deepEqual(result.losers.map(x=>x.symbol),['RELIANCE']);
  assert.equal(result.gainers[0].exchange,'NSE');assert.equal(result.gainers[0].provider,'Yahoo Finance');assert.ok(result.gainers[0].timestamp);
  assert.deepEqual(parseWatchlist({data:[]}),{count:0,gainers:[],losers:[]});
 }finally{await rm(directory,{recursive:true,force:true});}
});
