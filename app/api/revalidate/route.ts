import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

import { env } from '~/env.mjs'

function handleRevalidate(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get('secret') ??
    req.headers.get('x-revalidate-secret')

  if (!env.CONTENT_WEBHOOK_SECRET || secret !== env.CONTENT_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidatePath('/', 'layout')
  revalidatePath('/en', 'layout')
  revalidatePath('/ai', 'layout')
  revalidatePath('/en/ai', 'layout')
  revalidatePath('/blog', 'layout')
  revalidatePath('/en/blog', 'layout')
  revalidatePath('/projects')
  revalidatePath('/feed.xml')
  revalidatePath('/en/feed.xml')
  revalidatePath('/ai/feed.xml')
  revalidatePath('/en/ai/feed.xml')
  revalidatePath('/llms.txt')
  revalidatePath('/llms-full.txt')
  revalidatePath('/robots.txt')
  revalidatePath('/sitemap.xml')

  return NextResponse.json({
    ok: true,
    revalidatedAt: new Date().toISOString(),
  })
}

export function GET(req: NextRequest) {
  return handleRevalidate(req)
}

export function POST(req: NextRequest) {
  return handleRevalidate(req)
}
