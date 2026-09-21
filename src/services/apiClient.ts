export class ApiClientError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export async function getJson<T>(url: string, options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);
  const relayAbort = () => controller.abort();
  options.signal?.addEventListener('abort', relayAbort, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new ApiClientError('Unable to load this information right now.', response.status);
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiClientError || error instanceof DOMException) throw error;
    throw new ApiClientError('Unable to load this information right now.');
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener('abort', relayAbort);
  }
}
