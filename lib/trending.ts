import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { getDate } from '~/lib/date'
import { getMessages, type Locale, localizePath } from '~/lib/i18n'
import { redis } from '~/lib/redis'
import { type HeaderReader, resolveVisitorDigest } from '~/lib/visitor-stats'
import { getAiDailyIssues, getLatestBlogPosts } from '~/sanity/queries'
import { type Post } from '~/sanity/schemas/post'

const SEEN_TTL_SECONDS = 2 * 24 * 60 * 60
const DAY_TTL_SECONDS = 190 * 24 * 60 * 60
const TRENDING_LIMIT = 3
const WINDOW_DAYS = [7, 30, 180] as const

export type TrendingTarget = `post:${string}` | 'ai'

export type TrendingItem =
  | {
      kind: 'post'
      key: string
      href: string
      title: string
      publishedAt: string
      readingTime: number
      imageUrl: string
      lqip?: string
      dominant?: {
        background?: string
        foreground?: string
      }
      isFallback: boolean
      visitors: number | null
    }
  | {
      kind: 'ai'
      key: 'ai'
      href: string
      title: string
      latestTitle?: string
      latestDate?: string
      latestIsFallback?: boolean
      issueCount: number
      visitors: number | null
    }

function buildDayKeys(days: number): string[] {
  const today = getDate()
  const keys: string[] = []
  for (let offset = 0; offset < days; offset++) {
    keys.push(kvKeys.trendingDay(today.subtract(offset, 'day').format('YYYYMMDD')))
  }
  return keys
}

export async function recordContentView(
  reqHeaders: HeaderReader,
  target: TrendingTarget
): Promise<void> {
  if (env.VERCEL_ENV !== 'production') {
    return
  }

  try {
    const visitor = resolveVisitorDigest(reqHeaders)
    if (!visitor) {
      return
    }
    const day = getDate().format('YYYYMMDD')
    await redis.trackDailyUnique(
      kvKeys.trendingSeen(day, target),
      kvKeys.trendingDay(day),
      visitor,
      target,
      SEEN_TTL_SECONDS,
      DAY_TTL_SECONDS
    )
  } catch (err) {
    console.error('[Trending.recordContentView]', err)
  }
}

export async function getTrendingItems(
  locale: Locale = 'zh'
): Promise<TrendingItem[]> {
  const [postsResult, aiIssues] = await Promise.all([
    getLatestBlogPosts({
      limit: 1000,
      locale,
      preferTranslated: locale === 'en',
    }),
    getAiDailyIssues(locale),
  ])

  const posts: Post[] = postsResult ?? []
  const postById = new Map<string, Post>(posts.map((post) => [post._id, post]))
  const latestAi = aiIssues[0]
  const tHome = getMessages(locale).home

  const resolveTarget = (
    member: string,
    visitors: number | null
  ): TrendingItem | null => {
    if (member === 'ai') {
      return {
        kind: 'ai',
        key: 'ai',
        href: localizePath('/ai', locale),
        title: tHome.trendingAiTitle,
        latestTitle: latestAi?.title,
        latestDate: latestAi?.date,
        latestIsFallback: locale === 'en' && Boolean(latestAi?.isFallback),
        issueCount: aiIssues.length,
        visitors,
      }
    }

    if (member.startsWith('post:')) {
      const postId = member.slice('post:'.length)
      const post = postById.get(postId)
      if (!post) {
        return null
      }
      return {
        kind: 'post',
        key: member,
        href: localizePath(`/blog/${post.slug}`, locale),
        title: post.title,
        publishedAt: post.publishedAt,
        readingTime: post.readingTime,
        imageUrl: post.mainImage.asset.url,
        lqip: post.mainImage.asset.lqip,
        dominant: post.mainImage.asset.dominant,
        isFallback: locale === 'en' && Boolean(post.isFallback),
        visitors,
      }
    }

    return null
  }

  if (env.VERCEL_ENV !== 'production') {
    const preview: TrendingItem[] = []
    const aiPreview = resolveTarget('ai', 42)
    if (aiPreview) {
      preview.push(aiPreview)
    }
    posts.slice(0, 2).forEach((post, idx) => {
      const resolved = resolveTarget(`post:${post._id}`, idx === 0 ? 18 : 7)
      if (resolved) {
        preview.push(resolved)
      }
    })
    return preview.slice(0, TRENDING_LIMIT)
  }

  let selected: TrendingItem[] = []

  for (const days of WINDOW_DAYS) {
    const ranked = await redis.zunionWithScores(buildDayKeys(days))
    if (ranked === null) {
      return []
    }

    const resolved: TrendingItem[] = []
    const seen = new Set<string>()
    for (const [member, score] of ranked) {
      if (seen.has(member)) continue
      const item = resolveTarget(member, Math.round(score))
      if (!item) continue
      seen.add(member)
      resolved.push(item)
      if (resolved.length >= TRENDING_LIMIT) {
        break
      }
    }

    selected = resolved
    if (selected.length >= TRENDING_LIMIT) {
      break
    }
  }

  if (selected.length < TRENDING_LIMIT && posts.length > 0) {
    const selectedKeys = new Set(selected.map((item) => item.key))
    const remainingPosts = posts.filter(
      (post) => !selectedKeys.has(`post:${post._id}`)
    )

    if (remainingPosts.length > 0) {
      const viewKeys = remainingPosts.map((post) => kvKeys.postViews(post._id))
      const rawViews = await redis.mget<Array<number | null>>(...viewKeys)
      const rankedFallback = remainingPosts
        .map((post, index) => ({
          post,
          index,
          views: Number(rawViews[index] ?? 0) || 0,
        }))
        .sort((a, b) =>
          b.views !== a.views ? b.views - a.views : a.index - b.index
        )

      for (const entry of rankedFallback) {
        if (selected.length >= TRENDING_LIMIT) {
          break
        }
        const item = resolveTarget(`post:${entry.post._id}`, null)
        if (item) {
          selected.push(item)
        }
      }
    }
  }

  return selected.slice(0, TRENDING_LIMIT)
}
