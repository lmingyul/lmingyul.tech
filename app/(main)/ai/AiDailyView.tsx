import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import Balancer from 'react-wrap-balancer'

import { CalendarIcon, HourglassIcon, SparkleIcon } from '~/assets'
import { AiMarkdown } from '~/components/AiMarkdown'
import { Prose } from '~/components/Prose'
import { Container } from '~/components/ui/Container'
import {
  type AiDailyIssueDetail,
  type AiDailyIssueSummary,
} from '~/sanity/queries'

export function AiDailyView({
  issues,
  activeIssue,
  isIndexPage = false,
}: {
  issues: AiDailyIssueSummary[]
  activeIssue?: AiDailyIssueDetail
  isIndexPage?: boolean
}) {
  const activeIndex = activeIssue
    ? issues.findIndex((item) => item.slug === activeIssue.slug)
    : -1
  const newerIssue = activeIndex > 0 ? issues[activeIndex - 1] : undefined
  const olderIssue =
    activeIndex >= 0 && activeIndex < issues.length - 1
      ? issues[activeIndex + 1]
      : undefined

  return (
    <Container className="mt-16 sm:mt-24">
      <header className="border-b border-zinc-100 pb-8 dark:border-zinc-800">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/10 px-3 py-1 text-xs font-semibold text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300">
            <SparkleIcon className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
            <span>AI 每日简讯</span>
          </span>
          {issues.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-400">
              共 {issues.length} 期归档
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
              AI 每日简讯 · 日报
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400 sm:text-base">
              <Balancer>
                持续追踪大模型训练推理、Agent 工程实践与高价值开源动态，从日常阅读与研究笔记中沉淀高信噪比信号。
              </Balancer>
            </p>
          </div>

          {activeIssue && (
            <div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
              <span>本期永久链接：</span>
              <Link
                href={`/ai/${activeIssue.slug}`}
                className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-zinc-700 transition hover:text-lime-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-lime-400"
              >
                /ai/{activeIssue.slug}
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
            首期 AI 每日简讯即将同步上线
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            当 Notion 日报工作流向 GitHub 仓库推送{' '}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              content/ai-daily/YYYY-MM-DD.md
            </code>{' '}
            后，这里会自动展示最新一期内容与历史时间轴归档。
          </p>
        </section>
      ) : (
        <div className="mt-8">
          {/* Mobile / Tablet horizontal issue switcher */}
          <nav
            aria-label="移动端日报期数切换"
            className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden"
          >
            {issues.map((issue, idx) => {
              const isCurrent = issue.slug === activeIssue.slug
              const href = idx === 0 && isIndexPage ? '/ai' : `/ai/${issue.slug}`
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
                      最新
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Desktop Left 4/12 Archive Rail */}
            <aside className="hidden lg:col-span-4 lg:sticky lg:top-8 lg:block">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  期数时间轴
                </h2>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  最新在上
                </span>
              </div>

              <nav
                aria-label="日报期数归档"
                className="max-h-[calc(100vh-8rem)] space-y-2.5 overflow-y-auto pr-1"
              >
                {issues.map((issue, idx) => {
                  const isCurrent = issue.slug === activeIssue.slug
                  const href =
                    idx === 0 && isIndexPage ? '/ai' : `/ai/${issue.slug}`

                  return (
                    <Link
                      key={issue.slug}
                      href={href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={clsxm(
                        'block rounded-2xl border p-4 transition',
                        isCurrent
                          ? 'border-lime-500/50 bg-lime-50/70 shadow-sm dark:border-lime-400/40 dark:bg-lime-950/25'
                          : 'border-zinc-100 bg-white/70 hover:border-lime-500/30 dark:border-zinc-700/40 dark:bg-zinc-900/60 dark:hover:border-lime-400/25'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={clsxm(
                            'inline-flex items-center gap-1.5 text-xs',
                            isCurrent
                              ? 'font-semibold text-lime-700 dark:text-lime-300'
                              : 'font-medium text-zinc-700 dark:text-zinc-200'
                          )}
                        >
                          {isCurrent && (
                            <span
                              aria-hidden="true"
                              className="h-1.5 w-1.5 rounded-full bg-lime-600 dark:bg-lime-400"
                            />
                          )}
                          <time dateTime={issue.date}>{issue.date}</time>
                          {idx === 0 && (
                            <span className="rounded-md bg-lime-500/15 px-1.5 py-0.5 text-xs font-semibold text-lime-700 dark:bg-lime-400/15 dark:text-lime-300">
                              最新
                            </span>
                          )}
                        </span>

                        {issue.tags[0] && (
                          <span className="truncate rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            {issue.tags[0]}
                          </span>
                        )}
                      </div>

                      <p className="mt-1.5 line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {issue.title}
                      </p>

                      {issue.summary && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                          {issue.summary}
                        </p>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </aside>

            {/* Right 8/12 Issue Content Reader */}
            <article className="rounded-2xl border border-zinc-100 bg-white/80 p-6 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60 sm:p-8 lg:col-span-8">
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
                    <span>约 {activeIssue.readingTime} 分钟阅读</span>
                  </span>
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

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                  {activeIssue.title}
                </h2>

                {activeIssue.summary && (
                  <p className="mt-2.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {activeIssue.summary}
                  </p>
                )}
              </header>

              {activeIssue.highlights.length > 0 && (
                <section
                  aria-labelledby="daily-tldr-heading"
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
                    <span>今日速览</span>
                  </h3>
                  <ul className="mt-2.5 list-disc space-y-1.5 pl-4 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                    {activeIssue.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              )}

              <Prose className="mt-6 max-w-none">
                <AiMarkdown value={activeIssue.body} />
              </Prose>

              {(newerIssue || olderIssue) && (
                <nav
                  aria-label="前后期日报切换"
                  className="mt-10 flex flex-col justify-between gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:flex-row"
                >
                  {newerIssue ? (
                    <Link
                      href={`/ai/${newerIssue.slug}`}
                      className="group rounded-xl border border-zinc-200/80 px-4 py-3 text-left transition hover:border-lime-500/40 dark:border-zinc-700/60 dark:hover:border-lime-400/40"
                    >
                      <span className="block text-xs text-zinc-400 dark:text-zinc-500">
                        ← 更新一期 ({newerIssue.date})
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-zinc-800 group-hover:text-lime-600 dark:text-zinc-200 dark:group-hover:text-lime-400">
                        {newerIssue.title}
                      </span>
                    </Link>
                  ) : (
                    <span />
                  )}

                  {olderIssue && (
                    <Link
                      href={`/ai/${olderIssue.slug}`}
                      className="group rounded-xl border border-zinc-200/80 px-4 py-3 text-right transition hover:border-lime-500/40 dark:border-zinc-700/60 dark:hover:border-lime-400/40"
                    >
                      <span className="block text-xs text-zinc-400 dark:text-zinc-500">
                        更早一期 ({olderIssue.date}) →
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-zinc-800 group-hover:text-lime-600 dark:text-zinc-200 dark:group-hover:text-lime-400">
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
