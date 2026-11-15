import { count, isNotNull } from 'drizzle-orm'
import { headers } from 'next/headers'
import React from 'react'

import { CursorClickIcon, UsersIcon } from '~/assets'
import { PeekabooLink } from '~/components/links/PeekabooLink'
import { Container } from '~/components/ui/Container'
import { kvKeys } from '~/config/kv'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import { env } from '~/env.mjs'
import countries from '~/lib/countries.json'
import { prettifyNumber } from '~/lib/math'
import { redis } from '~/lib/redis'

import { Newsletter } from './Newsletter'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

async function TotalPageViews() {
  let views: number
  if (env.VERCEL_ENV === 'production' && !isBuildPhase) {
    views = await redis.incr(kvKeys.totalPageViews)
  } else {
    views = 345678
  }

  return (
    <span className="flex items-center justify-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 md:justify-start">
      <UsersIcon className="h-4 w-4" />
      <span title={`${Intl.NumberFormat('en-US').format(views)}次浏览`}>
        总浏览量&nbsp;
        <span className="font-medium">{prettifyNumber(views, true)}</span>
      </span>
    </span>
  )
}

type VisitorGeolocation = {
  country: string
  city?: string
  flag: string
}
async function LastVisitorInfo() {
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
      <CursorClickIcon className="h-4 w-4" />
      <span>
        最近访客来自&nbsp;
        {[lastVisitor.city, lastVisitor.country].filter(Boolean).join(', ')}
      </span>
      <span className="font-medium">{lastVisitor.flag}</span>
    </span>
  )
}

export async function Footer() {
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
              <Newsletter subCount={`${subCount}`} />
            </div>
            <div className="flex flex-col items-center justify-start gap-6 sm:flex-row">
              <p className="text-sm text-zinc-500/80 dark:text-zinc-400/80">
                &copy; {new Date().getFullYear()} 阿梁（lmingyul）. 网站是 Fork 另一个项目：
                <PeekabooLink href="https://github.com/lmingyul/lmingyul.tech">
                  GitHub
                </PeekabooLink>
              </p>
            </div>
          </Container.Inner>
          <Container.Inner className="mt-6">
            <div className="flex flex-col items-center justify-start gap-2 sm:flex-row">
              <React.Suspense>
                <TotalPageViews />
              </React.Suspense>
              <React.Suspense>
                <LastVisitorInfo />
              </React.Suspense>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}
