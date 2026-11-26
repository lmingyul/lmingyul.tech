'use client'

const STORAGE_KEY = 'lmingyul:online-visitor-id'
const HEARTBEAT_MS = 30_000
const VISITOR_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/

export type OnlineSnapshot = {
  site: number | null
  postCounts: ReadonlyMap<string, number>
}

export const EMPTY_ONLINE_SNAPSHOT: OnlineSnapshot = {
  site: null,
  postCounts: new Map<string, number>(),
}

let currentSnapshot: OnlineSnapshot = EMPTY_ONLINE_SNAPSHOT
const listeners = new Set<() => void>()

let memoryVisitorId: string | null = null
let siteRefs = 0
let postRefs = 0
let activePostId: string | null = null
let lifecycleAttached = false
let heartbeatTimer: number | null = null
let pendingPingTimer: number | null = null
let pageHiddenUnloaded = false
const pendingLeaveTimers = new Map<string, number>()

function emitSnapshot(next: OnlineSnapshot) {
  currentSnapshot = next
  listeners.forEach((listener) => listener())
}

function generateVisitorId(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16)
      crypto.getRandomValues(bytes)
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    }
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
}

function getVisitorId(): string {
  if (memoryVisitorId && VISITOR_ID_RE.test(memoryVisitorId)) {
    return memoryVisitorId
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && VISITOR_ID_RE.test(stored)) {
      memoryVisitorId = stored
      return stored
    }
  } catch {
    // Ignore storage access failures in private browsing modes.
  }

  const created = generateVisitorId()
  memoryVisitorId = created
  try {
    window.localStorage.setItem(STORAGE_KEY, created)
  } catch {
    // Fallback to in-memory visitor ID when storage is unavailable.
  }
  return created
}

function sendLeaveRequest(body: string, preferBeacon: boolean) {
  if (preferBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const ok = navigator.sendBeacon(
        '/api/online',
        new Blob([body], { type: 'application/json' })
      )
      if (ok) {
        return
      }
    } catch {
      // Fallback to fetch with keepalive below.
    }
  }

  void fetch('/api/online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => undefined)
}

async function sendPing() {
  if (typeof document === 'undefined' || document.visibilityState === 'hidden') {
    return
  }
  if (siteRefs === 0 && postRefs === 0) {
    return
  }

  const requestedPostId = activePostId
  const payload = JSON.stringify({
    id: getVisitorId(),
    ...(requestedPostId ? { postId: requestedPostId } : {}),
    action: 'ping',
  })

  try {
    const res = await fetch('/api/online', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      cache: 'no-store',
      credentials: 'same-origin',
    })
    if (!res.ok) {
      return
    }
    const data = (await res.json()) as {
      site?: number | null
      post?: number | null
    }

    const nextSite =
      typeof data.site === 'number' && Number.isFinite(data.site)
        ? data.site
        : currentSnapshot.site
    let nextPostCounts = currentSnapshot.postCounts

    if (
      requestedPostId &&
      typeof data.post === 'number' &&
      Number.isFinite(data.post)
    ) {
      if (currentSnapshot.postCounts.get(requestedPostId) !== data.post) {
        const updated = new Map(currentSnapshot.postCounts)
        updated.set(requestedPostId, data.post)
        nextPostCounts = updated
      }
    }

    if (
      nextSite !== currentSnapshot.site ||
      nextPostCounts !== currentSnapshot.postCounts
    ) {
      emitSnapshot({
        site: nextSite,
        postCounts: nextPostCounts,
      })
    }
  } catch {
    // Keep the last valid online count on transient network failures.
  }
}

function clearTimers() {
  if (heartbeatTimer !== null) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
  if (pendingPingTimer !== null) {
    window.clearTimeout(pendingPingTimer)
    pendingPingTimer = null
  }
}

function ensureHeartbeatInterval() {
  if (
    typeof document === 'undefined' ||
    document.visibilityState === 'hidden' ||
    (siteRefs === 0 && postRefs === 0)
  ) {
    return
  }
  if (heartbeatTimer === null) {
    heartbeatTimer = window.setInterval(() => {
      void sendPing()
    }, HEARTBEAT_MS)
  }
}

function schedulePing(delayMs = 0) {
  if (
    typeof document === 'undefined' ||
    document.visibilityState === 'hidden' ||
    (siteRefs === 0 && postRefs === 0)
  ) {
    return
  }
  ensureHeartbeatInterval()
  if (pendingPingTimer !== null) {
    return
  }
  pendingPingTimer = window.setTimeout(() => {
    pendingPingTimer = null
    void sendPing()
  }, delayMs)
}

function handleVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    clearTimers()
    return
  }
  pageHiddenUnloaded = false
  ensureHeartbeatInterval()
  void sendPing()
}

function handlePageHide() {
  if (pageHiddenUnloaded) {
    return
  }
  pageHiddenUnloaded = true
  clearTimers()
  pendingLeaveTimers.forEach((timerId) => window.clearTimeout(timerId))
  pendingLeaveTimers.clear()

  const payload = JSON.stringify({
    id: getVisitorId(),
    ...(activePostId ? { postId: activePostId } : {}),
    action: 'leave',
    scope: 'all',
  })
  sendLeaveRequest(payload, true)
}

function attachLifecycle() {
  if (lifecycleAttached || typeof window === 'undefined') {
    return
  }
  lifecycleAttached = true
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('pagehide', handlePageHide)
  ensureHeartbeatInterval()
}

function detachLifecycleIfIdle() {
  if (!lifecycleAttached || siteRefs > 0 || postRefs > 0) {
    return
  }
  lifecycleAttached = false
  clearTimers()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('pagehide', handlePageHide)
}

export function subscribeOnlinePresence(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getOnlineSnapshot(): OnlineSnapshot {
  return currentSnapshot
}

export function getServerOnlineSnapshot(): OnlineSnapshot {
  return EMPTY_ONLINE_SNAPSHOT
}

export function acquireSitePresence(): () => void {
  siteRefs += 1
  pageHiddenUnloaded = false
  attachLifecycle()
  schedulePing(0)

  return () => {
    siteRefs = Math.max(0, siteRefs - 1)
    detachLifecycleIfIdle()
  }
}

export function acquirePostPresence(postId: string): () => void {
  postRefs += 1
  pageHiddenUnloaded = false

  const canceledLeave = pendingLeaveTimers.get(postId)
  if (canceledLeave !== undefined) {
    window.clearTimeout(canceledLeave)
    pendingLeaveTimers.delete(postId)
  }

  activePostId = postId
  attachLifecycle()
  schedulePing(0)

  return () => {
    postRefs = Math.max(0, postRefs - 1)
    if (activePostId === postId) {
      activePostId = null
    }
    detachLifecycleIfIdle()

    if (typeof window === 'undefined' || pageHiddenUnloaded) {
      return
    }

    const timerId = window.setTimeout(() => {
      pendingLeaveTimers.delete(postId)
      if (activePostId === postId || pageHiddenUnloaded) {
        return
      }
      const payload = JSON.stringify({
        id: getVisitorId(),
        postId,
        action: 'leave',
        scope: 'post',
      })
      sendLeaveRequest(payload, false)
    }, 0)
    pendingLeaveTimers.set(postId, timerId)
  }
}
