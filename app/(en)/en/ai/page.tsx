import { type Metadata } from 'next'

import { AiDailyView } from '~/app/(main)/ai/AiDailyView'
import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { buildAiDailyJsonLd } from '~/lib/structured-data'
import { getAiDailyIssue, getAiDailyIssues } from '~/sanity/queries'

const t = getMessages('en').aiDaily

export const metadata = {
  title: t.metaTitle,
  description: t.metaDescription,
  openGraph: {
    title: t.metaTitle,
    description: t.metaDescription,
  },
  twitter: {
    title: t.metaTitle,
    description: t.metaDescription,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: url('/en/ai').href,
    languages: {
      'zh-CN': url('/ai').href,
      en: url('/en/ai').href,
      'x-default': url('/ai').href,
    },
    types: {
      'application/rss+xml': [
        { url: '/en/ai/feed.xml', title: 'AI Daily Digest RSS' },
      ],
    },
  },
} satisfies Metadata

export default async function EnAiIndexPage() {
  const [issues, latestIssue] = await Promise.all([
    getAiDailyIssues('en'),
    getAiDailyIssue(undefined, 'en'),
  ])

  return (
    <>
      <JsonLd
        data={buildAiDailyJsonLd({
          issue: latestIssue,
          issuesCount: issues.length,
          isIndexPage: true,
          locale: 'en',
        })}
      />
      <AiDailyView
        issues={issues}
        activeIssue={latestIssue}
        isIndexPage
        locale="en"
      />
    </>
  )
}

export const revalidate = 60
