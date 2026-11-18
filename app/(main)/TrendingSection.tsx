import { extendDateTime, parseDateTime } from '@zolplay/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { LightningIcon, SparkleIcon } from '~/assets'
import { Container } from '~/components/ui/Container'
import { getMessages, type Locale } from '~/lib/i18n'
import { getTrendingItems } from '~/lib/trending'

extendDateTime()

export async function TrendingSection({
  locale = 'zh',
}: {
  locale?: Locale
}) {
  const items = await getTrendingItems(locale)
  if (items.length === 0) {
    return null
  }

  const messages = getMessages(locale)
  const tHome = messages.home
  const tBlog = messages.blog
  const tAi = messages.aiDaily
  const headingId = 'trending-section-heading'

  return (
    <Container className="mt-16 md:mt-20">
      <section aria-labelledby={headingId}>
        <h2
          id={headingId}
          className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          <LightningIcon
            className="h-5 w-5 flex-none text-lime-600 dark:text-lime-400"
            aria-hidden="true"
          />
          <span className="ml-2">{tHome.trending}</span>
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {items.map((item, idx) => {
            const rank = String(idx + 1).padStart(2, '0')
            const postDateText =
              item.kind === 'post'
                ? parseDateTime({
                    date: new Date(item.publishedAt),
                    timezone: 'Asia/Shanghai',
                  })?.format('YYYY/MM/DD') ?? item.publishedAt.slice(0, 10)
                : null
            const subline =
              item.kind === 'ai'
                ? item.latestDate
                  ? `${item.latestDate.replace(/-/g, '/')} · ${tAi.archiveCount(item.issueCount)}`
                  : tHome.trendingAiFallbackSub
                : `${postDateText} · ${item.readingTime.toFixed(0)}${tBlog.readingTimeSuffix}`

            return (
              <article
                key={item.key}
                className="group relative flex flex-row items-center gap-3.5 overflow-hidden rounded-2xl border border-zinc-100 bg-white/80 p-3 transition-[transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-zinc-200/90 hover:shadow-md hover:shadow-zinc-900/5 active:translate-y-0 active:scale-[0.99] has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-lime-600 motion-reduce:transition-none motion-reduce:hover:transform-none motion-reduce:active:transform-none dark:border-zinc-700/40 dark:bg-zinc-900/50 dark:hover:border-zinc-600/60 dark:hover:shadow-black/30 dark:has-[a:focus-visible]:outline-lime-400 sm:flex-col sm:items-stretch sm:gap-0 sm:p-0"
              >
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 sm:aspect-[16/9] sm:h-auto sm:w-full sm:rounded-none">
                  <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded-full bg-zinc-950/75 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-4 tabular-nums text-zinc-100 ring-1 ring-white/15 backdrop-blur-sm sm:left-2.5 sm:top-2.5 sm:px-2 sm:text-[11px]">
                    {rank}
                  </span>

                  {item.kind === 'post' ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      placeholder={item.lqip ? 'blur' : 'empty'}
                      blurDataURL={item.lqip}
                      sizes="(max-width: 640px) 96px, (max-width: 1024px) 33vw, 320px"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 transition-transform duration-300 ease-out before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_78%_22%,rgba(132,204,22,0.28),transparent_62%)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:transform-none">
                      <span className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 text-lime-300">
                        <SparkleIcon
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="hidden font-mono text-xs font-medium tracking-tight sm:inline">
                          /ai
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-1 sm:gap-2 sm:p-4">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    <span
                      className={
                        item.kind === 'ai'
                          ? 'text-lime-700 dark:text-lime-400'
                          : undefined
                      }
                    >
                      {item.kind === 'ai' ? tHome.trendingAi : tHome.trendingPost}
                      {item.kind === 'post' && item.isFallback ? ' · ZH' : ''}
                    </span>
                    {item.visitors !== null && item.visitors >= 3 && (
                      <span className="shrink-0 tabular-nums">
                        {tHome.trendingVisitors(item.visitors)}
                      </span>
                    )}
                  </div>

                  <h3
                    lang={
                      item.kind === 'post' && item.isFallback
                        ? 'zh-CN'
                        : undefined
                    }
                    className="line-clamp-2 text-balance text-sm font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-lime-700 dark:text-zinc-100 dark:group-hover:text-lime-400 sm:text-base"
                  >
                    <Link
                      href={item.href}
                      prefetch={false}
                      className="after:absolute after:inset-0 after:z-20 after:content-[''] focus-visible:outline-none"
                    >
                      {item.title}
                    </Link>
                  </h3>

                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {subline}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </Container>
  )
}
