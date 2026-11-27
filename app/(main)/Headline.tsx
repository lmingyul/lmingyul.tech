'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import Balancer from 'react-wrap-balancer'

import { SparkleIcon, UserSecurityIcon } from '~/assets'
import { SocialLink } from '~/components/links/SocialLink'
import {
  getMessages,
  type Locale,
  localeFromPathname,
  localizePath,
} from '~/lib/i18n'

function Developer({ label }: { label: string }) {
  return (
    <span className="group">
      <span className="font-mono">&lt;</span>
      {label}
      <span className="font-mono">/&gt;</span>
      <span className="invisible inline-flex text-zinc-300 before:content-['|'] group-hover:visible group-hover:animate-typing dark:text-zinc-500" />
    </span>
  )
}

function Designer({ label }: { label: string }) {
  return (
    <span className="group relative inline-block whitespace-nowrap bg-black/5 p-1 dark:bg-white/5">
      <span className="pointer-events-none absolute inset-0 border border-lime-700/90 opacity-70 group-hover:border-dashed group-hover:opacity-100 dark:border-lime-400/90">
        <span className="absolute -left-[3.5px] -top-[3.5px] size-1.5 border border-lime-700 bg-zinc-50 dark:border-lime-400" />
        <span className="absolute -bottom-[3.5px] -right-[3.5px] size-1.5 border border-lime-700 bg-zinc-50 dark:border-lime-400" />
        <span className="absolute -bottom-[3.5px] -left-[3.5px] size-1.5 border border-lime-700 bg-zinc-50 dark:border-lime-400" />
        <span className="absolute -right-[3.5px] -top-[3.5px] size-1.5 border border-lime-700 bg-zinc-50 dark:border-lime-400" />
      </span>
      {label}
    </span>
  )
}

function OCD({ label }: { label: string }) {
  return (
    <span className="group inline-flex items-center">
      <SparkleIcon className="mr-1 inline-flex transform-gpu transition-transform duration-500 group-hover:rotate-180" />
      <span>{label}</span>
    </span>
  )
}

function Founder({ label }: { label: string }) {
  return (
    <span className="group inline-flex items-center whitespace-nowrap">
      <UserSecurityIcon className="mr-1 inline-flex group-hover:fill-zinc-600/20 dark:group-hover:fill-zinc-200/20" />
      <span>{label}</span>
    </span>
  )
}

export function Headline({ locale: localeProp }: { locale?: Locale }) {
  const pathname = usePathname()
  const locale = localeProp ?? localeFromPathname(pathname)
  const t = getMessages(locale).headline
  const sep = locale === 'en' ? ', ' : '，'

  return (
    <div className="min-w-0 max-w-2xl">
      <motion.h1
        className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl xl:text-[2.75rem] xl:leading-[1.15]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 100,
          duration: 0.3,
        }}
      >
        <Developer label={t.developer} />
        {sep}
        <span className="whitespace-nowrap">
          <Designer label={t.alchemist} />
          {sep.trimEnd()}
        </span>
        <span className="block h-2" />
        <span className="whitespace-nowrap">
          <OCD label={t.ocd} />
          {sep.trimEnd()}
        </span>
        {locale === 'en' ? ' ' : ''}
        <Founder label={t.introvert} />
      </motion.h1>
      <motion.p
        className="mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 85,
          duration: 0.3,
          delay: 0.1,
        }}
      >
        <Balancer>{t.bio}</Balancer>
      </motion.p>
      <motion.div
        className="mt-6 flex gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: 'spring',
          damping: 50,
          stiffness: 90,
          duration: 0.35,
          delay: 0.25,
        }}
      >
        <SocialLink
          href="https://x.com/TommySteve1117"
          aria-label={t.twitterLabel}
          platform="twitter"
        />
        <SocialLink
          href="https://space.bilibili.com/209721840"
          aria-label={t.bilibiliLabel}
          platform="bilibili"
        />
        <SocialLink
          href="https://github.com/lmingyul"
          aria-label={t.githubLabel}
          platform="github"
        />
        <SocialLink
          href={localizePath('/feed.xml', locale)}
          platform="rss"
          aria-label={t.rssLabel}
        />
        <SocialLink
          href="mailto:taimingliang1117@gmail.com"
          aria-label={t.mailLabel}
          platform="mail"
        />
      </motion.div>
    </div>
  )
}
