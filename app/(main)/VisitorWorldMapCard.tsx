'use client'

import dynamic from 'next/dynamic'
import React from 'react'

import { getMessages, type Locale } from '~/lib/i18n'

function GlobeSkeleton({ locale }: { locale: Locale }) {
  const t = getMessages(locale).visitorMap
  return (
    <div
      aria-label={t.canvasAria}
      className="relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50/85 shadow-sm sm:h-[300px] lg:h-[296px] xl:h-[316px] dark:border-zinc-800/90 dark:bg-zinc-900/75"
    >
      <div className="h-[224px] w-[224px] animate-pulse rounded-full border border-zinc-200/80 bg-zinc-200/50 dark:border-zinc-700/60 dark:bg-zinc-800/50" />
      <div className="absolute left-3 top-3 rounded-full border border-zinc-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-500 dark:border-zinc-700/70 dark:bg-zinc-900/80 dark:text-zinc-400">
        {t.loading}
      </div>
    </div>
  )
}

const LazyVisitorWorldMap = dynamic(
  () =>
    import('~/app/(main)/VisitorWorldMap').then((mod) => mod.VisitorWorldMap),
  {
    ssr: false,
  }
)

export function VisitorWorldMapCard({ locale }: { locale: Locale }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <GlobeSkeleton locale={locale} />
  }

  return <LazyVisitorWorldMap locale={locale} />
}
