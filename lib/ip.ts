import { type NextRequest } from 'next/server'

export function getIP(request: Request | NextRequest): string {
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP.trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  if ('ip' in request && request.ip) {
    return request.ip
  }

  const xff = request.headers.get('x-forwarded-for')
  if (xff === '::1') {
    return '127.0.0.1'
  }

  return xff?.split(',')?.[0]?.trim() ?? '127.0.0.1'
}
