import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

test('IPO frontend withholds unverified data and never invents missing provider values', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'avc-ipo-test-'));
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  globalThis.window = { setTimeout, clearTimeout };
  let calls = 0;
  try {
    for (const name of ['apiClient', 'ipoService']) {
      const source = await readFile(`src/services/${name}.ts`, 'utf8');
      const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace("'./apiClient'", "'./apiClient.mjs'");
      await writeFile(path.join(directory, name + '.mjs'), compiled);
    }
    const service = await import(pathToFileURL(path.join(directory, 'ipoService.mjs')));
    const record = { id: 'fixture', name: 'Isolated fixture' };
    assert.deepEqual(service.enrichIpoDetails(record), record);
    assert.equal(service.enrichIpoDetails({ ...record, documents: { drhpUrl: 'javascript:alert(1)' } }).documents.drhpUrl, undefined);
    globalThis.fetch = async () => { calls++; throw new Error('No unverified feed should be requested'); };
    await assert.rejects(service.fetchIpoList({ tab: 'open' }), /Data unavailable/);
    await assert.rejects(service.fetchIpoDetail('does-not-exist'), /Data unavailable/);
    assert.equal(calls, 0);
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
