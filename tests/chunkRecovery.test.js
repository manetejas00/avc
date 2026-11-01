import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

test('deployment recovery reloads a missing chunk once, preserves route and avoids offline/reload loops', async () => {
  const source = await readFile('src/utils/chunkRecovery.ts','utf8');
  const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  const {recoverChunk,isChunkLoadError} = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
  const original = Object.fromEntries(['window','navigator','sessionStorage'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const values=new Map();const visits=[];
  try {
    Object.defineProperty(globalThis,'navigator',{configurable:true,value:{onLine:true}});
    Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{href:'https://example.com/ipo/bcssl?exchange=NSE#terms',replace:url=>visits.push(url)}}});
    Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:key=>values.get(key),setItem:(key,value)=>values.set(key,value)}});
    const error=new TypeError('Failed to fetch dynamically imported module: https://example.com/assets/old.js');
    assert.equal(isChunkLoadError(error),true);
    assert.equal(recoverChunk(new Error('Other failure')),false);
    assert.equal(recoverChunk(error),true);
    const url=new URL(visits[0]);assert.equal(url.pathname,'/ipo/bcssl');assert.equal(url.searchParams.get('exchange'),'NSE');assert.equal(url.hash,'#terms');assert.ok(url.searchParams.get('_avc_update'));
    assert.equal(recoverChunk(error),false);assert.equal(visits.length,1);
    values.clear();globalThis.navigator.onLine=false;assert.equal(recoverChunk(error),false);
    globalThis.navigator.onLine=true;globalThis.sessionStorage.getItem=()=>{throw new Error('storage unavailable')};assert.equal(recoverChunk(error),false);
  } finally {for(const[key,descriptor]of Object.entries(original)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
