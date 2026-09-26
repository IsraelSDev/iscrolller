// Cache TTL em memória com deduplicação de requisições iguais em voo.
// Protege as cotas dos provedores (ex.: Pexels = 200 req/h).

const MAX_ENTRIES = 300;
const store = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>;

  const value = load();
  store.set(key, { expiresAt: Date.now() + ttlMs, value });
  value.catch(() => store.delete(key)); // falhas não ficam cacheadas
  while (store.size > MAX_ENTRIES) store.delete(store.keys().next().value!);
  return value;
}

export class ProviderConfigError extends Error {}
export class ProviderApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const TIMEOUT_MS = 8000;

// Aceita apenas https em hosts esperados (host exato ou sufixo ".dominio").
export function safeUrl(url: unknown, hosts: string[]): string | null {
  if (typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const ok = hosts.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
    return u.protocol === 'https:' && ok ? u.toString() : null;
  } catch {
    return null;
  }
}
