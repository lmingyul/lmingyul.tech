'use client'

import { clsxm } from '@zolplay/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Link from 'next/link'
import * as React from 'react'

import { type Locale } from '~/lib/i18n'
import { type ActivityPost, type WritingActivity } from '~/lib/writing-activity'

dayjs.extend(utc)

export type HeatmapRange = 'last-year' | number

export type HeatmapCell = {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  visible: boolean
}

export type HeatmapMonthLabel = {
  col: number
  label: string
}

export type HeatmapGrid = {
  weeks: HeatmapCell[][]
  monthLabels: HeatmapMonthLabel[]
  start: string
  end: string
  totalPosts: number
}

const ZH_MONTHS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
]

const EN_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const EN_FULL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const ZH_WEEKDAYS = ['一', '', '三', '', '五', '', '']
const EN_WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

/** 12px cell + 3px gap */
const COL_PITCH_PX = 15

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-zinc-100 ring-1 ring-inset ring-zinc-900/5 dark:bg-zinc-800/70 dark:ring-white/5',
  1: 'bg-lime-300 dark:bg-lime-900',
  2: 'bg-lime-500 dark:bg-lime-700',
  3: 'bg-lime-600 dark:bg-lime-500',
  4: 'bg-lime-800 dark:bg-lime-300',
}

function startOfIsoWeek(d: dayjs.Dayjs): dayjs.Dayjs {
  return d.subtract((d.day() + 6) % 7, 'day')
}

function endOfIsoWeek(d: dayjs.Dayjs): dayjs.Dayjs {
  return startOfIsoWeek(d).add(6, 'day')
}

/** Build the Monday-started week grid and month labels purely in UTC calendar dates. */
export function buildHeatmapGrid(
  range: HeatmapRange,
  today: string,
  days: Record<string, ActivityPost[]>,
  locale: Locale
): HeatmapGrid {
  const todayUtc = dayjs.utc(today)

  const startDate =
    range === 'last-year'
      ? startOfIsoWeek(todayUtc).subtract(52, 'week')
      : dayjs.utc(`${range}-01-01`)

  const rawEnd =
    range === 'last-year' ? todayUtc : dayjs.utc(`${range}-12-31`)
  const endDate = rawEnd.isAfter(todayUtc) ? todayUtc : rawEnd

  const gridStart = startOfIsoWeek(startDate)
  const gridEnd = endOfIsoWeek(rawEnd)

  const weeks: HeatmapCell[][] = []
  let totalPosts = 0
  let cursor = gridStart

  while (!cursor.isAfter(gridEnd)) {
    const col: HeatmapCell[] = []
    for (let row = 0; row < 7; row++) {
      const dateStr = cursor.format('YYYY-MM-DD')
      const visible = !cursor.isBefore(startDate) && !cursor.isAfter(endDate)
      const count = visible ? days[dateStr]?.length ?? 0 : 0
      totalPosts += count
      col.push({
        date: dateStr,
        count,
        level: Math.min(count, 4) as 0 | 1 | 2 | 3 | 4,
        visible,
      })
      cursor = cursor.add(1, 'day')
    }
    weeks.push(col)
  }

  const monthNames = locale === 'en' ? EN_MONTHS : ZH_MONTHS
  const firstDayCols = new Map<number, number>()
  for (let col = 0; col < weeks.length - 1; col++) {
    const firstOfMonth = weeks[col].find(
      (cell) => cell.visible && cell.date.endsWith('-01')
    )
    if (firstOfMonth) {
      firstDayCols.set(col, Number(firstOfMonth.date.slice(5, 7)) - 1)
    }
  }

  const monthLabels: HeatmapMonthLabel[] = []
  const hasEarlyNewMonth = firstDayCols.has(1) || firstDayCols.has(2)
  if (!firstDayCols.has(0) && !hasEarlyNewMonth) {
    const firstVisible = weeks[0]?.find((cell) => cell.visible)
    if (firstVisible) {
      monthLabels.push({
        col: 0,
        label: monthNames[Number(firstVisible.date.slice(5, 7)) - 1],
      })
    }
  }

  for (let col = 0; col < weeks.length - 1; col++) {
    const monthIndex = firstDayCols.get(col)
    if (monthIndex === undefined) continue
    const prev = monthLabels[monthLabels.length - 1]
    if (!prev || col - prev.col >= 3) {
      monthLabels.push({ col, label: monthNames[monthIndex] })
    }
  }

  return {
    weeks,
    monthLabels,
    start: startDate.format('YYYY-MM-DD'),
    end: endDate.format('YYYY-MM-DD'),
    totalPosts,
  }
}

function formatTooltipDate(date: string, locale: Locale): string {
  const [y, m, d] = date.split('-').map(Number)
  if (locale === 'en') {
    return `${EN_MONTHS[m - 1]} ${d}, ${y}`
  }
  return `${y}年${m}月${d}日`
}

function formatMonthHeading(monthKey: string, locale: Locale): string {
  const [y, m] = monthKey.split('-').map(Number)
  if (locale === 'en') {
    return `${EN_FULL_MONTHS[m - 1]} ${y}`
  }
  return `${y} 年 ${m} 月`
}

function formatSummaryText(
  range: HeatmapRange,
  totalPosts: number,
  locale: Locale
): string {
  if (locale === 'en') {
    if (range === 'last-year') {
      return totalPosts > 0
        ? `${totalPosts} ${totalPosts === 1 ? 'post' : 'posts'} in the last year`
        : 'No posts in the last year'
    }
    return totalPosts > 0
      ? `${totalPosts} ${totalPosts === 1 ? 'post' : 'posts'} in ${range}`
      : `No posts in ${range}`
  }

  if (range === 'last-year') {
    return totalPosts > 0
      ? `过去一年发布了 ${totalPosts} 篇文章`
      : '过去一年还没有发布文章'
  }
  return totalPosts > 0
    ? `${range} 年发布了 ${totalPosts} 篇文章`
    : `${range} 年没有发布文章`
}

export function WritingHeatmap({
  locale,
  activity,
}: {
  locale: Locale
  activity: WritingActivity
}) {
  const isEn = locale === 'en'
  const [range, setRange] = React.useState<HeatmapRange>('last-year')
  const [expanded, setExpanded] = React.useState(false)
  const [hovered, setHovered] = React.useState<{
    date: string
    centerX: number
    top: number
  } | null>(null)
  const [tooltipOffsetX, setTooltipOffsetX] = React.useState(0)

  const cardRef = React.useRef<HTMLDivElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const startSentinelRef = React.useRef<HTMLDivElement>(null)
  const endSentinelRef = React.useRef<HTMLDivElement>(null)

  const grid = React.useMemo(
    () => buildHeatmapGrid(range, activity.today, activity.days, locale),
    [range, activity.today, activity.days, locale]
  )

  const summaryText = formatSummaryText(range, grid.totalPosts, locale)
  const weekdayLabels = isEn ? EN_WEEKDAYS : ZH_WEEKDAYS
  const rangeOptions: HeatmapRange[] = ['last-year', ...activity.years]

  const monthGroups = React.useMemo(() => {
    const dates = Object.keys(activity.days)
      .filter((d) => d >= grid.start && d <= grid.end)
      .sort((a, b) => b.localeCompare(a))

    const grouped = new Map<string, ActivityPost[]>()
    for (const d of dates) {
      const monthKey = d.slice(0, 7)
      const bucket = grouped.get(monthKey) ?? []
      bucket.push(...activity.days[d])
      grouped.set(monthKey, bucket)
    }
    return Array.from(grouped.entries()).map(([month, posts]) => ({
      month,
      posts,
    }))
  }, [activity.days, grid.start, grid.end])

  const visibleGroups = expanded ? monthGroups : monthGroups.slice(0, 3)

  React.useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    if (scroller.scrollWidth <= scroller.clientWidth) {
      scroller.scrollLeft = 0
      scroller.classList.remove('more-start', 'more-end')
      return
    }

    const currentYear = Number(activity.today.slice(0, 4))
    const alignRight = range === 'last-year' || range === currentYear
    scroller.scrollLeft = alignRight
      ? scroller.scrollWidth - scroller.clientWidth
      : 0
  }, [range, activity.today])

  React.useEffect(() => {
    const scroller = scrollerRef.current
    const startSentinel = startSentinelRef.current
    const endSentinel = endSentinelRef.current
    if (!scroller || !startSentinel || !endSentinel) return

    if (
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline', 'scroll(self inline)')
    ) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cls = entry.target === startSentinel ? 'more-start' : 'more-end'
          scroller.classList.toggle(cls, !entry.isIntersecting)
        }
      },
      { root: scroller, threshold: 0, rootMargin: '1px' }
    )

    observer.observe(startSentinel)
    observer.observe(endSentinel)

    return () => {
      observer.disconnect()
    }
  }, [range])

  React.useLayoutEffect(() => {
    if (!hovered || !cardRef.current || !tooltipRef.current) {
      setTooltipOffsetX(0)
      return
    }
    const cardWidth = cardRef.current.clientWidth
    const tipWidth = tooltipRef.current.offsetWidth
    const pad = 12
    const minLeft = pad + tipWidth / 2
    const maxLeft = Math.max(minLeft, cardWidth - pad - tipWidth / 2)
    const clampedCenter = Math.min(Math.max(hovered.centerX, minLeft), maxLeft)
    setTooltipOffsetX(clampedCenter - hovered.centerX)
  }, [hovered])

  React.useEffect(() => {
    if (!hovered) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHovered(null)
      }
    }
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null
      if (!target?.closest('[data-date]')) {
        setHovered(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [hovered])

  const handlePointerOver = (e: React.PointerEvent<HTMLDivElement>) => {
    const cellEl = (e.target as HTMLElement | null)?.closest<HTMLElement>(
      '[data-date]'
    )
    const date = cellEl?.dataset.date
    if (!cellEl || !date || !cardRef.current) return

    const cardRect = cardRef.current.getBoundingClientRect()
    const cellRect = cellEl.getBoundingClientRect()
    setHovered({
      date,
      centerX: cellRect.left - cardRect.left + cellRect.width / 2,
      top: cellRect.top - cardRect.top - 8,
    })
  }

  const hoveredPosts = hovered ? activity.days[hovered.date] ?? [] : []

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:items-start">
        <div
          role="group"
          aria-label={isEn ? 'Select time range' : '选择时间范围'}
          className="flex flex-wrap gap-1.5 lg:w-24 lg:shrink-0 lg:flex-col lg:flex-nowrap"
        >
          {rangeOptions.map((option) => {
            const selected = range === option
            const label =
              option === 'last-year'
                ? isEn
                  ? 'Last year'
                  : '近一年'
                : String(option)

            return (
              <button
                key={String(option)}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setRange(option)
                  setExpanded(false)
                  setHovered(null)
                }}
                className={clsxm(
                  'whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs font-medium tabular-nums transition-[color,background-color,transform] duration-150 active:scale-[0.98] lg:px-3',
                  selected
                    ? 'bg-lime-600 text-white shadow-sm dark:bg-lime-500 dark:text-zinc-950'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div
          ref={cardRef}
          className="relative min-w-0 flex-1 rounded-2xl border border-zinc-100 bg-white/70 p-5 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60"
        >
          <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
            {summaryText}
          </p>

          <div
            ref={scrollerRef}
            onScroll={() => setHovered(null)}
            className="heatmap-scroller mt-4 flex items-start pb-1"
          >
            <div
              ref={startSentinelRef}
              aria-hidden="true"
              className="h-px w-px shrink-0"
            />
            <div className="inline-grid shrink-0 grid-cols-[auto_max-content] items-center gap-x-2 gap-y-1.5">
              <div />
              <div
                aria-hidden="true"
                className="relative h-4 select-none text-[11px] leading-4 text-zinc-400 dark:text-zinc-500"
              >
                {grid.monthLabels.map(({ col, label }) => (
                  <span
                    key={`${col}-${label}`}
                    style={{ left: col * COL_PITCH_PX }}
                    className="absolute top-0 whitespace-nowrap"
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div
                aria-hidden="true"
                className="grid select-none grid-rows-7 gap-[3px] text-[11px] leading-3 text-zinc-400 dark:text-zinc-500"
              >
                {weekdayLabels.map((label, idx) => (
                  <span key={idx} className="flex h-3 items-center">
                    {label}
                  </span>
                ))}
              </div>

              <div
                role="img"
                aria-label={summaryText}
                onPointerOver={handlePointerOver}
                onPointerLeave={() => setHovered(null)}
                className="grid grid-flow-col grid-rows-7 gap-[3px]"
              >
                {grid.weeks.flat().map((cell) => (
                  <span
                    key={cell.date}
                    data-date={cell.visible ? cell.date : undefined}
                    className={clsxm(
                      'h-3 w-3 rounded-[2px]',
                      cell.visible
                        ? LEVEL_CLASSES[cell.level]
                        : 'pointer-events-none bg-transparent'
                    )}
                  />
                ))}
              </div>
            </div>
            <div
              ref={endSentinelRef}
              aria-hidden="true"
              className="h-px w-px shrink-0"
            />
          </div>

          <div
            aria-hidden="true"
            className="mt-3 flex select-none items-center justify-end gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500"
          >
            <span>{isEn ? 'Less' : '少'}</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <span
                key={level}
                className={clsxm(
                  'h-2.5 w-2.5 rounded-[2px]',
                  LEVEL_CLASSES[level]
                )}
              />
            ))}
            <span>{isEn ? 'More' : '多'}</span>
          </div>

          {hovered && (
            <div
              ref={tooltipRef}
              aria-hidden="true"
              style={{
                left: hovered.centerX,
                top: hovered.top,
                transform: `translate(calc(-50% + ${tooltipOffsetX}px), -100%)`,
              }}
              className="pointer-events-none absolute z-20 w-max max-w-[16rem] rounded-lg bg-zinc-900/95 px-3 py-2 text-xs text-zinc-100 shadow-lg ring-1 ring-white/10 backdrop-blur dark:bg-zinc-800/95"
            >
              <p className="font-medium tabular-nums">
                {hoveredPosts.length > 0
                  ? isEn
                    ? `${formatTooltipDate(hovered.date, locale)} · ${hoveredPosts.length} ${hoveredPosts.length === 1 ? 'post' : 'posts'}`
                    : `${formatTooltipDate(hovered.date, locale)} · ${hoveredPosts.length} 篇文章`
                  : isEn
                    ? `No posts on ${formatTooltipDate(hovered.date, locale)}`
                    : `${formatTooltipDate(hovered.date, locale)} · 没有发布`}
              </p>
              {hoveredPosts.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-zinc-300">
                  {hoveredPosts.slice(0, 3).map((post) => (
                    <li key={post.href} className="line-clamp-1">
                      {post.title}
                    </li>
                  ))}
                  {hoveredPosts.length > 3 && (
                    <li className="text-zinc-400">
                      {isEn
                        ? `+${hoveredPosts.length - 3} more`
                        : `等 ${hoveredPosts.length} 篇`}
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        {monthGroups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {isEn ? 'No posts in this period' : '这段时间没有发布文章'}
          </p>
        ) : (
          <div className="space-y-6">
            {visibleGroups.map(({ month, posts }) => (
              <div key={month}>
                <div className="flex items-center gap-3">
                  <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatMonthHeading(month, locale)}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-zinc-200/80 dark:bg-zinc-800"
                  />
                  <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                    {isEn
                      ? `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`
                      : `${posts.length} 篇`}
                  </span>
                </div>
                <ul className="mt-2.5 space-y-1.5 pl-1">
                  {posts.map((post) => (
                    <li key={post.href}>
                      <Link
                        href={post.href}
                        className="group flex items-baseline justify-between gap-4 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60"
                      >
                        <span className="min-w-0 flex-1 text-zinc-700 transition-colors group-hover:text-lime-700 dark:text-zinc-300 dark:group-hover:text-lime-400">
                          {post.title}
                        </span>
                        <time
                          dateTime={post.date}
                          className="shrink-0 font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-500"
                        >
                          {post.date.slice(5)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {monthGroups.length > 3 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-4 w-full rounded-xl border border-zinc-200/80 bg-white/60 py-2.5 text-xs font-semibold text-zinc-700 transition-[color,background-color,border-color,transform] duration-150 hover:border-lime-500/40 hover:text-lime-700 active:scale-[0.99] dark:border-zinc-700/60 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-lime-400/40 dark:hover:text-lime-400"
          >
            {expanded
              ? isEn
                ? 'Show less'
                : '收起'
              : isEn
                ? 'Show more activity'
                : '显示更多动态'}
          </button>
        )}
      </div>
    </div>
  )
}
