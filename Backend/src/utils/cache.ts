/**
 * Lightweight in-memory TTL Cache
 * Same pattern as promptCache in ai.service.ts
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryStore = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | null {
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiry <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlSeconds = 60): void {
  // Simple LRU-style size limit
  if (memoryStore.size > 1000) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }

  memoryStore.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export function deleteCache(key: string): void {
  memoryStore.delete(key);
}

export function invalidateCachePattern(prefix: string): void {
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}

export function invalidateDashboardCache(userId: string): void {
  invalidateCachePattern(`dashboard_${userId}`);
}

export function invalidateHabitsCache(userId: string): void {
  invalidateCachePattern(`habits_${userId}`);
}
