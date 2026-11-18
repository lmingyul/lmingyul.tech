import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

import { getLatestBlogPosts } from '~/lib/content'
import { getDate } from '~/lib/date'
import { type Locale, localizePath } from '~/lib/i18n'

dayjs.extend(utc)
dayjs.extend(timezone)

const TZ = 'Asia/Shanghai'

export type ActivityPost = {
  title: string
  href: string
  /** 'YYYY-MM-DD' in Asia/Shanghai */
  date: string
}

export type WritingActivity = {
  /** 'YYYY-MM-DD' in Asia/Shanghai */
  today: string
  /** Dates with at least one post; reverse-chronological within the same day */
  days: Record<string, ActivityPost[]>
  /** Descending list of calendar years from today back to first post year */
  years: number[]
}

export async function getWritingActivity(
  locale: Locale
): Promise<WritingActivity> {
  const posts =
    (await getLatestBlogPosts({ limit: Number.MAX_SAFE_INTEGER, locale })) ?? []

  const days: Record<string, ActivityPost[]> = {}
  for (const post of posts) {
    const date = dayjs(post.publishedAt).tz(TZ).format('YYYY-MM-DD')
    ;(days[date] ??= []).push({
      title: post.title,
      href: localizePath(`/blog/${post.slug}`, locale),
      date,
    })
  }

  const today = getDate(TZ).format('YYYY-MM-DD')
  const currentYear = Number(today.slice(0, 4))
  const dayYears = Object.keys(days).map((d) => Number(d.slice(0, 4)))
  const firstYear = Math.min(currentYear, ...dayYears)
  const years = Array.from(
    { length: currentYear - firstYear + 1 },
    (_, i) => currentYear - i
  )

  return { today, days, years }
}
