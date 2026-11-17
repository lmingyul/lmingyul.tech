import { type MetadataRoute } from 'next'

import { url } from '~/lib'
import { getAiDailyIssues, getLatestBlogPosts } from '~/sanity/queries'

const DEFAULT_LAST_MOD = new Date('2026-01-01T00:00:00.000Z')

function toValidDate(input?: string, fallback: Date = DEFAULT_LAST_MOD): Date {
  if (!input) return fallback
  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function pickLatestDate(dates: Date[], fallback: Date = DEFAULT_LAST_MOD): Date {
  if (dates.length === 0) return fallback
  return dates.reduce(
    (latest, cur) => (cur.getTime() > latest.getTime() ? cur : latest),
    dates[0] ?? fallback
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [zhPosts, enPosts, zhAiIssues, enAiIssues] = await Promise.all([
    getLatestBlogPosts({ limit: 999, locale: 'zh' }),
    getLatestBlogPosts({ limit: 999, locale: 'en' }),
    getAiDailyIssues('zh'),
    getAiDailyIssues('en'),
  ])

  const zhPostList = zhPosts ?? []
  const enTranslatedPosts = (enPosts ?? []).filter((post) => !post.isFallback)
  const enTranslatedAiIssues = enAiIssues.filter((issue) => !issue.isFallback)

  const latestZhPostDate = pickLatestDate(
    zhPostList.map((post) => toValidDate(post.publishedAt))
  )
  const latestEnPostDate = pickLatestDate(
    enTranslatedPosts.map((post) => toValidDate(post.publishedAt)),
    latestZhPostDate
  )
  const latestZhAiDate = zhAiIssues[0]
    ? toValidDate(zhAiIssues[0].date, latestZhPostDate)
    : latestZhPostDate
  const latestEnAiDate = enTranslatedAiIssues[0]
    ? toValidDate(enTranslatedAiIssues[0].date, latestZhAiDate)
    : latestZhAiDate
  const latestSiteDate = pickLatestDate([latestZhPostDate, latestZhAiDate])

  const staticMap = [
    {
      url: url('/').href,
      lastModified: latestSiteDate,
    },
    {
      url: url('/blog').href,
      lastModified: latestZhPostDate,
    },
    {
      url: url('/ai').href,
      lastModified: latestZhAiDate,
    },
    {
      url: url('/projects').href,
      lastModified: DEFAULT_LAST_MOD,
    },
    {
      url: url('/guestbook').href,
      lastModified: DEFAULT_LAST_MOD,
    },
    {
      url: url('/about').href,
      lastModified: DEFAULT_LAST_MOD,
    },
    {
      url: url('/en').href,
      lastModified: latestSiteDate,
    },
    {
      url: url('/en/blog').href,
      lastModified: latestEnPostDate,
    },
    {
      url: url('/en/ai').href,
      lastModified: latestEnAiDate,
    },
    {
      url: url('/en/guestbook').href,
      lastModified: DEFAULT_LAST_MOD,
    },
    {
      url: url('/en/about').href,
      lastModified: DEFAULT_LAST_MOD,
    },
  ] satisfies MetadataRoute.Sitemap

  const dynamicMap = zhPostList.map((post) => ({
    url: url(`/blog/${post.slug}`).href,
    lastModified: toValidDate(post.publishedAt),
  })) satisfies MetadataRoute.Sitemap

  const enDynamicMap = enTranslatedPosts.map((post) => ({
    url: url(`/en/blog/${post.slug}`).href,
    lastModified: toValidDate(post.publishedAt),
  })) satisfies MetadataRoute.Sitemap

  const aiDailyMap = zhAiIssues.map((issue) => ({
    url: url(`/ai/${issue.slug}`).href,
    lastModified: toValidDate(issue.date),
  })) satisfies MetadataRoute.Sitemap

  const enAiDailyMap = enTranslatedAiIssues.map((issue) => ({
    url: url(`/en/ai/${issue.slug}`).href,
    lastModified: toValidDate(issue.date),
  })) satisfies MetadataRoute.Sitemap

  return [
    ...staticMap,
    ...dynamicMap,
    ...enDynamicMap,
    ...aiDailyMap,
    ...enAiDailyMap,
  ]
}

export const dynamic = 'force-dynamic'
export const revalidate = 60
