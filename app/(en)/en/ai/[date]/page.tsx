import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AiDailyView } from '~/app/(main)/ai/AiDailyView'
import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { buildAiDailyJsonLd } from '~/lib/structured-data'
import { getAiDailyIssue, getAiDailyIssues } from '~/sanity/queries'

const t = getMessages('en').aiDaily

export async function generateMetadata({
  params,
}: {
  params: { date: string }
}): Promise<Metadata> {
  const issue = await getAiDailyIssue(params.date, 'en')
  if (!issue) {
    return { title: t.notFoundTitle }
  }

  const description = issue.summary || t.issueSummaryFallback(issue.date)
  const zhUrl = url(`/ai/${issue.slug}`).href
  const enUrl = url(`/en/ai/${issue.slug}`).href

  return {
    title: issue.title,
    description,
    openGraph: {
      title: issue.title,
      description,
    },
    twitter: {
      title: issue.title,
      description,
      card: 'summary_large_image',
    },
    ...(issue.isFallback
      ? {
          alternates: {
            canonical: zhUrl,
          },
          robots: {
            index: false,
            follow: true,
          },
        }
      : {
          alternates: {
            canonical: enUrl,
            languages: {
              'zh-CN': zhUrl,
              en: enUrl,
              'x-default': zhUrl,
            },
          },
        }),
  }
}

export default async function EnAiDailyIssuePage({
  params,
}: {
  params: { date: string }
}) {
  const [issues, activeIssue] = await Promise.all([
    getAiDailyIssues('en'),
    getAiDailyIssue(params.date, 'en'),
  ])

  if (!activeIssue) {
    notFound()
  }

  return (
    <>
      {!activeIssue.isFallback && (
        <JsonLd
          data={buildAiDailyJsonLd({
            issue: activeIssue,
            issuesCount: issues.length,
            locale: 'en',
          })}
        />
      )}
      <AiDailyView issues={issues} activeIssue={activeIssue} locale="en" />
    </>
  )
}

export const revalidate = 60
