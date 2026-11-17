import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next|studio|.*\\..*).*)'],
}

export default authMiddleware({
  beforeAuth: (req) => {
    const pathname = req.nextUrl.pathname
    const locale =
      pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh'
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-locale', locale)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  },
  publicRoutes: [
    '/',
    '/en',
    '/en/(.*)',
    '/studio(.*)',
    '/api(.*)',
    '/ai(.*)',
    '/blog(.*)',
    '/confirm(.*)',
    '/projects',
    '/guestbook',
    '/newsletters(.*)',
    '/about',
    '/rss',
    '/feed',
    '/en/rss',
    '/en/feed',
    '/ama',
    '/robots.txt',
    '/sitemap.xml',
    '/llms.txt',
    '/llms-full.txt',
  ],
})
