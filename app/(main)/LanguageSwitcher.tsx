'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { Tooltip } from '~/components/ui/Tooltip'
import {
  getMessages,
  localeFromPathname,
  switchLocalePath,
} from '~/lib/i18n'

export function LanguageSwitcher() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const targetLocale = locale === 'en' ? 'zh' : 'en'
  const targetHref = switchLocalePath(pathname || '/', targetLocale)
  const t = getMessages(locale).nav
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
  }, [locale])

  return (
    <Tooltip.Provider disableHoverableContent>
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <Link
            href={targetHref}
            lang={targetLocale === 'en' ? 'en' : 'zh-CN'}
            hrefLang={targetLocale === 'en' ? 'en' : 'zh-CN'}
            aria-label={t.switchToLanguageLabel}
            className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 text-xs font-semibold tracking-wide text-zinc-700 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition hover:text-lime-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:from-zinc-900/50 dark:to-zinc-800/90 dark:text-zinc-200 dark:ring-white/10 dark:hover:text-lime-400 dark:focus-visible:outline-lime-400"
          >
            {t.switchToLanguageShort}
          </Link>
        </Tooltip.Trigger>
        <AnimatePresence>
          {open && (
            <Tooltip.Portal forceMount>
              <Tooltip.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {t.switchToLanguageTooltip}
                </motion.div>
              </Tooltip.Content>
            </Tooltip.Portal>
          )}
        </AnimatePresence>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
