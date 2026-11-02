import type { Config } from '@netlify/functions';
import { getUser, login, logout } from '@netlify/identity';
import { drizzle } from 'drizzle-orm/netlify-db';
import { desc, eq } from 'drizzle-orm';
import { submissions, syncLogs } from '../../db/schema.js';
import ebookContent from '../../services/ebookContent.js';
import { validateSubmission } from '../../services/submissionValidation.js';

export default async (request: Request) => {
  const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    const url = new URL(request.url), path = url.pathname;
    if (request.method !== 'GET' && request.method !== 'POST') return reply({ error: 'Method not allowed.' }, 405);
    if (request.method === 'POST' && request.headers.get('origin') && request.headers.get('origin') !== url.origin) return reply({ error: 'Invalid request origin.' }, 403);
    let body: Record<string, unknown> = {};
    if (request.method === 'POST') {
      const raw = await request.text();
      if (raw.length > 32768) return reply({ error: 'Request too large.' }, 413);
      try { body = JSON.parse(raw || '{}'); } catch { return reply({ error: 'Invalid JSON.' }, 400); }
      if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ error: 'Invalid request body.' }, 400);
    }
    if (path === '/api/submit-form') {
      if (request.method !== 'POST') return reply({ error: 'Use POST.' }, 405);
      const result = validateSubmission(body);
      if (result.error) return reply({ error: result.error }, 400);
      const db = drizzle();
      await db.insert(submissions).values(result.value);
      return reply({ success: true, message: 'Submission received successfully.' });
    }
    if (path === '/api/admin/login') {
      if (request.method !== 'POST') return reply({ error: 'Use POST.' }, 405);
      if (typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email.trim() || !body.password || body.email.length > 254 || body.password.length > 200) return reply({ error: 'Email and password are required.' }, 400);
      try {
        const user = await login(body.email.trim(), body.password);
        if (!user.roles?.includes('admin')) { await logout(); return reply({ error: 'An administrator account is required.' }, 403); }
        return reply({ success: true });
      } catch { return reply({ error: 'Unable to sign in. Check your administrator credentials.' }, 401); }
    }
    if (path === '/api/admin/logout') {
      if (request.method !== 'POST') return reply({ error: 'Use POST.' }, 405);
      await logout(); return reply({ success: true });
    }
    const user = await getUser();
    if (!user) return reply({ error: 'Unauthorized.' }, 401);
    if (!user.roles?.includes('admin')) return reply({ error: 'Administrator access is required.' }, 403);
    if (path === '/api/admin/check-auth' && request.method === 'GET') return reply({ authenticated: true });
    if (path === '/api/admin/ebooks' && request.method === 'GET') return reply(ebookContent);
    const db = drizzle();
    if (path === '/api/admin/submissions' && request.method === 'GET') {
      const rows = await db.select().from(submissions).orderBy(desc(submissions.createdAt)).limit(500);
      return reply(rows.map(({ createdAt, ...row }) => ({ ...row, created_at: createdAt })));
    }
    if (path === '/api/admin/sync-logs' && request.method === 'GET') {
      const rows = await db.select().from(syncLogs).orderBy(desc(syncLogs.createdAt)).limit(50);
      return reply(rows.map(({ createdAt, ...row }) => ({ ...row, created_at: createdAt })));
    }
    const match = path.match(/^\/api\/admin\/submissions\/(\d+)\/status$/);
    if (match && request.method === 'POST') {
      const id = Number(match[1]);
      if (!Number.isSafeInteger(id) || !['pending','completed','rejected'].includes(String(body.status))) return reply({ error: 'Invalid submission or status.' }, 400);
      const rows = await db.update(submissions).set({ status: String(body.status) }).where(eq(submissions.id, id)).returning({ id: submissions.id });
      return rows.length ? reply({ success: true }) : reply({ error: 'Submission not found.' }, 404);
    }
    return reply({ error: 'API endpoint not found.' }, 404);
  } catch { return reply({ error: 'The service is temporarily unavailable. Please retry.' }, 503); }
};
export const config: Config = { path: ['/api/admin/*','/api/submit-form'] };
