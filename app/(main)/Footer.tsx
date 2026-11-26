import { headers } from 'next/headers'
import React from 'react'

import { CursorClickIcon, EyeOpenIcon, UsersIcon } from '~/assets'
import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import countries from '~/lib/countries.json'
import { getMessages, type Locale } from '~/lib/i18n'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'
import {
  getMockFooterVisitorMetrics,
  getOnlineVisitorCount,
  recordAndGetFooterVisitorMetrics,
} from '~/lib/visitor-stats'

import { OnlineVisitors } from './OnlineVisitors'
import { VisitorTrendChart } from './VisitorTrendChart'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

function TotalPageViews({
  views,
  locale,
}: {
  views: number | null
  locale: Locale
}) {
  if (views === null) {
    return null
  }
  const t = getMessages(locale).footer

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

function WeeklyVisitors({
  visitors,
  locale,
}: {
  visitors: number | null
  locale: Locale
}) {
  if (visitors === null) {
    return null
  }
  const t = getMessages(locale).footer

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

async function resolveLastVisitor(
  reqHeaders: Pick<Headers, 'get'>
): Promise<VisitorGeolocation> {
  let lastVisitor: VisitorGeolocation | undefined = undefined
  if (env.VERCEL_ENV === 'production' && !isBuildPhase) {
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

  return (
    lastVisitor ?? {
      country: 'US',
      flag: '🇺🇸',
    }
  )
}

function LastVisitorInfo({
  lastVisitor,
  locale,
}: {
  lastVisitor: VisitorGeolocation
  locale: Locale
}) {
  const t = getMessages(locale).footer

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

function FooterCopyright({ locale }: { locale: Locale }) {
  const t = getMessages(locale).footer

  return (
    <p className="text-sm text-zinc-500/80 dark:text-zinc-400/80">
      &copy; {new Date().getFullYear()}{' '}
      {locale === 'en' ? 'Liang (lmingyul)' : '阿梁（lmingyul）'}.{' '}
      {t.forkPrefix}
      <PeekabooLink href="https://github.com/lmingyul/lmingyul.tech">
        GitHub
      </PeekabooLink>
    </p>
  )
}

async function FooterBody({ locale }: { locale: Locale }) {
  const isProdRuntime = env.VERCEL_ENV === 'production' && !isBuildPhase
  const reqHeaders = isProdRuntime ? headers() : new Headers()

  const [totalViews, visitorMetrics, onlineCount, lastVisitor] =
    await Promise.all([
      isBuildPhase
        ? Promise.resolve(null)
        : isProdRuntime
          ? redis.incr(kvKeys.totalPageViews)
          : Promise.resolve(345678),
      isBuildPhase
        ? Promise.resolve({ weeklyVisitors: null, trend: null })
        : isProdRuntime
          ? recordAndGetFooterVisitorMetrics(reqHeaders)
          : Promise.resolve(getMockFooterVisitorMetrics()),
      getOnlineVisitorCount(),
      resolveLastVisitor(reqHeaders),
    ])

  return (
    <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="flex flex-col items-center gap-4 text-center md:items-start md:text-left">
        <FooterCopyright locale={locale} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:justify-start">
          <TotalPageViews views={totalViews} locale={locale} />
          <WeeklyVisitors
            visitors={visitorMetrics.weeklyVisitors}
            locale={locale}
          />
          <OnlineVisitors
            variant="footer"
            initialCount={onlineCount}
            locale={locale}
          />
          <LastVisitorInfo lastVisitor={lastVisitor} locale={locale} />
        </div>
      </div>

      {visitorMetrics.trend && (
        <VisitorTrendChart
          points={visitorMetrics.trend.points}
          locale={locale}
        />
      )}
    </div>
  )
}

export function Footer({ locale = 'zh' }: { locale?: Locale }) {
  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-t border-zinc-100 pb-24 pt-10 dark:border-zinc-700/40 sm:pb-28">
          <Container.Inner>
            <React.Suspense
              fallback={
                <div className="flex flex-col items-center text-center md:items-start md:text-left">
                  <FooterCopyright locale={locale} />
                </div>
              }
            >
              <FooterBody locale={locale} />
            </React.Suspense>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}
