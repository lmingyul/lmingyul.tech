import { authMiddleware } from '@clerk/nextjs'
import { type NextFetchEvent, type NextRequest, NextResponse } from 'next/server'

import {
  needsClerkServerAuth,
  resolveLocaleFromPathname,
} from '~/lib/middleware-auth'

export const config = {
  matcher: ['/((?!_next|studio|.*\\..*).*)'],
}

function withLocaleHeader(req: NextRequest): NextResponse {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-locale', resolveLocaleFromPathname(req.nextUrl.pathname))

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

const clerkAuthMiddleware = authMiddleware({
  beforeAuth: (req) => withLocaleHeader(req),
  publicRoutes: ['/api/comments/(.*)', '/api/guestbook'],
})

export default function middleware(req: NextRequest, evt: NextFetchEvent) {
  if (needsClerkServerAuth(req.nextUrl.pathname, req.method)) {
    return clerkAuthMiddleware(req, evt)
  }

  return withLocaleHeader(req)
}
