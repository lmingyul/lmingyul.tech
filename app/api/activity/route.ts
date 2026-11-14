import { type NextRequest, NextResponse } from 'next/server'

import { getIP } from '~/lib/ip'
import { createRatelimit, redis } from '~/lib/redis'

const ratelimit = createRatelimit(5, 5)

export async function GET(req: NextRequest) {
  const { success } = await ratelimit.limit('activity:app_' + getIP(req))
  if (!success) {
    return new Response('Too Many Requests', {
      status: 429,
    })
  }

  const app = await redis.get('activity:app')

  return NextResponse.json({
    app,
  })
}
