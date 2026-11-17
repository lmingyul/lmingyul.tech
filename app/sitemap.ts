import { type MetadataRoute } from 'next'

import { url } from '~/lib'
import {
  getAiDailyIssues,
  getAllLatestBlogPostSlugs,
  getTranslatedEnglishAiDailySlugs,
  getTranslatedEnglishPostSlugs,
} from '~/sanity/queries'

export default async function sitemap() {
  const staticMap = [
    {
      url: url('/').href,
      lastModified: new Date(),
    },
    {
      url: url('/blog').href,
      lastModified: new Date(),
    },
    {
      url: url('/ai').href,
      lastModified: new Date(),
    },
    {
      url: url('/projects').href,
      lastModified: new Date(),
    },
    {
      url: url('/guestbook').href,
      lastModified: new Date(),
    },
    {
      url: url('/about').href,
      lastModified: new Date(),
    },
    {
      url: url('/en').href,
      lastModified: new Date(),
    },
    {
      url: url('/en/blog').href,
      lastModified: new Date(),
    },
    {
      url: url('/en/ai').href,
      lastModified: new Date(),
    },
    {
      url: url('/en/guestbook').href,
      lastModified: new Date(),
    },
    {
      url: url('/en/about').href,
      lastModified: new Date(),
    },
  ] satisfies MetadataRoute.Sitemap

  const [slugs, enSlugs, aiIssues, enAiSlugs] = await Promise.all([
    getAllLatestBlogPostSlugs('zh'),
    getTranslatedEnglishPostSlugs(),
    getAiDailyIssues('zh'),
    getTranslatedEnglishAiDailySlugs(),
  ])

  const dynamicMap = slugs.map((slug) => ({
    url: url(`/blog/${slug}`).href,
    lastModified: new Date(),
  })) satisfies MetadataRoute.Sitemap

  const enDynamicMap = enSlugs.map((slug) => ({
    url: url(`/en/blog/${slug}`).href,
    lastModified: new Date(),
  })) satisfies MetadataRoute.Sitemap

  const aiDailyMap = aiIssues.map((issue) => ({
    url: url(`/ai/${issue.slug}`).href,
    lastModified: new Date(issue.date),
  })) satisfies MetadataRoute.Sitemap

  const enAiSet = new Set(enAiSlugs)
  const enAiDailyMap = aiIssues
    .filter((issue) => enAiSet.has(issue.slug))
    .map((issue) => ({
      url: url(`/en/ai/${issue.slug}`).href,
      lastModified: new Date(issue.date),
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
