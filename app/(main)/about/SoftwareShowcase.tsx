'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import {
  type SoftwareGroupKey,
  type SoftwareItem,
} from '~/app/(main)/about/tools-data'
import { type Locale } from '~/lib/i18n'

type SoftwareShowcaseProps = {
  locale: Locale
  groups: { key: SoftwareGroupKey; label: string }[]
  items: SoftwareItem[]
}

export function SoftwareShowcase({
  locale,
  groups,
  items,
}: SoftwareShowcaseProps) {
  const [activeGroup, setActiveGroup] = useState<'all' | SoftwareGroupKey>(
    'all',
  )
  const isEn = locale === 'en'

  const groupedItems = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          apps: items.filter((item) => item.group === group.key),
        }))
        .filter((group) => group.apps.length > 0),
    [groups, items],
  )

  const visibleGroups =
    activeGroup === 'all'
      ? groupedItems
      : groupedItems.filter((group) => group.key === activeGroup)

  return (
    <div>
      <div
        role="tablist"
        aria-label={isEn ? 'Software categories' : '软件分类筛选'}
        className="mb-7 flex flex-wrap gap-2"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeGroup === 'all'}
          onClick={() => setActiveGroup('all')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            activeGroup === 'all'
              ? 'bg-lime-500/15 text-lime-700 ring-1 ring-lime-500/30 dark:bg-lime-400/15 dark:text-lime-300 dark:ring-lime-400/30'
              : 'bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/70'
          }`}
        >
          <span>{isEn ? 'All' : '全部'}</span>
          <span className="tabular-nums opacity-70">{items.length}</span>
        </button>

        {groupedItems.map((group) => {
          const selected = activeGroup === group.key
          return (
            <button
              key={group.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveGroup(group.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                selected
                  ? 'bg-lime-500/15 text-lime-700 ring-1 ring-lime-500/30 dark:bg-lime-400/15 dark:text-lime-300 dark:ring-lime-400/30'
                  : 'bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/70 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700/70'
              }`}
            >
              <span>{group.label}</span>
              <span className="tabular-nums opacity-70">
                {group.apps.length}
              </span>
            </button>
          )
        })}
      </div>

      <div className="space-y-9">
        {visibleGroups.map((group) => (
          <div key={group.key}>
            <div className="mb-4 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {group.label}
              </h3>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                {group.apps.length}
              </span>
              <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {group.apps.map((app) => (
                <article
                  key={app.id}
                  className="group flex items-center gap-3.5 rounded-2xl border border-zinc-100 bg-white/70 p-4 shadow-sm transition hover:border-lime-500/40 hover:shadow-md dark:border-zinc-700/40 dark:bg-zinc-900/60 dark:hover:border-lime-400/30"
                >
                  <Image
                    src={app.icon}
                    alt={app.name}
                    width={96}
                    height={96}
                    className="h-12 w-12 shrink-0 rounded-xl object-contain transition duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {app.name}
                    </h4>
                    {app.note && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                        {app.note}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
