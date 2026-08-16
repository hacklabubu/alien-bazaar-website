type RequestState = 'pending' | 'sent'

type RequestEntry = {
  expiresAt: number
  state: RequestState
}

const PENDING_TTL_MS = 30_000
const SENT_TTL_MS = 10 * 60 * 1_000

const globalStore = globalThis as typeof globalThis & {
  __alienBazaarInquiryRequests?: Map<string, RequestEntry>
}

const requestStore =
  globalStore.__alienBazaarInquiryRequests ?? new Map<string, RequestEntry>()

globalStore.__alienBazaarInquiryRequests = requestStore

function cleanup(now: number) {
  if (requestStore.size < 5_000) return
  for (const [key, entry] of requestStore) {
    if (entry.expiresAt <= now) requestStore.delete(key)
  }
  while (requestStore.size >= 5_000) {
    const oldestKey = requestStore.keys().next().value
    if (typeof oldestKey !== 'string') break
    requestStore.delete(oldestKey)
  }
}

export function claimInquiryRequest(requestId: string) {
  const now = Date.now()
  cleanup(now)

  const current = requestStore.get(requestId)
  if (current && current.expiresAt > now) return current.state

  requestStore.set(requestId, {
    expiresAt: now + PENDING_TTL_MS,
    state: 'pending',
  })
  return 'claimed' as const
}

export function completeInquiryRequest(requestId: string) {
  requestStore.set(requestId, {
    expiresAt: Date.now() + SENT_TTL_MS,
    state: 'sent',
  })
}

export function releaseInquiryRequest(requestId: string) {
  requestStore.delete(requestId)
}
