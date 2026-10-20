import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { createServer } from 'node:net';

test('isolated API regression: persistence, authorization, validation and private content', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'avc-audit-'));
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));
  const base = `http://127.0.0.1:${port}`;
  let child;
  let output = '';
  const start = async (password) => {
    output = '';
    const args = process.env.AUDIT_SQLITE_BUILTIN === 'true' ? ['--experimental-loader', './tests/sqlite-loader.js', 'server.js'] : ['server.js'];
    child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test', PORT: String(port), DATABASE_URL: path.join(directory, 'test.sqlite'), JWT_SECRET: 'isolated-audit-session-key-with-32-characters', BOOTSTRAP_ADMIN_EMAIL: 'audit@example.test', BOOTSTRAP_ADMIN_PASSWORD: password, DISABLE_NEWS_SCHEDULER: 'true', INDIAN_API_KEY: '', MARKETAUX_API_KEY: '', COINGECKO_DEMO_API_KEY: '' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    for (let attempt = 0; attempt < 1800; attempt++) {
      if (output.includes('Server is running')) return;
      if (child.exitCode !== null) throw new Error(`Test server failed: ${output}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Test server startup timed out: ${output}`);
  };
  const stop = async () => { if (child && child.exitCode === null) { const exited = once(child, 'exit'); child.kill(); await exited; } };
  const request = async (url, options = {}) => {
    try { return await fetch(url, { ...options, headers: { ...options.headers, Connection: 'close' } }); }
    catch (error) { throw new Error(`Request failed: ${url}; server output: ${output}`, { cause: error }); }
  };
  const post = (route, body, cookie = '', extra = {}) => request(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie, ...extra }, body: JSON.stringify(body) });
  try {
    await start('Isolated-test-pass-123!');
    assert.equal((await request(base + '/api/admin/submissions')).status, 401);
    assert.equal((await request(base + '/api/admin/ebooks?key=admin')).status, 401);
    assert.equal((await post('/api/submit-form', {})).status, 400);
    assert.equal((await post('/api/submit-form', { name: {}, email: 'x', phone: 'abc' })).status, 400);
    assert.equal((await post('/api/submit-form', { name: '   ', email: 'a@b.test', phone: '9876543210' })).status, 400);
    assert.equal((await post('/api/submit-form', { name: 'Audit', email: 'invalid', phone: 'abc' })).status, 400);
    const record = { name: 'Audit only', email: 'audit@example.test', phone: '+91 9876543210', interest: 'General Consultation', message: '<script>isolated input</script>' };
    assert.equal((await post('/api/submit-form', { ...record, message: 'x'.repeat(5001) })).status, 400);
    assert.equal((await post('/api/submit-form', record, '', { Origin: 'https://untrusted.example' })).status, 403);
    assert.equal((await post('/api/submit-form', record)).status, 200);
    assert.equal((await post('/api/admin/login', {})).status, 400);
    assert.equal((await post('/api/admin/login', { email: 'audit@example.test', password: 'incorrect' })).status, 401);
    const login = await post('/api/admin/login', { email: 'audit@example.test', password: 'Isolated-test-pass-123!' });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly/i);
    assert.match(login.headers.get('set-cookie'), /SameSite=Strict/i);
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const entries = await (await request(base + '/api/admin/submissions', { headers: { Cookie: cookie } })).json();
    assert.equal(entries.length, 1);
    assert.equal(entries[0].message, record.message);
    const id = entries[0].id;
    assert.equal((await post(`/api/admin/submissions/${id}/status`, { status: 'arbitrary' }, cookie)).status, 400);
    assert.equal((await post('/api/admin/submissions/999999/status', { status: 'completed' }, cookie)).status, 404);
    assert.equal((await post(`/api/admin/submissions/${id}/status`, { status: 'completed' }, cookie)).status, 200);
    const books = await request(base + '/api/admin/ebooks', { headers: { Cookie: cookie } });
    assert.equal(books.headers.get('cache-control'), 'no-store');
    assert.equal((await books.json()).length, 6);
    assert.equal((await request(base + '/api/market/search?q=invalid&q=second')).status, 400);
    assert.equal((await request(base + '/api/market/mutual-funds/search?q=invalid&q=second')).status, 400);
    assert.equal((await request(base + '/api/market/quotes?symbols=invalid&symbols=second')).status, 400);
    assert.equal((await request(base + '/api/market/chart?symbol=UNSUPPORTED')).status, 400);
    assert.equal((await request(base + '/api/ipo/list?tab=open&tab=invalid')).status, 400);
    assert.equal((await request(base + '/api/news/live')).status, 503);
    assert.equal((await request(base + '/api/crypto/market-snapshot')).status, 503);
    const missing = await request(base + '/api/does-not-exist');
    assert.equal(missing.status, 404);
    assert.match(missing.headers.get('content-type'), /application\/json/);
    assert.equal((await request(base + '/api/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' })).status, 400);
    await stop();
    await start('Different-bootstrap-value-123!');
    const persisted = await (await request(base + '/api/admin/submissions', { headers: { Cookie: cookie } })).json();
    assert.equal(persisted[0].status, 'completed');
    assert.equal((await post('/api/admin/login', { email: 'audit@example.test', password: 'Isolated-test-pass-123!' })).status, 200);
    for (let attempt = 0; attempt < 9; attempt++) await post('/api/admin/login', { email: 'audit@example.test', password: 'incorrect' });
    assert.equal((await post('/api/admin/login', { email: 'audit@example.test', password: 'incorrect' })).status, 429);
    const logout = await post('/api/admin/logout', {}, cookie);
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get('set-cookie'), /Expires=Thu, 01 Jan 1970/i);
  } finally {
    await stop();
    await rm(directory, { recursive: true, force: true });
  }
});
