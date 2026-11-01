const recoveryKey = 'avc-chunk-recovery';
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS|Loading chunk .+ failed/i.test(message);
}
export function refreshPage(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('_avc_update', Date.now().toString());
  window.location.replace(url.toString());
}
export function recoverChunk(error: unknown): boolean {
  if (!isChunkLoadError(error) || !navigator.onLine) return false;
  try {
    const previous = Number(sessionStorage.getItem(recoveryKey));
    if (previous && Date.now() - previous < 60_000) return false;
    sessionStorage.setItem(recoveryKey, Date.now().toString());
    refreshPage();
    return true;
  } catch { return false; }
}
