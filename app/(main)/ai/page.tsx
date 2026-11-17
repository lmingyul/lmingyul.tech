import { type Metadata } from 'next'

import { url } from '~/lib'
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
  },
} satisfies Metadata

export default async function AiIndexPage() {
  const [issues, latestIssue] = await Promise.all([
    getAiDailyIssues(),
    getAiDailyIssue(),
  ])

  return (
    <AiDailyView issues={issues} activeIssue={latestIssue} isIndexPage />
  )
}

export const revalidate = 60
