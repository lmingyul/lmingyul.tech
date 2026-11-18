import { createHash } from 'crypto'

import { kvKeys } from '~/config/kv'
import { redis } from '~/lib/redis'

const WEEKLY_WINDOW_SECONDS = 7 * 24 * 60 * 60
const VISITOR_HASH_SALT = 'lmingyul-weekly-uv-v1'

const BOT_UA_PATTERN =
  /bot|crawler|spider|slurp|mediapartners|adsbot|google-extended|oai-searchbot|chatgpt-user|gptbot|claudebot|claude-searchbot|claude-user|perplexitybot|perplexity-user|applebot|bytespider|facebookexternalhit|facebot|twitterbot|slackbot|discordbot|telegrambot|whatsapp|linkedinbot|embedly|pinterest|vkshare|outbrain|w3c_validator|lighthouse|pagespeed|gtmetrix|headlesschrome|phantomjs|prerender|uptimerobot|better uptime|pingdom|statuscake|datadog|curl\/|wget\/|python-requests|python-urllib|aiohttp|httpx|go-http-client|java\/|okhttp|axios\/|node-fetch|undici|libwww-perl|ruby|scrapy|feedfetcher|tt-rss|inoreader|feedly|netnewswire/i

type HeaderReader = Pick<Headers, 'get'>

function normalizeIP(raw: string | null | undefined): string | null {
  if (!raw) return null
  const first = raw.split(',')[0]?.trim() ?? ''
  if (!first) return null
  const stripped = first.replace(/^::ffff:/i, '')
  if (
    !stripped ||
    stripped === '127.0.0.1' ||
    stripped === '::1' ||
    stripped.toLowerCase() === 'localhost' ||
    stripped.toLowerCase() === 'unknown'
  ) {
    return null
  }
  return stripped
}

function extractPublicIP(reqHeaders: HeaderReader): string | null {
  return (
    normalizeIP(reqHeaders.get('cf-connecting-ip')) ??
    normalizeIP(reqHeaders.get('x-real-ip')) ??
    normalizeIP(reqHeaders.get('x-forwarded-for'))
  )
}

function isLikelyHumanNavigation(reqHeaders: HeaderReader): boolean {
  if (
    reqHeaders.get('next-router-prefetch') ||
    reqHeaders.get('x-middleware-prefetch')
  ) {
    return false
  }

  const purpose = (
    reqHeaders.get('purpose') ??
    reqHeaders.get('sec-purpose') ??
    ''
  ).toLowerCase()
  if (purpose.includes('prefetch') || purpose.includes('preview')) {
    return false
  }

  const ua = reqHeaders.get('user-agent')?.trim() ?? ''
  if (ua.length < 12 || BOT_UA_PATTERN.test(ua)) {
    return false
  }

  return true
}

function computeVisitorDigest(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${VISITOR_HASH_SALT}:${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 16)
}

export async function recordAndCountWeeklyVisitors(
  reqHeaders: HeaderReader
): Promise<number | null> {
  let member: string | null = null
  if (isLikelyHumanNavigation(reqHeaders)) {
    const ip = extractPublicIP(reqHeaders)
    const ua = reqHeaders.get('user-agent')?.trim() ?? ''
    if (ip && ua) {
      member = computeVisitorDigest(ip, ua)
    }
  }

  return redis.rollingUniqueCount(
    kvKeys.weeklyVisitors,
    WEEKLY_WINDOW_SECONDS,
    member
  )
}
