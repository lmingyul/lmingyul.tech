'use client'

import { clsxm } from '@zolplay/utils'
import React from 'react'

import { getMessages, type Locale } from '~/lib/i18n'
import { type DailyVisitorPoint } from '~/lib/visitor-stats'

type ChartMode = 'cumulative' | 'daily'

type PointCoord = {
  x: number
  y: number
}

const SVG_WIDTH = 400
const SVG_HEIGHT = 128
const PAD_LEFT = 36
const PAD_RIGHT = 10
const PAD_TOP = 22
const PAD_BOTTOM = 20
const PLOT_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT
const PLOT_HEIGHT = SVG_HEIGHT - PAD_TOP - PAD_BOTTOM
const Y_BASE = SVG_HEIGHT - PAD_BOTTOM

const EN_SHORT_MONTHS = [
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

function formatCount(n: number): string {
  return Intl.NumberFormat('en-US').format(n)
}

function formatAxisTick(n: number): string {
  if (n >= 10000) {
    return `${Number((n / 1000).toFixed(1))}k`
  }
  return formatCount(n)
}

function formatAxisDate(isoDate: string, locale: Locale): string {
  const [, mRaw, dRaw] = isoDate.split('-')
  const m = Number(mRaw)
  const d = Number(dRaw)
  if (!Number.isFinite(m) || !Number.isFinite(d)) {
    return isoDate
  }
  if (locale === 'en') {
    return `${EN_SHORT_MONTHS[m - 1] ?? ''} ${d}`
  }
  return `${m}/${d}`
}

function formatTooltipDate(isoDate: string, locale: Locale): string {
  const [yRaw, mRaw, dRaw] = isoDate.split('-')
  const y = Number(yRaw)
  const m = Number(mRaw)
  const d = Number(dRaw)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return isoDate
  }
  if (locale === 'en') {
    return `${EN_SHORT_MONTHS[m - 1] ?? ''} ${d}, ${y}`
  }
  return `${y}年${m}月${d}日`
}

function computeNiceScale(maxVal: number): {
  yMax: number
  ticks: [number, number, number]
} {
  if (!Number.isFinite(maxVal) || maxVal <= 0) {
    return { yMax: 10, ticks: [0, 5, 10] }
  }

  const target = maxVal * 1.1
  const halfTarget = target / 2
  const exp = Math.floor(Math.log10(halfTarget))
  const mag = Math.pow(10, exp)
  const norm = halfTarget / mag

  const candidates = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  const stepFactor = candidates.find((c) => norm <= c) ?? 10

  const halfTick = Math.max(1, Math.round(stepFactor * mag))
  const yMax = halfTick * 2
  return { yMax, ticks: [0, halfTick, yMax] }
}

/**
 * Fritsch-Carlson monotone cubic Hermite spline rendered as SVG cubic Beziers.
 * Prevents downward overshoot on steep spikes in cumulative curves.
 */
function buildMonotoneSmoothPath(
  coords: PointCoord[],
  minY: number,
  maxY: number
): string {
  const n = coords.length
  if (n === 0) return ''
  if (n === 1) {
    const p = coords[0]
    return `M ${PAD_LEFT.toFixed(2)},${p.y.toFixed(2)} L ${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }
  if (n === 2) {
    return `M ${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)} L ${coords[1].x.toFixed(2)},${coords[1].y.toFixed(2)}`
  }

  const dx: number[] = []
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const deltaX = coords[i + 1].x - coords[i].x
    const safeDx = deltaX === 0 ? 1e-6 : deltaX
    dx.push(safeDx)
    slopes.push((coords[i + 1].y - coords[i].y) / safeDx)
  }

  const tangents = new Array<number>(n).fill(0)
  tangents[0] = slopes[0]
  tangents[n - 1] = slopes[n - 2]

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents[i] = 0
    } else {
      tangents[i] = (slopes[i - 1] + slopes[i]) / 2
    }
  }

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
      continue
    }
    const a = tangents[i] / slopes[i]
    const b = tangents[i + 1] / slopes[i]
    const h = Math.hypot(a, b)
    if (h > 3) {
      const scale = 3 / h
      tangents[i] = scale * a * slopes[i]
      tangents[i + 1] = scale * b * slopes[i]
    }
  }

  const clampY = (val: number) => Math.min(maxY, Math.max(minY, val))

  let d = `M ${coords[0].x.toFixed(2)},${coords[0].y.toFixed(2)}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = coords[i]
    const p1 = coords[i + 1]
    const segDx = dx[i] / 3
    const c1x = p0.x + segDx
    const c1y = clampY(p0.y + tangents[i] * segDx)
    const c2x = p1.x - segDx
    const c2y = clampY(p1.y - tangents[i + 1] * segDx)
    d += ` C ${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`
  }

  return d
}

export function VisitorTrendChart({
  points,
  locale = 'zh',
}: {
  points: DailyVisitorPoint[]
  locale?: Locale
}) {
  const [mode, setMode] = React.useState<ChartMode>('cumulative')
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const [tooltipOffsetX, setTooltipOffsetX] = React.useState(0)

  const containerRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)

  const gradientId = React.useId().replace(/:/g, '')
  const t = getMessages(locale).footer

  const { dailyValues, cumulativeValues, totalVisitors } = React.useMemo(() => {
    const daily: number[] = []
    const cumulative: number[] = []
    let running = 0
    for (const point of points) {
      const count = Math.max(0, point.count)
      daily.push(count)
      running += count
      cumulative.push(running)
    }
    return {
      dailyValues: daily,
      cumulativeValues: cumulative,
      totalVisitors: running,
    }
  }, [points])

  const activeValues =
    mode === 'cumulative' ? cumulativeValues : dailyValues

  const { yMax, ticks } = React.useMemo(() => {
    const maxVal =
      activeValues.length > 0 ? Math.max(...activeValues, 0) : 0
    return computeNiceScale(maxVal)
  }, [activeValues])

  const coords = React.useMemo<PointCoord[]>(() => {
    const n = points.length
    if (n === 0) return []
    return activeValues.map((val, idx) => {
      const x =
        n === 1
          ? PAD_LEFT + PLOT_WIDTH
          : PAD_LEFT + (idx / (n - 1)) * PLOT_WIDTH
      const y = Y_BASE - (Math.min(val, yMax) / yMax) * PLOT_HEIGHT
      return { x, y }
    })
  }, [activeValues, points.length, yMax])

  const { linePath, areaPath } = React.useMemo(() => {
    if (coords.length === 0) {
      return { linePath: '', areaPath: '' }
    }
    const line = buildMonotoneSmoothPath(coords, PAD_TOP, Y_BASE)
    const firstX = coords.length === 1 ? PAD_LEFT : coords[0].x
    const lastX = coords[coords.length - 1].x
    const area = `${line} L ${lastX.toFixed(2)},${Y_BASE.toFixed(2)} L ${firstX.toFixed(2)},${Y_BASE.toFixed(2)} Z`
    return { linePath: line, areaPath: area }
  }, [coords])

  const xTickIndices = React.useMemo(() => {
    const n = points.length
    if (n === 0) return []
    if (n === 1) return [0]
    if (n === 2) return [0, 1]
    const mid = Math.floor((n - 1) / 2)
    return Array.from(new Set([0, mid, n - 1]))
  }, [points.length])

  React.useLayoutEffect(() => {
    if (
      activeIndex === null ||
      !containerRef.current ||
      !tooltipRef.current ||
      !coords[activeIndex]
    ) {
      setTooltipOffsetX(0)
      return
    }
    const containerWidth = containerRef.current.clientWidth
    const tipWidth = tooltipRef.current.offsetWidth
    const centerPx = (coords[activeIndex].x / SVG_WIDTH) * containerWidth
    const pad = 6
    const minCenter = pad + tipWidth / 2
    const maxCenter = Math.max(minCenter, containerWidth - pad - tipWidth / 2)
    const clampedCenter = Math.min(Math.max(centerPx, minCenter), maxCenter)
    setTooltipOffsetX(clampedCenter - centerPx)
  }, [activeIndex, coords])

  React.useEffect(() => {
    if (activeIndex === null) return
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setActiveIndex(null)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [activeIndex])

  if (points.length === 0) {
    return null
  }

  const lastIdx = points.length - 1
  const lastCoord = coords[lastIdx]
  const lastDaily = dailyValues[lastIdx] ?? 0
  const badgeText =
    mode === 'cumulative'
      ? t.visitorTrendTotalBadge(formatCount(totalVisitors))
      : t.visitorTrendTodayBadge(formatCount(lastDaily))

  const updateIndexFromClientX = (clientX: number) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    if (rect.width <= 0) return
    const svgX = ((clientX - rect.left) / rect.width) * SVG_WIDTH
    if (points.length === 1) {
      setActiveIndex(0)
      return
    }
    const ratio = Math.min(1, Math.max(0, (svgX - PAD_LEFT) / PLOT_WIDTH))
    const idx = Math.round(ratio * (points.length - 1))
    setActiveIndex(idx)
  }

  const handleKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'Escape') {
      setActiveIndex(null)
      return
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null ? lastIdx : Math.max(0, prev - 1)
      )
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      setActiveIndex((prev) =>
        prev === null ? 0 : Math.min(lastIdx, prev + 1)
      )
    }
  }

  const activePoint = activeIndex !== null ? points[activeIndex] : null
  const activeCoord = activeIndex !== null ? coords[activeIndex] : null
  const activeCumulative =
    activeIndex !== null ? cumulativeValues[activeIndex] ?? 0 : 0
  const activeDaily = activeIndex !== null ? dailyValues[activeIndex] ?? 0 : 0

  return (
    <div className="w-full md:w-[380px] md:shrink-0 lg:w-[420px]">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {t.visitorTrendTitle(points.length)}
        </span>

        <div
          role="group"
          aria-label={t.visitorTrendModeAria}
          className="inline-flex items-center rounded-lg border border-zinc-200/80 bg-zinc-100/70 p-0.5 dark:border-zinc-700/60 dark:bg-zinc-800/60"
        >
          {(
            [
              { key: 'cumulative', label: t.visitorTrendCumulative },
              { key: 'daily', label: t.visitorTrendDaily },
            ] as const
          ).map((item) => {
            const selected = mode === item.key
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(item.key)}
                className={clsxm(
                  'rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors',
                  selected
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div ref={containerRef} className="relative select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          role="img"
          tabIndex={0}
          aria-label={t.visitorTrendAria(
            points.length,
            formatCount(totalVisitors)
          )}
          onPointerMove={(e) => updateIndexFromClientX(e.clientX)}
          onPointerDown={(e) => updateIndexFromClientX(e.clientX)}
          onPointerLeave={() => setActiveIndex(null)}
          onBlur={() => setActiveIndex(null)}
          onKeyDown={handleKeyDown}
          className="block h-auto w-full touch-pan-y overflow-visible rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {ticks.map((tick) => {
            const y = Y_BASE - (tick / yMax) * PLOT_HEIGHT
            const isBase = tick === 0
            return (
              <g key={tick}>
                <line
                  x1={PAD_LEFT}
                  x2={SVG_WIDTH - PAD_RIGHT}
                  y1={y}
                  y2={y}
                  strokeWidth={1}
                  className={
                    isBase
                      ? 'stroke-zinc-300/90 dark:stroke-zinc-700/80'
                      : 'stroke-zinc-200/80 dark:stroke-zinc-800/80'
                  }
                />
                <text
                  x={PAD_LEFT - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={10}
                  className="fill-zinc-400 tabular-nums dark:fill-zinc-500"
                >
                  {formatAxisTick(tick)}
                </text>
              </g>
            )
          })}

          <g className="text-lime-600 dark:text-lime-400">
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path
              d={linePath}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {lastCoord && (
              <>
                <circle
                  cx={lastCoord.x}
                  cy={lastCoord.y}
                  r={6}
                  fill="currentColor"
                  fillOpacity={0.18}
                />
                <circle
                  cx={lastCoord.x}
                  cy={lastCoord.y}
                  r={3}
                  fill="currentColor"
                />
              </>
            )}
          </g>

          {lastCoord && (
            <text
              x={Math.min(lastCoord.x, SVG_WIDTH - PAD_RIGHT)}
              y={Math.max(13, lastCoord.y - 10)}
              textAnchor="end"
              fontSize={11}
              className={clsxm(
                'fill-zinc-900 font-semibold tabular-nums transition-opacity duration-150 dark:fill-zinc-100',
                activeIndex !== null ? 'opacity-35' : 'opacity-100'
              )}
            >
              {badgeText}
            </text>
          )}

          {xTickIndices.map((idx, pos) => {
            const point = points[idx]
            const coord = coords[idx]
            if (!point || !coord) return null
            let anchor: 'start' | 'middle' | 'end' = 'middle'
            if (xTickIndices.length === 1 || pos === xTickIndices.length - 1) {
              anchor = 'end'
            } else if (pos === 0) {
              anchor = 'start'
            }
            return (
              <text
                key={point.date}
                x={coord.x}
                y={SVG_HEIGHT - 4}
                textAnchor={anchor}
                fontSize={10}
                className="fill-zinc-400 tabular-nums dark:fill-zinc-500"
              >
                {formatAxisDate(point.date, locale)}
              </text>
            )
          })}

          {activeCoord && (
            <g className="pointer-events-none">
              <line
                x1={activeCoord.x}
                x2={activeCoord.x}
                y1={PAD_TOP}
                y2={Y_BASE}
                strokeWidth={1}
                strokeDasharray="2 2"
                className="stroke-zinc-400/70 dark:stroke-zinc-500/70"
              />
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r={4}
                strokeWidth={1.5}
                className="fill-lime-600 stroke-white dark:fill-lime-400 dark:stroke-zinc-900"
              />
            </g>
          )}
        </svg>

        {activePoint && activeCoord && (
          <div
            ref={tooltipRef}
            aria-hidden="true"
            style={{
              left: `${(activeCoord.x / SVG_WIDTH) * 100}%`,
              top: `${Math.max(0, ((activeCoord.y - 8) / SVG_HEIGHT) * 100)}%`,
              transform: `translate(calc(-50% + ${tooltipOffsetX}px), -100%)`,
            }}
            className="pointer-events-none absolute z-20 w-max rounded-lg bg-zinc-900/95 px-2.5 py-1.5 text-[11px] leading-4 text-zinc-100 shadow-lg ring-1 ring-white/10 backdrop-blur dark:bg-zinc-800/95"
          >
            <p className="font-medium tabular-nums text-zinc-200">
              {formatTooltipDate(activePoint.date, locale)}
            </p>
            <p className="tabular-nums text-lime-300">
              {mode === 'cumulative'
                ? t.visitorTrendTooltipCumulative(
                    formatCount(activeCumulative),
                    formatCount(activeDaily)
                  )
                : t.visitorTrendTooltipDaily(
                    formatCount(activeDaily),
                    formatCount(activeCumulative)
                  )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
