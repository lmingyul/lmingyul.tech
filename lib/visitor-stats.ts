import { createHash } from 'crypto'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { kvKeys } from '~/config/kv'
import { getDate } from '~/lib/date'
import { redis } from '~/lib/redis'

dayjs.extend(utc)
dayjs.extend(timezone)

const SHANGHAI_TZ = 'Asia/Shanghai'
const WEEKLY_WINDOW_SECONDS = 7 * 24 * 60 * 60
export const ONLINE_WINDOW_SECONDS = 60
const DAILY_RETENTION_SECONDS = 45 * 24 * 60 * 60
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const TREND_MAX_DAYS = 30
const VISITOR_HASH_SALT = 'lmingyul-weekly-uv-v1'

const MOCK_DAILY_COUNTS = [
  32, 41, 38, 29, 44, 52, 47, 36, 40, 58, 63, 49, 42, 35, 51, 56, 48, 61, 54,
  45, 39, 53, 51, 59, 64, 391, 57, 47, 52, 28,
] as const

export type DailyVisitorPoint = {
  date: string
  count: number
}

export type FooterVisitorMetrics = {
  weeklyVisitors: number | null
  trend: {
    points: DailyVisitorPoint[]
    windowDays: number
    total: number
  } | null
}

const BOT_UA_PATTERN =
  /bot|crawler|spider|slurp|mediapartners|adsbot|google-extended|oai-searchbot|chatgpt-user|gptbot|claudebot|claude-searchbot|claude-user|perplexitybot|perplexity-user|applebot|bytespider|facebookexternalhit|facebot|twitterbot|slackbot|discordbot|telegrambot|whatsapp|linkedinbot|embedly|pinterest|vkshare|outbrain|w3c_validator|lighthouse|pagespeed|gtmetrix|headlesschrome|phantomjs|prerender|uptimerobot|better uptime|pingdom|statuscake|datadog|curl\/|wget\/|python-requests|python-urllib|aiohttp|httpx|go-http-client|java\/|okhttp|axios\/|node-fetch|undici|libwww-perl|ruby|scrapy|feedfetcher|tt-rss|inoreader|feedly|netnewswire/i

export type HeaderReader = Pick<Headers, 'get'>

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

export function extractPublicIP(reqHeaders: HeaderReader): string | null {
  return (
    normalizeIP(reqHeaders.get('cf-connecting-ip')) ??
    normalizeIP(reqHeaders.get('x-real-ip')) ??
    normalizeIP(reqHeaders.get('x-forwarded-for'))
  )
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = userAgent?.trim() ?? ''
  return ua.length < 12 || BOT_UA_PATTERN.test(ua)
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

  return !isBotUserAgent(reqHeaders.get('user-agent'))
}

function computeVisitorDigest(ip: string, userAgent: string): string {
  return createHash('sha256')
    .update(`${VISITOR_HASH_SALT}:${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 16)
}

export function resolveVisitorDigest(reqHeaders: HeaderReader): string | null {
  if (!isLikelyHumanNavigation(reqHeaders)) {
    return null
  }
  const ip = extractPublicIP(reqHeaders)
  const ua = reqHeaders.get('user-agent')?.trim() ?? ''
  if (!ip || !ua) {
    return null
  }
  return computeVisitorDigest(ip, ua)
}

export async function recordAndCountWeeklyVisitors(
  reqHeaders: HeaderReader
): Promise<number | null> {
  const member = resolveVisitorDigest(reqHeaders)

  return redis.rollingUniqueCount(
    kvKeys.weeklyVisitors,
    WEEKLY_WINDOW_SECONDS,
    member
  )
}

function parseShanghaiDay(dayStr: string): dayjs.Dayjs | null {
  if (!/^\d{8}$/.test(dayStr)) {
    return null
  }
  const iso = `${dayStr.slice(0, 4)}-${dayStr.slice(4, 6)}-${dayStr.slice(6, 8)}`
  const parsed = dayjs.tz(iso, SHANGHAI_TZ).startOf('day')
  return parsed.isValid() ? parsed : null
}

export function buildDailyDateRange(
  today: dayjs.Dayjs,
  dailySince: string | null,
  maxDays = TREND_MAX_DAYS
): Array<{ keyDay: string; isoDate: string }> {
  const todayStart = today.startOf('day')
  const earliest = todayStart.subtract(Math.max(1, maxDays) - 1, 'day')
  const sinceDay = dailySince ? parseShanghaiDay(dailySince) : null

  let start = todayStart
  if (sinceDay) {
    if (sinceDay.isAfter(todayStart)) {
      start = todayStart
    } else if (sinceDay.isAfter(earliest)) {
      start = sinceDay
    } else {
      start = earliest
    }
  }

  const days: Array<{ keyDay: string; isoDate: string }> = []
  let cursor = start
  while (!cursor.isAfter(todayStart) && days.length < maxDays) {
    days.push({
      keyDay: cursor.format('YYYYMMDD'),
      isoDate: cursor.format('YYYY-MM-DD'),
    })
    cursor = cursor.add(1, 'day')
  }
  return days
}

export async function recordAndGetFooterVisitorMetrics(
  reqHeaders: HeaderReader
): Promise<FooterVisitorMetrics> {
  const today = getDate(SHANGHAI_TZ)
  const dayStr = today.format('YYYYMMDD')
  const member = resolveVisitorDigest(reqHeaders)

  const recorded = await redis.recordVisitorAndCountWeekly({
    weeklyKey: kvKeys.weeklyVisitors,
    windowSeconds: WEEKLY_WINDOW_SECONDS,
    dailyKey: kvKeys.dailyVisitors(dayStr),
    dailyTtlSeconds: DAILY_RETENTION_SECONDS,
    sinceKey: kvKeys.dailyVisitorsSince,
    dayStr,
    member,
  })

  if (!recorded) {
    return { weeklyVisitors: null, trend: null }
  }

  const effectiveSince = recorded.dailySince ?? (member ? dayStr : null)
  if (!effectiveSince) {
    return { weeklyVisitors: recorded.weeklyCount, trend: null }
  }

  const range = buildDailyDateRange(today, effectiveSince)
  const counts = await redis.scardMany(
    range.map((item) => kvKeys.dailyVisitors(item.keyDay))
  )
  if (counts === null) {
    return { weeklyVisitors: recorded.weeklyCount, trend: null }
  }

  const points: DailyVisitorPoint[] = range.map((item, idx) => ({
    date: item.isoDate,
    count: counts[idx] ?? 0,
  }))
  const total = points.reduce((sum, point) => sum + point.count, 0)

  return {
    weeklyVisitors: recorded.weeklyCount,
    trend: {
      points,
      windowDays: points.length,
      total,
    },
  }
}

export async function getOnlineVisitorCount(
  postId?: string
): Promise<number | null> {
  if (isBuildPhase) {
    return null
  }
  const key = postId
    ? kvKeys.postOnlineVisitors(postId)
    : kvKeys.onlineVisitors
  const count = await redis.rollingUniqueCount(key, ONLINE_WINDOW_SECONDS)
  return count === null ? 1 : Math.max(1, count)
}

export function getMockFooterVisitorMetrics(): FooterVisitorMetrics {
  const todayStart = getDate(SHANGHAI_TZ).startOf('day')
  const len = MOCK_DAILY_COUNTS.length
  const points: DailyVisitorPoint[] = MOCK_DAILY_COUNTS.map((count, idx) => ({
    date: todayStart.subtract(len - 1 - idx, 'day').format('YYYY-MM-DD'),
    count,
  }))
  const total = points.reduce((sum, point) => sum + point.count, 0)
  const weeklyVisitors = points
    .slice(-7)
    .reduce((sum, point) => sum + point.count, 0)

  return {
    weeklyVisitors,
    trend: {
      points,
      windowDays: points.length,
      total,
    },
  }
}
