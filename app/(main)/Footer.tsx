import { count, isNotNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import React from 'react'

import { CursorClickIcon, EyeOpenIcon, UsersIcon } from '~/assets'
import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { kvKeys } from '~/config/kv'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import { env } from '~/env.mjs'
import countries from '~/lib/countries.json'
import { getMessages, type Locale } from '~/lib/i18n'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'
import { recordAndCountWeeklyVisitors } from '~/lib/visitor-stats'

import { Newsletter } from './Newsletter'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

async function TotalPageViews({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer
  let views: number
  if (env.VERCEL_ENV === 'production' && !isBuildPhase) {
    views = await redis.incr(kvKeys.totalPageViews)
  } else {
    views = 345678
  }

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <EyeOpenIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span title={t.viewsTitle(Intl.NumberFormat('en-US').format(views))}>
        {t.totalViews}&nbsp;
        <span className="font-medium tabular-nums">
          {prettifyNumber(views, locale !== 'en')}
        </span>
      </span>
    </span>
  )
}

async function WeeklyVisitors({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer
  let visitors: number | null
  if (env.VERCEL_ENV === 'production' && !isBuildPhase) {
    visitors = await recordAndCountWeeklyVisitors(headers())
  } else {
    visitors = 128
  }

  if (visitors === null) {
    return null
  }

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <UsersIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span
        title={t.weeklyVisitorsTitle(
          Intl.NumberFormat('en-US').format(visitors)
        )}
      >
        {t.weeklyVisitors}&nbsp;
        <span className="font-medium tabular-nums">
          {prettifyNumber(visitors, locale !== 'en')}
        </span>
      </span>
    </span>
  )
}

type VisitorGeolocation = {
  country: string
  city?: string
  flag: string
}
async function LastVisitorInfo({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer
  let lastVisitor: VisitorGeolocation | undefined = undefined
  if (env.VERCEL_ENV === 'production' && !isBuildPhase) {
    const reqHeaders = headers()
    const cfCountry = reqHeaders.get('cf-ipcountry')
    const cfCity = reqHeaders.get('cf-ipcity') ?? undefined

    const prevVisitor = await redis.get<VisitorGeolocation>(kvKeys.lastVisitor)
    if (prevVisitor) {
      lastVisitor = prevVisitor
    }

    if (cfCountry) {
      const countryInfo = countries.find((x) => x.cca2 === cfCountry)
      if (countryInfo) {
        const currentVisitor: VisitorGeolocation = {
          country: cfCountry,
          city: cfCity,
          flag: countryInfo.flag,
        }
        await redis.set(kvKeys.lastVisitor, currentVisitor)
        if (!lastVisitor) {
          lastVisitor = currentVisitor
        }
      }
    }
  }

  if (!lastVisitor) {
    lastVisitor = {
      country: 'US',
      flag: '🇺🇸',
    }
  }

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <CursorClickIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        {t.lastVisitorFrom}&nbsp;
        {[lastVisitor.city, lastVisitor.country].filter(Boolean).join(', ')}
      </span>
      <span className="font-medium">{lastVisitor.flag}</span>
    </span>
  )
}

export async function Footer({ locale = 'zh' }: { locale?: Locale }) {
  const t = getMessages(locale).footer
  let subCount = 0
  if (!isBuildPhase) {
    const [subs] = await db
      .select({
        subCount: count(),
      })
      .from(subscribers)
      .where(isNotNull(subscribers.subscribedAt))
    subCount = subs?.subCount ?? 0
  }

  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-t border-zinc-100 pb-24 pt-10 dark:border-zinc-700/40 sm:pb-28">
          <Container.Inner>
            <div className="mx-auto mb-8 max-w-md">
              <Newsletter subCount={`${subCount}`} locale={locale} />
            </div>
            <div className="flex flex-col items-center justify-start gap-6 sm:flex-row">
              <p className="text-sm text-zinc-500/80 dark:text-zinc-400/80">
                &copy; {new Date().getFullYear()}{' '}
                {locale === 'en' ? 'Liang (lmingyul)' : '阿梁（lmingyul）'}.{' '}
                {t.forkPrefix}
                <PeekabooLink href="https://github.com/lmingyul/lmingyul.tech">
                  GitHub
                </PeekabooLink>
              </p>
            </div>
          </Container.Inner>
          <Container.Inner className="mt-6">
            <div className="flex flex-col items-center justify-start gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
              <React.Suspense>
                <TotalPageViews locale={locale} />
              </React.Suspense>
              <React.Suspense>
                <WeeklyVisitors locale={locale} />
              </React.Suspense>
              <React.Suspense>
                <LastVisitorInfo locale={locale} />
              </React.Suspense>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}
