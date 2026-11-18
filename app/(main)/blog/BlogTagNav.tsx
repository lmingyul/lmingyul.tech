'use client'

import { clsxm } from '@zolplay/utils'
import { motion, MotionConfig } from 'framer-motion'
import React from 'react'

import { TagIcon } from '~/assets'
import { getMessages, type Locale } from '~/lib/i18n'
import {
  buildBlogTagHref,
  DEFAULT_VISIBLE_TAG_COUNT,
  type TagStat,
} from '~/lib/post-tags'

const ACTIVE_PILL_TRANSITION = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 32,
}

export function BlogTagNav({
  stats,
  activeTag,
  totalCount,
  filteredCount,
  basePath,
  locale,
  onSelectTag,
  showLanguageFilter = false,
  langFilter = 'all',
  englishCount = 0,
  allLangCount = 0,
  onSelectLangFilter,
}: {
  stats: ReadonlyArray<TagStat>
  activeTag: string | null
  totalCount: number
  filteredCount: number
  basePath: string
  locale: Locale
  onSelectTag: (nextTag: string | null) => void
  showLanguageFilter?: boolean
  langFilter?: 'all' | 'english'
  englishCount?: number
  allLangCount?: number
  onSelectLangFilter?: (nextLang: 'all' | 'english') => void
}) {
  const t = getMessages(locale).blog
  const [expanded, setExpanded] = React.useState(false)

  const scrollerRef = React.useRef<HTMLUListElement>(null)
  const firstItemRef = React.useRef<HTMLLIElement>(null)
  const lastTagItemRef = React.useRef<HTMLLIElement>(null)
  const pillRefs = React.useRef(new Map<string, HTMLAnchorElement>())

  const hiddenCount = React.useMemo(
    () =>
      stats.filter(
        (item, idx) =>
          idx >= DEFAULT_VISIBLE_TAG_COUNT && item.tag !== activeTag
      ).length,
    [stats, activeTag]
  )

  React.useEffect(() => {
    const scroller = scrollerRef.current
    const firstItem = firstItemRef.current
    const lastItem = lastTagItemRef.current
    if (!scroller || !firstItem) return

    if (
      typeof CSS !== 'undefined' &&
      CSS.supports('animation-timeline', 'scroll(self inline)')
    ) {
      return
    }

    const targets = [firstItem, lastItem].filter(
      (node): node is HTMLLIElement => Boolean(node)
    )
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === firstItem) {
            scroller.classList.toggle('more-start', !entry.isIntersecting)
          }
          if (lastItem && entry.target === lastItem) {
            scroller.classList.toggle('more-end', !entry.isIntersecting)
          }
        }
      },
      { root: scroller, threshold: 1, rootMargin: '1px' }
    )

    for (const node of targets) {
      observer.observe(node)
    }
    return () => observer.disconnect()
  }, [stats.length])

  React.useEffect(() => {
    if (!activeTag) return
    const scroller = scrollerRef.current
    const pill = pillRefs.current.get(activeTag)
    if (!scroller || !pill) return
    if (scroller.scrollWidth <= scroller.clientWidth) return

    const targetLeft =
      pill.offsetLeft - (scroller.clientWidth - pill.offsetWidth) / 2
    scroller.scrollLeft = Math.max(0, targetLeft)
  }, [activeTag])

  function handleTagClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    targetTag: string | null
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    if (targetTag === null) {
      onSelectTag(null)
      return
    }
    onSelectTag(activeTag === targetTag ? null : targetTag)
  }

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label={t.tagNavAria} className="mt-10 sm:mt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium leading-4 text-zinc-500 dark:text-zinc-400">
            <TagIcon className="h-3.5 w-3.5 text-lime-600 dark:text-lime-400" />
            <span>{t.tagNavLabel}</span>
          </div>

          {showLanguageFilter && onSelectLangFilter && (
            <div
              role="group"
              aria-label={t.filterAria}
              className="inline-flex items-center rounded-full bg-zinc-100/80 p-0.5 ring-1 ring-zinc-900/5 dark:bg-zinc-800/80 dark:ring-white/10"
            >
              <button
                type="button"
                aria-pressed={langFilter === 'all'}
                onClick={() => onSelectLangFilter('all')}
                className={clsxm(
                  'rounded-full px-3 py-1 text-xs font-medium leading-4 transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
                  langFilter === 'all'
                    ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {t.filterAll(allLangCount)}
              </button>
              <button
                type="button"
                aria-pressed={langFilter === 'english'}
                onClick={() => onSelectLangFilter('english')}
                className={clsxm(
                  'rounded-full px-3 py-1 text-xs font-medium leading-4 transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
                  langFilter === 'english'
                    ? 'bg-white text-lime-800 shadow-sm dark:bg-zinc-900 dark:text-lime-300'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                )}
              >
                {t.filterEnglish(englishCount)}
              </button>
            </div>
          )}
        </div>

        <ul
          ref={scrollerRef}
          role="list"
          className="blog-tag-scroller -mx-4 mt-3 flex flex-nowrap items-center gap-2 px-4 py-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          <li ref={firstItemRef} className="shrink-0">
            <a
              href={buildBlogTagHref(basePath, null)}
              aria-current={activeTag === null ? 'page' : undefined}
              onClick={(event) => handleTagClick(event, null)}
              className={clsxm(
                'group relative inline-flex h-9 select-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-[color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
                activeTag === null
                  ? 'text-lime-900 dark:text-lime-200'
                  : 'bg-gradient-to-b from-zinc-50/70 to-white/95 text-zinc-600 shadow-sm shadow-zinc-800/5 ring-1 ring-zinc-900/5 hover:text-zinc-900 hover:ring-zinc-900/15 dark:from-zinc-900/60 dark:to-zinc-800/90 dark:text-zinc-300 dark:ring-white/10 dark:hover:text-zinc-100 dark:hover:ring-white/20'
              )}
            >
              {activeTag === null && (
                <motion.span
                  layoutId="blog-tag-active-pill"
                  transition={ACTIVE_PILL_TRANSITION}
                  className="pointer-events-none absolute inset-0 rounded-full bg-lime-500/15 ring-1 ring-lime-600/35 dark:bg-lime-400/15 dark:ring-lime-400/35"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                <span>{t.tagAll}</span>
                <span
                  className={clsxm(
                    'text-xs leading-none tabular-nums',
                    activeTag === null
                      ? 'text-lime-700/90 dark:text-lime-300/90'
                      : 'text-zinc-400 dark:text-zinc-500'
                  )}
                >
                  {totalCount}
                </span>
              </span>
            </a>
          </li>

          {stats.map((item, idx) => {
            const isActive = activeTag === item.tag
            const isHiddenOnDesktop =
              !expanded && idx >= DEFAULT_VISIBLE_TAG_COUNT && !isActive
            const isLast = idx === stats.length - 1

            return (
              <li
                key={item.tag}
                ref={isLast ? lastTagItemRef : undefined}
                className={clsxm('shrink-0', isHiddenOnDesktop && 'sm:hidden')}
              >
                <a
                  ref={(node) => {
                    if (node) {
                      pillRefs.current.set(item.tag, node)
                    } else {
                      pillRefs.current.delete(item.tag)
                    }
                  }}
                  href={buildBlogTagHref(basePath, item.tag)}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(event) => handleTagClick(event, item.tag)}
                  className={clsxm(
                    'group relative inline-flex h-9 select-none items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-[color,box-shadow,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
                    isActive
                      ? 'text-lime-900 dark:text-lime-200'
                      : 'bg-gradient-to-b from-zinc-50/70 to-white/95 text-zinc-600 shadow-sm shadow-zinc-800/5 ring-1 ring-zinc-900/5 hover:text-zinc-900 hover:ring-zinc-900/15 dark:from-zinc-900/60 dark:to-zinc-800/90 dark:text-zinc-300 dark:ring-white/10 dark:hover:text-zinc-100 dark:hover:ring-white/20'
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="blog-tag-active-pill"
                      transition={ACTIVE_PILL_TRANSITION}
                      className="pointer-events-none absolute inset-0 rounded-full bg-lime-500/15 ring-1 ring-lime-600/35 dark:bg-lime-400/15 dark:ring-lime-400/35"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={clsxm(
                        'text-xs leading-none transition-colors',
                        isActive
                          ? 'text-lime-600 dark:text-lime-400'
                          : 'text-zinc-400 group-hover:text-lime-600 dark:text-zinc-500 dark:group-hover:text-lime-400'
                      )}
                    >
                      #
                    </span>
                    <span>{item.tag}</span>
                    <span
                      className={clsxm(
                        'text-xs leading-none tabular-nums',
                        isActive
                          ? 'text-lime-700/90 dark:text-lime-300/90'
                          : 'text-zinc-400 dark:text-zinc-500'
                      )}
                    >
                      {item.count}
                    </span>
                  </span>
                </a>
              </li>
            )
          })}

          {hiddenCount > 0 && (
            <li className="hidden shrink-0 sm:block">
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded((prev) => !prev)}
                className="inline-flex h-9 select-none items-center gap-1 rounded-full border border-dashed border-zinc-300/90 bg-transparent px-3.5 text-xs font-medium leading-none text-zinc-500 transition-[color,border-color,transform] duration-150 ease-out hover:border-zinc-400 hover:text-zinc-800 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200 dark:focus-visible:outline-lime-400"
              >
                <span>{expanded ? t.tagLess : t.tagMore(hiddenCount)}</span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={clsxm(
                    'h-3 w-3 transition-transform duration-150',
                    expanded && 'rotate-180'
                  )}
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </li>
          )}
        </ul>

        <div className="mt-3 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">
          <p aria-live="polite" aria-atomic="true">
            {activeTag
              ? t.tagStatusActive(activeTag, filteredCount)
              : t.tagStatusAll(totalCount)}
          </p>
          {activeTag !== null && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={buildBlogTagHref(basePath, null)}
                onClick={(event) => handleTagClick(event, null)}
                className="font-medium text-lime-700 underline decoration-lime-600/40 underline-offset-4 transition-colors hover:text-lime-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:text-lime-400 dark:decoration-lime-400/40 dark:hover:text-lime-300 dark:focus-visible:outline-lime-400"
              >
                {t.tagClear}
              </a>
            </>
          )}
        </div>
      </nav>
    </MotionConfig>
  )
}
