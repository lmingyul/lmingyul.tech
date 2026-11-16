'use client'

import { clsxm } from '@zolplay/utils'
import React from 'react'

import { type AiTocHeading } from '~/lib/heading-slug'

function formatTocDisplayText(text: string, isDetailTier: boolean): string {
  if (!isDetailTier) {
    return text
  }
  const colonIdx = text.search(/[：:]/)
  if (colonIdx > 6 && colonIdx < 42) {
    return text.slice(0, colonIdx)
  }
  return text.length > 36 ? `${text.slice(0, 36)}…` : text
}

export function AiDailyTableOfContents({
  headings,
  variant = 'desktop',
}: {
  headings: AiTocHeading[]
  variant?: 'desktop' | 'mobile'
}) {
  const navRef = React.useRef<HTMLElement>(null)
  const detailsRef = React.useRef<HTMLDetailsElement>(null)
  const [showDetails, setShowDetails] = React.useState(false)

  const minLevel = React.useMemo(() => {
    if (headings.length === 0) return 1
    return Math.min(...headings.map((h) => h.level)) as 1 | 2 | 3 | 4
  }, [headings])

  const detailCount = React.useMemo(
    () => headings.filter((h) => h.level >= minLevel + 2).length,
    [headings, minLevel]
  )

  const visibleHeadings = React.useMemo(() => {
    if (showDetails) return headings
    return headings.filter((h) => h.level <= minLevel + 1)
  }, [headings, minLevel, showDetails])

  React.useEffect(() => {
    if (variant !== 'desktop') return
    const nav = navRef.current
    if (!nav || visibleHeadings.length === 0) return

    const supportsScrollTargetGroup =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('scroll-target-group: auto')

    const applyActiveLink = (activeId: string | null) => {
      const links = nav.querySelectorAll<HTMLAnchorElement>('a[data-toc-id]')
      links.forEach((link) => {
        const isMatch =
          activeId !== null && link.dataset.tocId === activeId
        if (!supportsScrollTargetGroup) {
          link.classList.toggle('target-current', isMatch)
        }
        link.setAttribute('aria-current', isMatch ? 'true' : 'false')
        if (isMatch) {
          const navRect = nav.getBoundingClientRect()
          const linkRect = link.getBoundingClientRect()
          if (
            linkRect.top < navRect.top + 24 ||
            linkRect.bottom > navRect.bottom - 24
          ) {
            link.scrollIntoView({ block: 'nearest' })
          }
        }
      })
    }

    if (supportsScrollTargetGroup) {
      const syncAriaCurrent = () => {
        const currentLink =
          nav.querySelector<HTMLAnchorElement>('a:target-current')
        applyActiveLink(currentLink?.dataset.tocId ?? null)
      }
      syncAriaCurrent()
      document.addEventListener('scrollend', syncAriaCurrent)
      return () => {
        document.removeEventListener('scrollend', syncAriaCurrent)
      }
    }

    const targets = visibleHeadings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)

    if (targets.length === 0) return

    const updateByPosition = () => {
      const thresholdY = 128
      let currentId = targets[0]?.id ?? null
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= thresholdY) {
          currentId = el.id
        } else {
          break
        }
      }
      applyActiveLink(currentId)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let matched = false
        for (const entry of entries) {
          if (entry.isIntersecting) {
            applyActiveLink(entry.target.id)
            matched = true
            break
          }
        }
        if (!matched) {
          updateByPosition()
        }
      },
      { rootMargin: '-12% 0px -75% 0px', threshold: 0 }
    )

    targets.forEach((el) => observer.observe(el))
    updateByPosition()
    window.addEventListener('scroll', updateByPosition, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateByPosition)
    }
  }, [variant, visibleHeadings])

  if (headings.length === 0) {
    return null
  }

  if (variant === 'mobile') {
    return (
      <details
        ref={detailsRef}
        className="mb-5 rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 shadow-sm dark:border-zinc-700/50 dark:bg-zinc-900/70 lg:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <span>📑 本期目录（共 {visibleHeadings.length} 节，点击快速跳转）</span>
          <span className="text-zinc-400 dark:text-zinc-500">展开 ▾</span>
        </summary>
        <div className="mt-3 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
          {detailCount > 0 && (
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                aria-pressed={showDetails}
                onClick={() => setShowDetails((prev) => !prev)}
                className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {showDetails ? '仅看章节' : `显示细项 (${detailCount})`}
              </button>
            </div>
          )}
          <nav
            aria-label="移动端本期目录"
            className="max-h-64 space-y-1 overflow-y-auto pr-1"
          >
            {visibleHeadings.map((h) => {
              const depth = Math.max(0, h.level - minLevel)
              const isDetail = depth >= 2
              return (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={() => {
                    if (detailsRef.current) {
                      detailsRef.current.open = false
                    }
                  }}
                  className={clsxm(
                    'block truncate rounded-lg py-1.5 pr-2 text-xs transition hover:bg-lime-500/10 hover:text-lime-700 dark:hover:text-lime-300',
                    depth === 0 &&
                      'px-2 font-semibold text-zinc-800 dark:text-zinc-100',
                    depth === 1 && 'pl-5 text-zinc-600 dark:text-zinc-400',
                    depth >= 2 && 'pl-8 text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  {formatTocDisplayText(h.text, isDetail)}
                </a>
              )
            })}
          </nav>
        </div>
      </details>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-zinc-100 bg-white/80 p-4 shadow-sm dark:border-zinc-700/40 dark:bg-zinc-900/60">
      <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5 dark:border-zinc-800">
        <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          📑 本期目录
        </h2>
        <div className="flex items-center gap-1.5">
          {detailCount > 0 && (
            <button
              type="button"
              aria-pressed={showDetails}
              onClick={() => setShowDetails((prev) => !prev)}
              className={clsxm(
                'rounded-md px-2 py-0.5 text-xs font-medium transition',
                showDetails
                  ? 'bg-lime-500/15 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300'
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
            >
              {showDetails ? '收起细项' : `细项 (${detailCount})`}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const reduced = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
              ).matches
              window.scrollTo({
                top: 0,
                behavior: reduced ? 'auto' : 'smooth',
              })
            }}
            className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 transition hover:text-zinc-900 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ↑ 顶部
          </button>
        </div>
      </div>

      <nav
        ref={navRef}
        aria-label="本期目录"
        className="ai-toc-nav min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1"
      >
        {visibleHeadings.map((h) => {
          const depth = Math.max(0, h.level - minLevel)
          const isDetail = depth >= 2
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              data-toc-id={h.id}
              title={h.text}
              className={clsxm(
                'ai-toc-link block truncate rounded-r-lg border-l-2 border-transparent py-1.5 pr-2 text-xs leading-5 transition hover:text-zinc-900 dark:hover:text-zinc-100',
                depth === 0 &&
                  'mt-1 pl-2.5 font-semibold text-zinc-800 first:mt-0 dark:text-zinc-200',
                depth === 1 && 'pl-5 text-zinc-500 dark:text-zinc-400',
                depth >= 2 && 'pl-7 text-zinc-500/90 dark:text-zinc-400/90'
              )}
            >
              {formatTocDisplayText(h.text, isDetail)}
            </a>
          )
        })}
      </nav>
    </div>
  )
}
