'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { clsxm } from '@zolplay/utils'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { SearchIcon, SparkleIcon, XIcon } from '~/assets'
import { Tooltip } from '~/components/ui/Tooltip'
import { getMessages, localeFromPathname } from '~/lib/i18n'
import type { SearchResponse, SearchTypeFilter } from '~/lib/search'

const SEARCH_DEBOUNCE_MS = 180
const LOADING_DELAY_MS = 120

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  if (!text || terms.length === 0) {
    return <>{text}</>
  }

  const normalizedTerms = Array.from(
    new Set(
      terms
        .map((term) => term.normalize('NFKC').trim().toLowerCase())
        .filter(Boolean)
    )
  ).sort((a, b) => b.length - a.length)

  if (normalizedTerms.length === 0) {
    return <>{text}</>
  }

  const pattern = new RegExp(`(${normalizedTerms.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, idx) => {
        if (!part) return null
        const lower = part.normalize('NFKC').toLowerCase()
        const isMatch = normalizedTerms.includes(lower)
        if (!isMatch) {
          return <React.Fragment key={idx}>{part}</React.Fragment>
        }
        return (
          <mark
            key={idx}
            className="rounded bg-lime-200/80 px-0.5 text-zinc-900 dark:bg-lime-400/25 dark:text-lime-200"
          >
            {part}
          </mark>
        )
      })}
    </>
  )
}

export function SiteSearch() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = localeFromPathname(pathname)
  const t = getMessages(locale).search

  const [open, setOpen] = React.useState(false)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const [shortcutHint, setShortcutHint] = React.useState('⌘K')
  const [query, setQuery] = React.useState('')
  const [filterType, setFilterType] = React.useState<SearchTypeFilter>('all')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const [response, setResponse] = React.useState<SearchResponse | null>(null)
  const [showSpinner, setShowSpinner] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [retryToken, setRetryToken] = React.useState(0)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const itemRefs = React.useRef<(HTMLAnchorElement | null)[]>([])
  const isComposingRef = React.useRef(false)

  React.useEffect(() => {
    const isApple = /mac|iphone|ipad|ipod/i.test(navigator.platform)
    setShortcutHint(isApple ? '⌘K' : 'Ctrl K')
  }, [])

  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault()
        setOpen((prev) => !prev)
        return
      }

      if (
        !open &&
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !isTypingElement(event.target)
      ) {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  React.useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    const trimmed = query.trim()
    const delayMs = trimmed ? SEARCH_DEBOUNCE_MS : 0
    let loadingTimer: number | null = null

    const fetchTimer = window.setTimeout(async () => {
      setErrorMessage(null)
      loadingTimer = window.setTimeout(() => {
        setShowSpinner(true)
      }, LOADING_DELAY_MS)

      try {
        const params = new URLSearchParams({
          q: trimmed,
          locale,
          type: filterType,
          limit: '20',
        })
        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        const data = (await res.json()) as SearchResponse
        setResponse(data)
        setActiveIndex(0)
      } catch (err) {
        if (controller.signal.aborted) return
        console.error('[SiteSearch]', err)
        setErrorMessage(t.errorMessage)
      } finally {
        if (loadingTimer !== null) {
          window.clearTimeout(loadingTimer)
        }
        if (!controller.signal.aborted) {
          setShowSpinner(false)
        }
      }
    }, delayMs)

    return () => {
      controller.abort()
      window.clearTimeout(fetchTimer)
      if (loadingTimer !== null) {
        window.clearTimeout(loadingTimer)
      }
      setShowSpinner(false)
    }
  }, [open, query, locale, filterType, retryToken, t.errorMessage])

  const results = response?.results ?? []
  const counts = response?.counts ?? { all: 0, post: 0, 'ai-daily': 0 }
  const highlightTerms = response?.terms ?? []

  React.useEffect(() => {
    if (results.length === 0) {
      setActiveIndex(0)
      return
    }
    if (activeIndex >= results.length) {
      setActiveIndex(results.length - 1)
    }
  }, [results.length, activeIndex])

  React.useEffect(() => {
    if (!open) return
    const target = itemRefs.current[activeIndex]
    target?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open, results.length])

  const navigateToResult = React.useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (isComposingRef.current || event.nativeEvent.isComposing) {
      return
    }

    if (event.key === 'ArrowDown') {
      if (results.length === 0) return
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      if (results.length === 0) return
      event.preventDefault()
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      const selected = results[activeIndex]
      if (!selected) return
      event.preventDefault()
      navigateToResult(selected.href)
    }
  }

  const tabs: { key: SearchTypeFilter; label: string; count: number }[] = [
    { key: 'all', label: t.tabAll, count: counts.all },
    { key: 'post', label: t.tabPost, count: counts.post },
    { key: 'ai-daily', label: t.tabAiDaily, count: counts['ai-daily'] },
  ]

  return (
    <>
      <Tooltip.Provider disableHoverableContent>
        <Tooltip.Root open={tooltipOpen} onOpenChange={setTooltipOpen}>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              aria-label={t.triggerAria}
              onClick={() => setOpen(true)}
              className="group flex h-10 items-center justify-center rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 text-sm shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition hover:text-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:text-lime-400 dark:hover:ring-white/20 dark:focus-visible:outline-lime-400"
            >
              <SearchIcon className="h-5 w-5 text-zinc-600 transition group-hover:text-lime-600 dark:text-zinc-300 dark:group-hover:text-lime-400" />
            </button>
          </Tooltip.Trigger>

          <AnimatePresence>
            {tooltipOpen && (
              <Tooltip.Portal forceMount>
                <Tooltip.Content asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    {`${t.triggerTooltip} (${shortcutHint})`}
                  </motion.div>
                </Tooltip.Content>
              </Tooltip.Portal>
            )}
          </AnimatePresence>
        </Tooltip.Root>
      </Tooltip.Provider>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-zinc-900/45 backdrop-blur-sm dark:bg-black/70" />
          <DialogPrimitive.Content
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              inputRef.current?.focus()
            }}
            className="fixed left-1/2 top-[8vh] z-50 flex max-h-[82vh] w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-white/95 shadow-2xl shadow-zinc-900/20 ring-1 ring-zinc-900/10 backdrop-blur-xl focus:outline-none dark:bg-zinc-900/95 dark:shadow-black/60 dark:ring-white/15 sm:top-[10vh]"
          >
            <DialogPrimitive.Title className="sr-only">
              {t.dialogTitle}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {t.dialogDescription}
            </DialogPrimitive.Description>

            {/* Search Input Header */}
            <div className="flex items-center gap-2.5 border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-800">
              <SearchIcon
                className={clsxm(
                  'h-5 w-5 shrink-0 transition-colors',
                  showSpinner
                    ? 'animate-pulse text-lime-600 dark:text-lime-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                onCompositionStart={() => {
                  isComposingRef.current = true
                }}
                onCompositionEnd={() => {
                  isComposingRef.current = false
                }}
                placeholder={t.placeholder}
                aria-label={t.dialogTitle}
                autoComplete="off"
                spellCheck={false}
                className="min-w-0 flex-1 bg-transparent text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100 dark:placeholder:text-zinc-500 [&::-webkit-search-cancel-button]:hidden"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    inputRef.current?.focus()
                  }}
                  aria-label={t.clearQuery}
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
              <DialogPrimitive.Close
                aria-label={t.closeModal}
                className="inline-flex shrink-0 items-center justify-center rounded-lg border border-zinc-200/90 bg-zinc-50 px-2 py-1 font-mono text-[11px] font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                ESC
              </DialogPrimitive.Close>
            </div>

            {/* Scope Filter Tabs */}
            <div
              role="tablist"
              aria-label={t.tabsAria}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 px-4 py-2 dark:border-zinc-800/80"
            >
              <div className="flex items-center gap-1.5">
                {tabs.map((tab) => {
                  const selected = filterType === tab.key
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => {
                        setFilterType(tab.key)
                        setActiveIndex(0)
                      }}
                      className={clsxm(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition',
                        selected
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                          : 'bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
                      )}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={clsxm(
                          'tabular-nums text-[11px]',
                          selected
                            ? 'text-zinc-300 dark:text-zinc-600'
                            : 'text-zinc-400 dark:text-zinc-500'
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                {showSpinner
                  ? t.searching
                  : response?.isDefault
                    ? t.recentHeading
                    : response
                      ? t.resultsSummary(results.length)
                      : null}
              </div>
            </div>

            {/* Results Body */}
            <div
              role="listbox"
              aria-label={t.dialogTitle}
              className="min-h-[12rem] flex-1 overflow-y-auto overscroll-contain p-2"
            >
              {errorMessage ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {errorMessage}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRetryToken((prev) => prev + 1)}
                    className="mt-3 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  {response ? (
                    <>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {query.trim()
                          ? t.emptyTitle(query.trim())
                          : t.recentEmptyTitle}
                      </p>
                      <p className="mt-1.5 max-w-md text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                        {t.emptyHint}
                      </p>
                      {filterType !== 'all' && counts.all > 0 && (
                        <button
                          type="button"
                          onClick={() => setFilterType('all')}
                          className="mt-3 rounded-full border border-lime-500/30 bg-lime-500/10 px-3.5 py-1.5 text-xs font-medium text-lime-700 transition hover:bg-lime-500/20 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300"
                        >
                          {t.switchToAll(counts.all)}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {t.searching}
                    </p>
                  )}
                </div>
              ) : (
                <ul className="space-y-1">
                  {results.map((item, idx) => {
                    const isActive = idx === activeIndex
                    const isDaily = item.type === 'ai-daily'
                    return (
                      <li key={`${item.id}-${item.href}`}>
                        <Link
                          ref={(el) => {
                            itemRefs.current[idx] = el
                          }}
                          href={item.href}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={(event) => {
                            if (
                              event.metaKey ||
                              event.ctrlKey ||
                              event.shiftKey ||
                              event.altKey
                            ) {
                              return
                            }
                            setOpen(false)
                          }}
                          className={clsxm(
                            'group block rounded-xl px-3.5 py-2.5 transition-colors',
                            isActive
                              ? 'bg-zinc-100/90 ring-1 ring-zinc-200/80 dark:bg-zinc-800/80 dark:ring-zinc-700/80'
                              : 'hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={clsxm(
                                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
                                isDaily
                                  ? 'border border-lime-500/30 bg-lime-500/10 text-lime-700 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300'
                                  : 'bg-zinc-200/80 text-zinc-700 dark:bg-zinc-700/70 dark:text-zinc-300'
                              )}
                            >
                              {isDaily && (
                                <SparkleIcon
                                  className="h-3 w-3 flex-none"
                                  aria-hidden="true"
                                />
                              )}
                              <span>
                                {isDaily ? t.badgeAiDaily : t.badgePost}
                              </span>
                            </span>

                            {item.isFallback && (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                                {t.fallbackBadge}
                              </span>
                            )}

                            <span className="ml-auto flex items-center gap-2 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                              <span>{item.date}</span>
                              <span>·</span>
                              <span>{t.minRead(item.readingTime)}</span>
                            </span>
                          </div>

                          <div className="mt-1.5 text-sm font-semibold leading-snug text-zinc-900 group-hover:text-lime-700 dark:text-zinc-100 dark:group-hover:text-lime-300">
                            <HighlightText
                              text={item.title}
                              terms={highlightTerms}
                            />
                          </div>

                          {item.matchedHeading && (
                            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-lime-700/90 dark:text-lime-400/90">
                              <span aria-hidden="true">§</span>
                              <span className="truncate">
                                <HighlightText
                                  text={item.matchedHeading}
                                  terms={highlightTerms}
                                />
                              </span>
                            </div>
                          )}

                          {item.snippet && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                              <HighlightText
                                text={item.snippet}
                                terms={highlightTerms}
                              />
                            </p>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Keyboard Footer */}
            <div className="hidden items-center justify-between border-t border-zinc-100 bg-zinc-50/70 px-4 py-2 text-[11px] text-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-500 sm:flex">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    ↑↓
                  </kbd>
                  <span>{t.keyNavigate}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    ↵
                  </kbd>
                  <span>{t.keyOpen}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                    ESC
                  </kbd>
                  <span>{t.keyClose}</span>
                </span>
              </div>
              <span className="font-mono text-[10px]">{shortcutHint}</span>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  )
}
