import { type NextRequest, NextResponse } from 'next/server'

import { getIP } from '~/lib/ip'
import { createRatelimit } from '~/lib/redis'
import { resolveAndRecordVisitorMap } from '~/lib/visitor-geo'

export const dynamic = 'force-dynamic'

const visitorMapRatelimit = createRatelimit(30, 60)
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET(req: NextRequest) {
  const { success } = await visitorMapRatelimit.limit(`visitor-map:${getIP(req)}`)
  if (!success) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      { status: 429, headers: NO_STORE_HEADERS }
    )
  }

  const data = await resolveAndRecordVisitorMap(req.headers)
  return NextResponse.json(data, {
    status: 200,
    headers: NO_STORE_HEADERS,
  })
}
