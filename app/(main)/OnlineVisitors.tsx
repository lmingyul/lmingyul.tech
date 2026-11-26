'use client'

import React from 'react'

import { getMessages, type Locale } from '~/lib/i18n'
import { prettifyNumber } from '~/lib/math'
import {
  acquirePostPresence,
  acquireSitePresence,
  getOnlineSnapshot,
  getServerOnlineSnapshot,
  subscribeOnlinePresence,
} from '~/lib/online-presence'

type OnlineVisitorsProps =
  | {
      variant: 'footer'
      initialCount: number | null
      locale: Locale
    }
  | {
      variant: 'post'
      postId: string
      initialCount: number | null
      locale: Locale
    }

function PulsingDot() {
  return (
    <span
      className="relative flex h-2 w-2 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-500/75 motion-reduce:animate-none dark:bg-lime-400/75" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-600 dark:bg-lime-400" />
    </span>
  )
}

export function OnlineVisitors(props: OnlineVisitorsProps) {
  const snapshot = React.useSyncExternalStore(
    subscribeOnlinePresence,
    getOnlineSnapshot,
    getServerOnlineSnapshot
  )

  const postId = props.variant === 'post' ? props.postId : null

  React.useEffect(() => {
    if (postId) {
      return acquirePostPresence(postId)
    }
    return acquireSitePresence()
  }, [postId])

  const liveCount =
    props.variant === 'footer'
      ? snapshot.site
      : snapshot.postCounts.get(props.postId) ?? null
  const rawCount = liveCount ?? props.initialCount
  if (rawCount === null) {
    return null
  }

  const displayCount = Math.max(1, rawCount)
  const formattedExact = Intl.NumberFormat('en-US').format(displayCount)
  const formattedShort = prettifyNumber(displayCount, props.locale !== 'en')

  if (props.variant === 'post') {
    const t = getMessages(props.locale).blog
    return (
      <span
        className="inline-flex items-center space-x-1.5"
        title={t.onlineReadingTitle(formattedExact)}
      >
        <PulsingDot />
        <span>
          <span className="tabular-nums">{formattedShort}</span>
          {t.onlineReadingSuffix}
        </span>
      </span>
    )
  }

  const t = getMessages(props.locale).footer
  return (
    <span className="flex items-center justify-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <PulsingDot />
      <span title={t.onlineNowTitle(formattedExact)}>
        {props.locale === 'en' ? (
          <>
            <span className="font-medium tabular-nums">{formattedShort}</span>{' '}
            {t.onlineNow}
          </>
        ) : (
          <>
            {t.onlineNow}&nbsp;
            <span className="font-medium tabular-nums">{formattedShort}</span>
          </>
        )}
      </span>
    </span>
  )
}
