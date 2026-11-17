import Image from 'next/image'
import React from 'react'

import { BriefcaseIcon } from '~/assets'
import { getMessages, type Locale } from '~/lib/i18n'

type ResumeItem = {
  company: string
  companyEn?: string
  title: string
  titleEn?: string
  start: string
  end?: string | null
  logo: string
}

export function Resume({
  resume,
  locale = 'zh',
}: {
  resume: ResumeItem[]
  locale?: Locale
}) {
  const t = getMessages(locale).resume

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-5 w-5 flex-none" />
        <span className="ml-2">{t.heading}</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {resume.map((role, roleIndex) => {
          const company =
            locale === 'en' && role.companyEn ? role.companyEn : role.company
          const title =
            locale === 'en' && role.titleEn ? role.titleEn : role.title

          return (
            <li key={roleIndex} className="flex gap-4">
              <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                <Image
                  src={role.logo}
                  alt={company}
                  className="h-8 w-8 rounded-full bg-white object-contain p-0.5"
                  width={100}
                  height={100}
                  unoptimized
                />
              </div>
              <dl className="flex flex-auto flex-wrap gap-x-2">
                <dt className="sr-only">{t.companySr}</dt>
                <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {company}
                </dd>
                <dt className="sr-only">{t.roleSr}</dt>
                <dd className="text-xs text-zinc-500 dark:text-zinc-400">
                  {title}
                </dd>
                <dt className="sr-only">{t.periodSr}</dt>
                <dd className="ml-auto text-xs text-zinc-500/80 dark:text-zinc-400/80">
                  {role.start}
                  <span aria-hidden="true">—</span> {role.end || t.present}
                </dd>
              </dl>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
