import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

test('IPO frontend preserves empty results, unknown records and missing provider values', async () => {
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
    globalThis.fetch = async () => { calls++; return Response.json([]); };
    assert.deepEqual(await service.fetchIpoList({ tab: 'open' }), []);
    assert.equal(calls, 1);
    calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ error: 'IPO not found' }, { status: 404 }); };
    await assert.rejects(service.fetchIpoDetail('does-not-exist'), error => error.status === 404);
    assert.equal(calls, 1);
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
