import React from 'react'

import { AskMe } from '~/app/(main)/AskMe'
import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
import { Headline } from '~/app/(main)/Headline'
import { Photos } from '~/app/(main)/Photos'
import { Resume } from '~/app/(main)/Resume'
import { PencilSwooshIcon } from '~/assets'
import { Container } from '~/components/ui/Container'
import { getMessages, type Locale } from '~/lib/i18n'
import { getAllLatestBlogPostSlugs, getSettings } from '~/sanity/queries'

export async function HomePageView({ locale = 'zh' }: { locale?: Locale }) {
  const [settings, postSlugs] = await Promise.all([
    getSettings(),
    getAllLatestBlogPostSlugs(locale),
  ])
  const t = getMessages(locale).home

  return (
    <>
      <Container className="mt-10">
        <Headline locale={locale} />
      </Container>

      {settings?.heroPhotos && (
        <Photos photos={settings.heroPhotos} locale={locale} />
      )}

      <Container className="mt-24 md:mt-28">
        <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col gap-6 pt-6">
            <h2 className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <PencilSwooshIcon className="h-5 w-5 flex-none" />
              <span className="ml-2">{t.recentPosts}</span>
            </h2>
            <BlogPosts
              locale={locale}
              preferTranslated={locale === 'en'}
            />
          </div>
          <aside className="space-y-10 lg:sticky lg:top-8 lg:h-fit lg:pl-16 xl:pl-20">
            <AskMe postCount={postSlugs.length} locale={locale} />
            {settings?.resume && (
              <Resume resume={settings.resume} locale={locale} />
            )}
          </aside>
        </div>
      </Container>
    </>
  )
}
