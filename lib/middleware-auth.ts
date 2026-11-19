export function resolveLocaleFromPathname(pathname: string): 'en' | 'zh' {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh'
}

/**
 * Only run Clerk's server-side authMiddleware on routes that actually call
 * server-side Clerk auth (`currentUser()`): `/admin/*`, `POST /api/guestbook`,
 * and `POST /api/comments/*`.
 *
 * Public pages and public APIs bypass `authMiddleware` so Clerk dev keys
 * (`sk_test_`) never emit HTTP 401 interstitial responses to cookie-less
 * crawlers (Googlebot/Bingbot) or first-time visitors.
 */
export function needsClerkServerAuth(pathname: string, method: string): boolean {
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return true
  }

  const normalizedMethod = method.toUpperCase()
  if (
    normalizedMethod !== 'GET' &&
    normalizedMethod !== 'HEAD' &&
    normalizedMethod !== 'OPTIONS' &&
    (pathname === '/api/guestbook' || pathname.startsWith('/api/comments/'))
  ) {
    return true
  }

  return false
}
