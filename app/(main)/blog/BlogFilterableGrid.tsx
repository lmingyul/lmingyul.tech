'use client'

import { clsxm } from '@zolplay/utils'
import React from 'react'

import { getMessages, type Locale } from '~/lib/i18n'
import { type Post } from '~/sanity/schemas/post'

import { BlogPostCard } from './BlogPostCard'

export function BlogFilterableGrid({
  posts,
  viewsByPostId,
  locale = 'en',
}: {
  posts: Post[]
  viewsByPostId: Record<string, number>
  locale?: Locale
}) {
  const [filter, setFilter] = React.useState<'all' | 'english'>('all')
  const t = getMessages(locale).blog

  const englishPosts = React.useMemo(
    () => posts.filter((post) => !post.isFallback),
    [posts]
  )
  const displayedPosts = filter === 'english' ? englishPosts : posts

  return (
    <>
      <search aria-label={t.filterAria} className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={filter === 'all'}
          onClick={() => setFilter('all')}
          className={clsxm(
            'min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
            filter === 'all'
              ? 'border-lime-500/50 bg-lime-500/15 font-semibold text-lime-800 dark:border-lime-400/40 dark:bg-lime-400/15 dark:text-lime-300'
              : 'border-zinc-200/80 bg-white/70 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-zinc-200'
          )}
        >
          {t.filterAll(posts.length)}
        </button>
        <button
          type="button"
          aria-pressed={filter === 'english'}
          onClick={() => setFilter('english')}
          className={clsxm(
            'min-h-[36px] rounded-full border px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:focus-visible:outline-lime-400',
            filter === 'english'
              ? 'border-lime-500/50 bg-lime-500/15 font-semibold text-lime-800 dark:border-lime-400/40 dark:bg-lime-400/15 dark:text-lime-300'
              : 'border-zinc-200/80 bg-white/70 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-400 dark:hover:text-zinc-200'
          )}
        >
          {t.filterEnglish(englishPosts.length)}
        </button>
      </search>

      {displayedPosts.length === 0 ? (
        <p className="mt-10 text-sm text-zinc-500 dark:text-zinc-400">
          {t.emptyFiltered}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 lg:grid-cols-2 lg:gap-8">
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
