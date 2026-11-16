import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAiDailyIssue, getAiDailyIssues } from '~/sanity/queries'

import { AiDailyView } from '../AiDailyView'

export async function generateMetadata({
  params,
}: {
  params: { date: string }
}): Promise<Metadata> {
  const issue = await getAiDailyIssue(params.date)
  if (!issue) {
    return { title: '未找到该期简讯' }
  }

  const description =
    issue.summary || `阿梁 AI 每日简讯（${issue.date}）归档内容。`

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
  }
}

export default async function AiDailyIssuePage({
  params,
}: {
  params: { date: string }
}) {
  const [issues, activeIssue] = await Promise.all([
    getAiDailyIssues(),
    getAiDailyIssue(params.date),
  ])

  if (!activeIssue) {
    notFound()
  }

  return <AiDailyView issues={issues} activeIssue={activeIssue} />
}

export const revalidate = 60
