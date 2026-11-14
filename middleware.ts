import { authMiddleware } from '@clerk/nextjs'

export const config = {
  matcher: ['/((?!_next|studio|.*\\..*).*)'],
}

export default authMiddleware({
  publicRoutes: [
    '/',
    '/studio(.*)',
    '/api(.*)',
    '/blog(.*)',
    '/confirm(.*)',
    '/projects',
    '/guestbook',
    '/newsletters(.*)',
    '/about',
    '/rss',
    '/feed',
    '/ama',
  ],
})
