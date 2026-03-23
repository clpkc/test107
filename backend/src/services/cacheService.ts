export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function normalizeCacheKey(rawUrl: string): string {
  const url = new URL(rawUrl);
  const sorted = new URLSearchParams([...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b)));
  const keyUrl = new URL(`${url.protocol}//${url.host}${url.pathname}`);
  keyUrl.search = sorted.toString();
  return keyUrl.toString();
}

export class CacheService<T = string> {
  private readonly store = new Map<string, CacheEntry<T>>();

  get(key: string, now = Date.now()): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= now) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number, now = Date.now()): void {
    this.store.set(key, { value, expiresAt: now + ttlMs });
  }
}
