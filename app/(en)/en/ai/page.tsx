import { type Metadata } from 'next'

import { AiDailyView } from '~/app/(main)/ai/AiDailyView'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
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
  },
} satisfies Metadata

export default async function EnAiIndexPage() {
  const [issues, latestIssue] = await Promise.all([
    getAiDailyIssues('en'),
    getAiDailyIssue(undefined, 'en'),
  ])

  return (
    <AiDailyView
      issues={issues}
      activeIssue={latestIssue}
      isIndexPage
      locale="en"
    />
  )
}

export const revalidate = 60
