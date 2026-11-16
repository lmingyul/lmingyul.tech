import { type MetadataRoute } from 'next'

import { url } from '~/lib'
import { getAiDailyIssues, getAllLatestBlogPostSlugs } from '~/sanity/queries'

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
  ] satisfies MetadataRoute.Sitemap

  const [slugs, aiIssues] = await Promise.all([
    getAllLatestBlogPostSlugs(),
    getAiDailyIssues(),
  ])

  const dynamicMap = slugs.map((slug) => ({
    url: url(`/blog/${slug}`).href,
    lastModified: new Date(),
  })) satisfies MetadataRoute.Sitemap

  const aiDailyMap = aiIssues.map((issue) => ({
    url: url(`/ai/${issue.slug}`).href,
    lastModified: new Date(issue.date),
  })) satisfies MetadataRoute.Sitemap

  return [...staticMap, ...dynamicMap, ...aiDailyMap]
}

export const dynamic = 'force-dynamic'
export const revalidate = 60
