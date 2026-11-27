import { count, isNotNull } from 'drizzle-orm'
import React from 'react'

import { AskMe } from '~/app/(main)/AskMe'
import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
import { Headline } from '~/app/(main)/Headline'
import { Newsletter } from '~/app/(main)/Newsletter'
import { Photos } from '~/app/(main)/Photos'
import { Resume } from '~/app/(main)/Resume'
import { TrendingSection } from '~/app/(main)/TrendingSection'
import { VisitorWorldMapCard } from '~/app/(main)/VisitorWorldMapCard'
import { PencilSwooshIcon } from '~/assets'
import { Container } from '~/components/ui/Container'
import { db } from '~/db'
import { subscribers } from '~/db/schema'
import { getMessages, type Locale } from '~/lib/i18n'
import { getAllLatestBlogPostSlugs, getSettings } from '~/sanity/queries'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

async function getSubscriberCount(): Promise<number> {
  if (isBuildPhase) {
    return 0
  }
  try {
    const [subs] = await db
      .select({
        subCount: count(),
      })
      .from(subscribers)
      .where(isNotNull(subscribers.subscribedAt))
    return subs?.subCount ?? 0
  } catch (err) {
    console.error('[HomePageView.getSubscriberCount]', err)
    return 0
  }
}

export async function HomePageView({ locale = 'zh' }: { locale?: Locale }) {
  const [settings, postSlugs, subCount] = await Promise.all([
    getSettings(),
    getAllLatestBlogPostSlugs(locale),
    getSubscriberCount(),
  ])
  const t = getMessages(locale).home

  return (
    <>
      <Container className="mt-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_310px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <Headline locale={locale} />
          <VisitorWorldMapCard locale={locale} />
        </div>
      </Container>

      {settings?.heroPhotos && (
        <Photos photos={settings.heroPhotos} locale={locale} />
      )}

      <React.Suspense fallback={null}>
        <TrendingSection locale={locale} />
      </React.Suspense>

      <Container className="mt-16 md:mt-20">
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
          <aside className="space-y-8 lg:sticky lg:top-8 lg:h-fit lg:pl-16 xl:pl-20">
            <AskMe postCount={postSlugs.length} locale={locale} />
            {settings?.resume && (
              <Resume resume={settings.resume} locale={locale} />
            )}
            <Newsletter subCount={`${subCount}`} locale={locale} />
          </aside>
        </div>
      </Container>
    </>
  )
}
