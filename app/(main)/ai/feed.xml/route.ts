import RSS from 'rss'

import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { seo } from '~/lib/seo'
import { getAiDailyIssues } from '~/sanity/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const aiDailyMsg = getMessages('zh').aiDaily

export async function GET() {
  const feed = new RSS({
    title: `${aiDailyMsg.badge} | ${seo.title}`,
    description: aiDailyMsg.metaDescription,
    site_url: url('/ai').href,
    feed_url: url('/ai/feed.xml').href,
    language: 'zh-CN',
    image_url: url('/opengraph-image.png').href,
    generator: 'Next.js (lmingyul.top)',
  })

  const issues = (await getAiDailyIssues('zh')).slice(0, 60)

  issues.forEach((issue) => {
    feed.item({
      title: issue.title,
      guid: `ai-daily:${issue.slug}`,
      url: url(`/ai/${issue.slug}`).href,
      description:
        issue.summary || aiDailyMsg.issueSummaryFallback(issue.date),
      categories: issue.tags,
      date: new Date(`${issue.date}T08:00:00+08:00`),
    })
  })

  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  })
}
