'use client'

import React from 'react'

import { getMessages, type Locale, localizePath } from '~/lib/i18n'
import {
  collectTagStats,
  matchActiveTag,
  resolveTagParam,
} from '~/lib/post-tags'

import { type BlogCardPost, BlogPostCard } from './BlogPostCard'
import { BlogTagNav } from './BlogTagNav'

export function BlogFilterableGrid({
  posts,
  viewsByPostId,
  locale = 'zh',
  initialTag = null,
  showLanguageFilter = false,
}: {
  posts: BlogCardPost[]
  viewsByPostId: Record<string, number>
  locale?: Locale
  initialTag?: string | null
  showLanguageFilter?: boolean
}) {
  const [lang, setLang] = React.useState<'all' | 'english'>('all')
  const [rawTag, setRawTag] = React.useState<string | null>(initialTag)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const isFirstRender = React.useRef(true)

  const t = getMessages(locale).blog
  const basePath = localizePath('/blog', locale)

  const englishPosts = React.useMemo(
    () => posts.filter((post) => !post.isFallback),
    [posts]
  )
  const scopedPosts = showLanguageFilter && lang === 'english' ? englishPosts : posts

  const tagStats = React.useMemo(
    () => collectTagStats(scopedPosts, locale),
    [scopedPosts, locale]
  )

  const activeTag = React.useMemo(
    () => matchActiveTag(rawTag, tagStats),
    [rawTag, tagStats]
  )

  const displayedPosts = React.useMemo(
    () =>
      activeTag
        ? scopedPosts.filter((post) => post.categories?.includes(activeTag))
        : scopedPosts,
    [scopedPosts, activeTag]
  )

  React.useEffect(() => {
    setRawTag(initialTag)
  }, [initialTag])

  React.useEffect(() => {
    function handlePopState() {
      const next = new URLSearchParams(window.location.search).get('tag')
      setRawTag(resolveTagParam(next ?? undefined, locale))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [locale])

  React.useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const cards = Array.from(gridRef.current?.children ?? [])
    cards.forEach((el, idx) => {
      if (typeof el.animate !== 'function') return
      el.animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 220,
          delay: Math.min(idx, 7) * 30,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
          fill: 'backwards',
        }
      )
    })
  }, [activeTag, lang])

  function handleSelectTag(nextTag: string | null) {
    setRawTag(nextTag)
    const nextUrl = new URL(window.location.href)
    if (nextTag) {
      nextUrl.searchParams.set('tag', nextTag)
    } else {
      nextUrl.searchParams.delete('tag')
    }
    window.history.replaceState(null, '', nextUrl)
  }

  function handleSelectLangFilter(nextLang: 'all' | 'english') {
    setLang(nextLang)
    const nextScope = nextLang === 'english' ? englishPosts : posts
    const nextStats = collectTagStats(nextScope, locale)
    if (rawTag && !matchActiveTag(rawTag, nextStats)) {
      setRawTag(null)
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.delete('tag')
      window.history.replaceState(null, '', nextUrl)
    }
  }

  return (
    <>
      <BlogTagNav
        stats={tagStats}
        activeTag={activeTag}
        totalCount={scopedPosts.length}
        filteredCount={displayedPosts.length}
        basePath={basePath}
        locale={locale}
        onSelectTag={handleSelectTag}
        showLanguageFilter={showLanguageFilter}
        langFilter={lang}
        englishCount={englishPosts.length}
        allLangCount={posts.length}
        onSelectLangFilter={handleSelectLangFilter}
      />

      {displayedPosts.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          {t.emptyFiltered}
        </p>
      ) : (
        <div
          ref={gridRef}
          className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:grid-cols-2 lg:gap-8"
        >
          {displayedPosts.map((post) => (
            <BlogPostCard
              post={post}
              views={viewsByPostId[post._id] ?? 0}
              locale={locale}
              key={post._id}
            />
          ))}
        </div>
      )}
    </>
  )
}
