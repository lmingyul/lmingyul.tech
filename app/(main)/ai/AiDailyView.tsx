import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import Balancer from 'react-wrap-balancer'

import { OnlineVisitors } from '~/app/(main)/OnlineVisitors'
import { CalendarIcon, HourglassIcon, SparkleIcon } from '~/assets'
import { AiMarkdown } from '~/components/AiMarkdown'
import { Prose } from '~/components/Prose'
import { Container } from '~/components/ui/Container'
import { getMessages, type Locale, localizePath } from '~/lib/i18n'
import { getOnlineVisitorCount } from '~/lib/visitor-stats'
import {
  type AiDailyIssueDetail,
  type AiDailyIssueSummary,
} from '~/sanity/queries'

import { AiDailyTableOfContents } from './AiDailyTableOfContents'

export async function AiDailyView({
  issues,
  activeIssue,
  isIndexPage: _isIndexPage = false,
  locale = 'zh',
}: {
  issues: AiDailyIssueSummary[]
  activeIssue?: AiDailyIssueDetail
  isIndexPage?: boolean
  locale?: Locale
}) {
  const t = getMessages(locale).aiDaily
  const activeIndex = activeIssue
    ? issues.findIndex((item) => item.slug === activeIssue.slug)
    : -1
  const newerIssue = activeIndex > 0 ? issues[activeIndex - 1] : undefined
  const olderIssue =
    activeIndex >= 0 && activeIndex < issues.length - 1
      ? issues[activeIndex + 1]
      : undefined
  const isFallbackContent = locale === 'en' && Boolean(activeIssue?.isFallback)
  const issueOnlineId = activeIssue ? `ai-daily-${activeIssue.slug}` : null
  const onlineReaders = issueOnlineId
    ? await getOnlineVisitorCount(issueOnlineId)
    : null

  return (
    <Container className="mt-16 sm:mt-24">
      <header className="border-b border-zinc-100 pb-8 dark:border-zinc-800">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300">
            <SparkleIcon className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
            <span>{t.badge}</span>
          </span>
          {issues.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-400">
              {t.archiveCount(issues.length)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
              {t.heading}
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
              <Balancer>{t.description}</Balancer>
            </p>
          </div>

          {activeIssue && (
            <div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{t.permalinkLabel}</span>
              <Link
                href={localizePath(`/ai/${activeIssue.slug}`, locale)}
                className="ml-1 rounded-md bg-zinc-100 px-2 py-1 font-mono text-zinc-700 transition hover:text-lime-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-lime-400"
              >
                {localizePath(`/ai/${activeIssue.slug}`, locale)}
              </Link>
            </div>
          )}
        </div>
      </header>

      {!activeIssue || issues.length === 0 ? (
        <section className="mt-12 rounded-2xl border border-dashed border-zinc-200 bg-white/60 p-10 text-center dark:border-zinc-700/60 dark:bg-zinc-900/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-500/10 text-lime-600 dark:bg-lime-400/10 dark:text-lime-400">
            <SparkleIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t.emptyTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {t.emptyDescPrefix}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              content/ai-daily/YYYY-MM-DD.md
            </code>
            {t.emptyDescSuffix}
          </p>
        </section>
      ) : (
        <div className="mt-8">
          {/* Mobile / Tablet horizontal issue switcher + collapsible TOC */}
          <nav
            aria-label={t.mobileArchiveNavAria}
            className="mb-3 flex gap-2 overflow-x-auto pb-1.5 lg:hidden"
          >
            {issues.map((issue, idx) => {
              const isCurrent = issue.slug === activeIssue.slug
              const href = localizePath(`/ai/${issue.slug}`, locale)
              return (
                <Link
                  key={issue.slug}
                  href={href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={clsxm(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs transition',
                    isCurrent
                      ? 'border-lime-500/50 bg-lime-500/10 font-semibold text-lime-700 dark:border-lime-400/40 dark:bg-lime-400/10 dark:text-lime-300'
                      : 'border-zinc-200/80 bg-white/70 font-medium text-zinc-600 hover:border-zinc-300 dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-zinc-400'
                  )}
                >
                  {isCurrent && (
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-lime-500 dark:bg-lime-400"
                    />
                  )}
                  <span>{issue.date}</span>
                  {idx === 0 && (
                    <span className="rounded bg-lime-500/15 px-1.5 py-0.5 text-lime-700 dark:text-lime-300">
                      {t.latestBadge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <AiDailyTableOfContents
            headings={activeIssue.headings}
            variant="mobile"
            locale={locale}
          />

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Desktop Left Sticky Rail: Compact Issue Switcher + Scrollspy TOC */}
            <aside className="hidden lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-3rem)] lg:flex-col lg:gap-4">
              <div className="shrink-0 rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60">
                <div className="mb-2.5 flex items-center justify-between">
                  <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {t.archiveHeading}
                  </h2>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {t.archiveTotal(issues.length)}
                  </span>
                </div>

                <nav
                  aria-label={t.desktopArchiveNavAria}
                  className="max-h-36 space-y-1.5 overflow-y-auto pr-1"
                >
                  {issues.map((issue, idx) => {
                    const isCurrent = issue.slug === activeIssue.slug
                    const href = localizePath(`/ai/${issue.slug}`, locale)

                    return (
                      <Link
                        key={issue.slug}
                        href={href}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={clsxm(
                          'flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs transition',
                          isCurrent
                            ? 'border-lime-500/50 bg-lime-50/70 font-semibold text-lime-700 dark:border-lime-400/40 dark:bg-lime-950/25 dark:text-lime-300'
                            : 'border-zinc-100 bg-zinc-50/60 font-medium text-zinc-700 hover:border-lime-500/30 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300'
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {isCurrent && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-lime-600 dark:bg-lime-400"
                            />
                          )}
                          <time dateTime={issue.date}>{issue.date}</time>
                        </span>
                        {idx === 0 ? (
                          <span className="rounded bg-lime-500/15 px-1.5 py-0.5 text-xs font-semibold text-lime-700 dark:bg-lime-400/15 dark:text-lime-300">
                            {t.latestBadge}
                          </span>
                        ) : (
                          issue.tags[0] && (
                            <span className="truncate text-zinc-400 dark:text-zinc-500">
                              {issue.tags[0]}
                            </span>
                          )
                        )}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <AiDailyTableOfContents
                headings={activeIssue.headings}
                variant="desktop"
                locale={locale}
              />
            </aside>

            {/* Right Reading Canvas */}
            <article className="min-w-0 rounded-2xl border border-zinc-100 bg-white/80 p-6 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60 sm:p-8">
              <header className="border-b border-zinc-100 pb-6 dark:border-zinc-800">
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 font-medium text-lime-700 dark:text-lime-400">
                    <CalendarIcon
                      className="h-4 w-4 flex-none"
                      aria-hidden="true"
                    />
                    <time dateTime={activeIssue.date}>{activeIssue.date}</time>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HourglassIcon
                      className="h-3.5 w-3.5 flex-none"
                      aria-hidden="true"
                    />
                    <span>{t.readingTimeText(activeIssue.readingTime)}</span>
                  </span>
                  {issueOnlineId && (
                    <OnlineVisitors
                      variant="post"
                      postId={issueOnlineId}
                      initialCount={onlineReaders ?? 1}
                      locale={locale}
                    />
                  )}
                  {activeIssue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeIssue.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <h2
                  lang={isFallbackContent ? 'zh-CN' : undefined}
                  className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl"
                >
                  {activeIssue.title}
                </h2>

                {activeIssue.summary && (
                  <p
                    lang={isFallbackContent ? 'zh-CN' : undefined}
                    className="mt-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400"
                  >
                    {activeIssue.summary}
                  </p>
                )}

                {isFallbackContent && t.fallbackNotice && (
                  <p className="mt-3 rounded-xl border border-amber-500/25 bg-amber-50/70 px-3.5 py-2 text-xs leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-950/25 dark:text-amber-200">
                    {t.fallbackNotice}
                  </p>
                )}
              </header>

              {activeIssue.highlights.length > 0 && (
                <section
                  aria-labelledby="daily-tldr-heading"
                  lang={isFallbackContent ? 'zh-CN' : undefined}
                  className="mt-6 rounded-2xl border border-lime-500/25 bg-lime-50/70 p-5 dark:border-lime-400/20 dark:bg-lime-950/20"
                >
                  <h3
                    id="daily-tldr-heading"
                    className="flex items-center gap-1.5 text-xs font-semibold text-lime-700 dark:text-lime-400"
                  >
                    <SparkleIcon
                      className="h-4 w-4 flex-none"
                      aria-hidden="true"
                    />
                    <span>{t.tldrHeading}</span>
                  </h3>
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {activeIssue.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <div lang={isFallbackContent ? 'zh-CN' : undefined}>
                <Prose className="mt-6 max-w-none">
                  <AiMarkdown
                    value={activeIssue.body}
                    headings={activeIssue.headings}
                  />
                </Prose>
              </div>

              {(newerIssue || olderIssue) && (
                <nav
                  aria-label={t.issuePrevNextAria}
                  className="mt-10 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row"
                >
                  {newerIssue ? (
                    <Link
                      href={localizePath(`/ai/${newerIssue.slug}`, locale)}
                      className="group rounded-xl border border-zinc-200/80 px-4 py-3 text-left transition hover:border-lime-500/40 dark:border-zinc-700/60 dark:hover:border-lime-400/40"
                    >
                      <span className="block text-xs text-zinc-400 dark:text-zinc-500">
                        {t.newerIssue(newerIssue.date)}
                      </span>
                      <span
                        lang={newerIssue.isFallback ? 'zh-CN' : undefined}
                        className="mt-0.5 block text-sm font-medium text-zinc-800 group-hover:text-lime-600 dark:text-zinc-200 dark:group-hover:text-lime-400"
                      >
                        {newerIssue.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {olderIssue && (
                    <Link
                      href={localizePath(`/ai/${olderIssue.slug}`, locale)}
                      className="group rounded-xl border border-zinc-200/80 px-4 py-3 text-right transition hover:border-lime-500/40 dark:border-zinc-700/60 dark:hover:border-lime-400/40"
                    >
                      <span className="block text-xs text-zinc-400 dark:text-zinc-500">
                        {t.olderIssue(olderIssue.date)}
                      </span>
                      <span
                        lang={olderIssue.isFallback ? 'zh-CN' : undefined}
                        className="mt-0.5 block text-sm font-medium text-zinc-800 group-hover:text-lime-600 dark:text-zinc-200 dark:group-hover:text-lime-400"
                      >
                        {olderIssue.title}
                      </span>
                    </Link>
                  )}
                </nav>
              )}
            </article>
          </div>
        </div>
      )}
    </Container>
  )
}
