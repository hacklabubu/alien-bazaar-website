import { createHash } from 'node:crypto'

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfter: number
}

type MemoryBucket = {
  count: number
  resetAt: number
}

const globalStore = globalThis as typeof globalThis & {
  __alienBazaarInquiryLimits?: Map<string, MemoryBucket>
}

const memoryStore =
  globalStore.__alienBazaarInquiryLimits ?? new Map<string, MemoryBucket>()

globalStore.__alienBazaarInquiryLimits = memoryStore

function keyFor(identifier: string) {
  const salt = process.env.INQUIRY_RATE_LIMIT_SALT ?? 'alien-bazaar-inquiries'
  return `ab:inquiry:${createHash('sha256')
    .update(`${salt}:${identifier}`)
    .digest('hex')
    .slice(0, 32)}`
}

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()

  if (memoryStore.size >= 5_000) {
    for (const [storedKey, bucket] of memoryStore) {
      if (bucket.resetAt <= now) memoryStore.delete(storedKey)
    }
    while (memoryStore.size >= 5_000) {
      const oldestKey = memoryStore.keys().next().value
      if (typeof oldestKey !== 'string') break
      memoryStore.delete(oldestKey)
    }
  }

  const current = memoryStore.get(key)
  const bucket =
    !current || current.resetAt <= now
      ? { count: 1, resetAt: now + windowMs }
      : { count: current.count + 1, resetAt: current.resetAt }

  memoryStore.set(key, bucket)

  return {
    allowed: bucket.count <= limit,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1_000)),
  }
}

/** Bounded, process-local rate limiter with automatic expiry cleanup. */
export function checkInquiryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
) {
  return memoryRateLimit(keyFor(identifier), limit, windowMs)
}
