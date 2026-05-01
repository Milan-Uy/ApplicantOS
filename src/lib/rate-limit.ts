// NOTE: In-memory only — works for single-instance (MVP). For multi-region/serverless
// at scale, replace the Map with Upstash Redis + @upstash/ratelimit.

const store = new Map<string, number[]>()
let callCount = 0

export function checkRateLimit(
  userId: string,
  opts: { limit: number; windowMs: number; bucket: string }
): { ok: boolean; retryAfterSec: number } {
  const { limit, windowMs, bucket } = opts
  const key = `${bucket}:${userId}`
  const now = Date.now()

  // Sweep stale keys every 100 calls to bound memory
  if (++callCount % 100 === 0) {
    for (const [k, timestamps] of store) {
      if (timestamps.every((t) => now - t > windowMs)) store.delete(k)
    }
  }

  const timestamps = store.get(key) ?? []
  const recent = timestamps.filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    const oldest = Math.min(...recent)
    const retryAfterSec = Math.ceil((oldest + windowMs - now) / 1000)
    store.set(key, recent)
    return { ok: false, retryAfterSec }
  }

  recent.push(now)
  store.set(key, recent)
  return { ok: true, retryAfterSec: 0 }
}
