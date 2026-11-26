import { type NextRequest, NextResponse } from 'next/server'

import { kvKeys } from '~/config/kv'
import { getIP } from '~/lib/ip'
import { createRatelimit, redis } from '~/lib/redis'
import { isBotUserAgent, ONLINE_WINDOW_SECONDS } from '~/lib/visitor-stats'

export const dynamic = 'force-dynamic'

const onlineRatelimit = createRatelimit(30, 60)
const VISITOR_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/
const POST_ID_RE = /^[a-zA-Z0-9._-]{1,128}$/
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' }

type OnlineRequestPayload = {
  id: string
  postId: string | null
  action: 'ping' | 'leave'
  scope: 'all' | 'post'
}

function parseOnlinePayload(rawText: string): OnlineRequestPayload | null {
  if (!rawText || rawText.length > 2048) {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawText)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  const record = parsed as Record<string, unknown>
  const id = typeof record.id === 'string' ? record.id.trim() : ''
  if (!VISITOR_ID_RE.test(id)) {
    return null
  }

  let postId: string | null = null
  if (record.postId !== undefined && record.postId !== null && record.postId !== '') {
    if (typeof record.postId !== 'string') {
      return null
    }
    const trimmedPostId = record.postId.trim()
    if (!POST_ID_RE.test(trimmedPostId)) {
      return null
    }
    postId = trimmedPostId
  }

  const rawAction = record.action ?? 'ping'
  if (rawAction !== 'ping' && rawAction !== 'leave') {
    return null
  }

  const rawScope = record.scope ?? 'all'
  if (rawScope !== 'all' && rawScope !== 'post') {
    return null
  }

  return {
    id,
    postId,
    action: rawAction,
    scope: rawScope,
  }
}

export async function POST(req: NextRequest) {
  let rawText = ''
  try {
    rawText = await req.text()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const payload = parseOnlinePayload(rawText)
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  // Crawlers / bots never enter the online ZSET; respond cleanly without writing.
  if (isBotUserAgent(req.headers.get('user-agent'))) {
    if (payload.action === 'leave') {
      return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS })
    }
    const [site, post] = await Promise.all([
      redis.rollingUniqueCount(kvKeys.onlineVisitors, ONLINE_WINDOW_SECONDS),
      payload.postId
        ? redis.rollingUniqueCount(
            kvKeys.postOnlineVisitors(payload.postId),
            ONLINE_WINDOW_SECONDS
          )
        : Promise.resolve(null),
    ])
    return NextResponse.json(
      { site, post },
      { status: 200, headers: NO_STORE_HEADERS }
    )
  }

  const { success } = await onlineRatelimit.limit(`online:${getIP(req)}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: NO_STORE_HEADERS }
    )
  }

  if (payload.action === 'leave') {
    await redis.leaveOnlinePresence({
      siteKey: payload.scope === 'post' ? null : kvKeys.onlineVisitors,
      postKey: payload.postId ? kvKeys.postOnlineVisitors(payload.postId) : null,
      member: payload.id,
    })
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS })
  }

  const result = await redis.touchOnlinePresence({
    siteKey: kvKeys.onlineVisitors,
    postKey: payload.postId ? kvKeys.postOnlineVisitors(payload.postId) : null,
    windowSeconds: ONLINE_WINDOW_SECONDS,
    member: payload.id,
  })

  return NextResponse.json(
    result ?? { site: null, post: null },
    { status: 200, headers: NO_STORE_HEADERS }
  )
}
