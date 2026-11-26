import { type NextRequest, NextResponse } from 'next/server'

import { type Locale } from '~/lib/i18n'
import { getIP } from '~/lib/ip'
import { createRatelimit } from '~/lib/redis'
import { searchSiteContent, type SearchTypeFilter } from '~/lib/search'

export const dynamic = 'force-dynamic'

const searchRatelimit = createRatelimit(60, 60)
const MAX_QUERY_LENGTH = 100
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
}
const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function GET(req: NextRequest) {
  const { success } = await searchRatelimit.limit(`search:${getIP(req)}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: NO_STORE_HEADERS }
    )
  }

  const { searchParams } = req.nextUrl
  const rawQuery = searchParams.get('q') ?? ''
  const query = rawQuery.trim()
  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: 'Query too long' },
      { status: 400, headers: NO_STORE_HEADERS }
    )
  }

  const rawLocale = searchParams.get('locale')
  let locale: Locale = 'zh'
  if (rawLocale !== null && rawLocale !== '') {
    if (rawLocale !== 'zh' && rawLocale !== 'en') {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }
    locale = rawLocale
  }

  const rawType = searchParams.get('type')
  let type: SearchTypeFilter = 'all'
  if (rawType !== null && rawType !== '') {
    if (rawType !== 'all' && rawType !== 'post' && rawType !== 'ai-daily') {
      return NextResponse.json(
        { error: 'Invalid type' },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }
    type = rawType
  }

  const rawLimit = searchParams.get('limit')
  let limit = 20
  if (rawLimit !== null && rawLimit !== '') {
    const parsedLimit = Number.parseInt(rawLimit, 10)
    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      return NextResponse.json(
        { error: 'Invalid limit' },
        { status: 400, headers: NO_STORE_HEADERS }
      )
    }
    limit = Math.min(30, parsedLimit)
  }

  const result = await searchSiteContent({
    query,
    locale,
    type,
    limit,
  })

  return NextResponse.json(result, {
    status: 200,
    headers: CACHE_HEADERS,
  })
}
