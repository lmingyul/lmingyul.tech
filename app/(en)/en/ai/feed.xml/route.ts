import RSS from 'rss'

import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { getAiDailyIssues } from '~/sanity/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const enMsg = getMessages('en')

export async function GET() {
  const feed = new RSS({
    title: `${enMsg.aiDaily.metaTitle} | ${enMsg.seo.siteName}`,
    description: enMsg.aiDaily.metaDescription,
    site_url: url('/en/ai').href,
    feed_url: url('/en/ai/feed.xml').href,
    language: 'en',
    image_url: url('/opengraph-image.png').href,
    generator: 'Next.js (lmingyul.top)',
  })

  const issues = (await getAiDailyIssues('en')).slice(0, 60)

  issues.forEach((issue) => {
    const issueUrl = url(
      issue.isFallback ? `/ai/${issue.slug}` : `/en/ai/${issue.slug}`
    ).href
    feed.item({
      title: issue.title,
      guid: `ai-daily:${issue.isFallback ? 'zh' : 'en'}:${issue.slug}`,
      url: issueUrl,
      description:
        issue.summary || enMsg.aiDaily.issueSummaryFallback(issue.date),
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
