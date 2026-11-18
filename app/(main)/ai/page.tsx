import { type Metadata } from 'next'
import { headers } from 'next/headers'

import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { buildAiDailyJsonLd } from '~/lib/structured-data'
import { recordContentView } from '~/lib/trending'
import { getAiDailyIssue, getAiDailyIssues } from '~/sanity/queries'

import { AiDailyView } from './AiDailyView'

const title = 'AI 每日简讯'
const description =
  '阿梁（lmingyul）的 AI 每日简讯与日报归档，持续记录大模型、Agent 工程与开源前沿信号。'

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: url('/ai').href,
    languages: {
      'zh-CN': url('/ai').href,
      en: url('/en/ai').href,
      'x-default': url('/ai').href,
    },
    types: {
      'application/rss+xml': [
        { url: '/ai/feed.xml', title: 'AI 每日简讯 RSS' },
      ],
    },
  },
} satisfies Metadata

export default async function AiIndexPage() {
  const [issues, latestIssue] = await Promise.all([
    getAiDailyIssues(),
    getAiDailyIssue(),
  ])

  await recordContentView(headers(), 'ai')

  return (
    <>
      <JsonLd
        data={buildAiDailyJsonLd({
          issue: latestIssue,
          issuesCount: issues.length,
          isIndexPage: true,
          locale: 'zh',
        })}
      />
      <AiDailyView issues={issues} activeIssue={latestIssue} isIndexPage />
    </>
  )
}

export const revalidate = 60
