'use client'

import { clsxm } from '@zolplay/utils'
import React from 'react'

import { SparkleIcon } from '~/assets'
import { getMessages, type Locale } from '~/lib/i18n'
import { type PostAiSummary } from '~/sanity/schemas/post'

type Phase = 'ssr' | 'waiting' | 'typing' | 'done'

function TypewriterCaret() {
  return (
    <span aria-hidden="true" className="relative inline-block w-0 align-baseline">
      <span className="absolute bottom-[-0.12em] left-[1px] h-[1.05em] w-[2px] rounded-full bg-lime-600 motion-safe:animate-pulse dark:bg-lime-400" />
    </span>
  )
}

export function AiSummaryCard({
  aiSummary,
  locale = 'zh',
  lang,
}: {
  aiSummary: PostAiSummary
  locale?: Locale
  lang?: string
}) {
  const t = getMessages(locale).blog

  const summaryChars = React.useMemo(
    () => Array.from(aiSummary.summary),
    [aiSummary.summary]
  )
  const pointCharsList = React.useMemo(
    () => aiSummary.points.map((pt) => Array.from(pt)),
    [aiSummary.points]
  )
  const totalChars = React.useMemo(
    () =>
      summaryChars.length +
      pointCharsList.reduce((sum, chars) => sum + chars.length, 0),
    [summaryChars, pointCharsList]
  )

  const [phase, setPhase] = React.useState<Phase>('ssr')
  const [revealed, setRevealed] = React.useState<number>(totalChars)

  const cardRef = React.useRef<HTMLElement>(null)
  const rafRef = React.useRef<number | null>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)

  const finishImmediately = React.useCallback(() => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    setRevealed(totalChars)
    setPhase('done')
  }, [totalChars])

  React.useEffect(() => {
    let cancelled = false

    if (
      totalChars === 0 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setRevealed(totalChars)
      setPhase('done')
      return
    }

    const startTyping = () => {
      if (cancelled) return
      setPhase('typing')
      setRevealed(0)

      const durationMs = Math.min(2400, Math.max(1100, totalChars * 10))
      let startedAt: number | null = null
      let lastCount = -1

      const tick = (now: number) => {
        if (cancelled) return
        if (startedAt === null) {
          startedAt = now
        }
        const progress = Math.min(1, (now - startedAt) / durationMs)
        const nextCount =
          progress >= 1 ? totalChars : Math.floor(progress * totalChars)

        if (nextCount !== lastCount) {
          lastCount = nextCount
          setRevealed(nextCount)
        }

        if (progress < 1) {
          rafRef.current = window.requestAnimationFrame(tick)
        } else {
          rafRef.current = null
          setPhase('done')
        }
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    const el = cardRef.current
    if (!el) {
      startTyping()
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
      startTyping()
    } else if (typeof IntersectionObserver !== 'undefined') {
      setPhase('waiting')
      setRevealed(0)
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect()
            observerRef.current = null
            startTyping()
          }
        },
        { threshold: 0.3 }
      )
      observerRef.current = observer
      observer.observe(el)
    } else {
      startTyping()
    }

    return () => {
      cancelled = true
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [totalChars])

  const isAnimating = phase === 'waiting' || phase === 'typing'

  const handleCardClick = React.useCallback(() => {
    if (!isAnimating) return
    if (window.getSelection()?.toString()) return
    finishImmediately()
  }, [finishImmediately, isAnimating])

  const shownSummary = isAnimating
    ? summaryChars.slice(0, revealed).join('')
    : aiSummary.summary

  let activePointIndex = -1
  const shownPoints: string[] = []
  if (isAnimating && revealed >= summaryChars.length) {
    let cursor = summaryChars.length
    for (let i = 0; i < pointCharsList.length; i++) {
      const pts = pointCharsList[i] ?? []
      const localCount = Math.max(0, Math.min(pts.length, revealed - cursor))
      const nextCursor = cursor + pts.length
      const isActive =
        activePointIndex === -1 &&
        (revealed < nextCursor || i === pointCharsList.length - 1)

      if (revealed >= cursor) {
        shownPoints.push(pts.slice(0, localCount).join(''))
        if (isActive && phase === 'typing') {
          activePointIndex = i
        }
      }
      cursor = nextCursor
    }
  }

  const showSummaryCaret =
    phase === 'typing' &&
    (revealed < summaryChars.length || pointCharsList.length === 0)

  return (
    <section
      ref={cardRef}
      lang={lang}
      onClick={handleCardClick}
      className={clsxm(
        'mt-8 rounded-2xl border border-lime-500/25 bg-lime-50/70 p-5 dark:border-lime-400/20 dark:bg-lime-950/20',
        phase === 'typing' && 'cursor-pointer'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold text-lime-700 dark:text-lime-400">
          <SparkleIcon className="h-4 w-4 flex-none" aria-hidden="true" />
          <span>{t.aiSummaryTitle}</span>
        </h2>
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          {phase === 'typing' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                finishImmediately()
              }}
              className="inline-flex min-h-6 items-center rounded-md px-2 py-0.5 text-xs font-medium text-lime-700 transition-colors hover:bg-lime-500/15 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:text-lime-300 dark:hover:bg-lime-400/15 dark:focus-visible:outline-lime-400"
            >
              {t.aiSummarySkip}
            </button>
          )}
          <span>{t.aiSummaryBy}</span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1">
        <div
          className={clsxm(
            'col-start-1 row-start-1',
            isAnimating && 'pointer-events-none select-none opacity-0'
          )}
        >
          <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
            {aiSummary.summary}
          </p>
          {aiSummary.points.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-700 marker:text-lime-600 dark:text-zinc-300 dark:marker:text-lime-400">
              {aiSummary.points.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          )}
        </div>

        {isAnimating && (
          <div
            aria-hidden="true"
            className="pointer-events-none col-start-1 row-start-1 select-none"
          >
            <p className="text-sm leading-7 text-zinc-700 dark:text-zinc-300">
              {shownSummary || '\u200b'}
              {showSummaryCaret && <TypewriterCaret />}
            </p>
            {shownPoints.length > 0 && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-zinc-700 marker:text-lime-600 dark:text-zinc-300 dark:marker:text-lime-400">
                {shownPoints.map((point, idx) => (
                  <li key={idx}>
                    {point || '\u200b'}
                    {activePointIndex === idx && <TypewriterCaret />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
