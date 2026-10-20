// Optional audit-only adapter: executes the same SQL with Node's real SQLite
// when the local better-sqlite3 native addon is unavailable. Never used by server.js.
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'better-sqlite3') return { url: new URL('./sqlite-adapter.js', import.meta.url).href, shortCircuit: true };
  return nextResolve(specifier, context);
}
