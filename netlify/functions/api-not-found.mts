export default async () => Response.json({ error: 'API endpoint not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
