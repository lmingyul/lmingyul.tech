'use client'

import { extendDateTime, parseDateTime } from '@zolplay/utils'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Balancer from 'react-wrap-balancer'

import { BlogPostStateLoader } from '~/app/(main)/blog/BlogPostStateLoader'
import { BlogReactions } from '~/app/(main)/blog/BlogReactions'
import {
  CalendarIcon,
  CursorClickIcon,
  HourglassIcon,
  PencilSwooshIcon,
  ScriptIcon,
  UTurnLeftIcon,
} from '~/assets'
import { ClientOnly } from '~/components/ClientOnly'
import { PostPortableText } from '~/components/PostPortableText'
import { Prose } from '~/components/Prose'
import { Button } from '~/components/ui/Button'
import { Container } from '~/components/ui/Container'
import { getMessages, type Locale, localizePath } from '~/lib/i18n'
import { prettifyNumber } from '~/lib/math'
import { buildBlogTagHref, localizePostTags } from '~/lib/post-tags'
import { type PostDetail } from '~/sanity/schemas/post'

import { AiSummaryCard } from './AiSummaryCard'
import { BlogPostCard } from './BlogPostCard'
import { BlogPostTableOfContents } from './BlogPostTableOfContents'

extendDateTime()

export function BlogPostPage({
  post,
  views,
  reactions,
  relatedViews,
  locale = 'zh',
}: {
  post: PostDetail
  views?: number
  reactions?: number[]
  relatedViews: number[]
  locale?: Locale
}) {
  const t = getMessages(locale).blog
  const isFallbackArticle = locale === 'en' && Boolean(post.isFallback)
  const otherLocale: Locale = locale === 'en' ? 'zh' : 'en'
  const otherLocaleHref = localizePath(`/blog/${post.slug}`, otherLocale)
  const localizedCategories = localizePostTags(post.categories, locale)
  const blogBasePath = localizePath('/blog', locale)

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="w-full md:flex md:justify-between xl:relative">
        <aside className="hidden w-[160px] shrink-0 lg:block">
          <div className="sticky top-2 pt-20">
            <BlogPostTableOfContents headings={post.headings} />
          </div>
        </aside>
        <div className="max-w-2xl md:flex-1 md:shrink-0">
          <Button
            href={localizePath('/blog', locale)}
            variant="secondary"
            aria-label={t.backToBlog}
            className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0"
          >
            <UTurnLeftIcon className="h-8 w-8 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
          </Button>
          <article
            data-postid={post._id}
            lang={isFallbackArticle ? 'zh-CN' : undefined}
          >
            <header className="relative flex flex-col items-center pb-5 after:absolute after:-bottom-1 after:block after:h-px after:w-full after:rounded after:bg-gradient-to-r after:from-zinc-400/20 after:via-zinc-200/10 after:to-transparent dark:after:from-zinc-600/20 dark:after:via-zinc-700/10">
              <motion.div
                className="relative mb-7 aspect-[240/135] w-full md:mb-12 md:w-[120%]"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                }}
              >
                <div className="absolute z-0 hidden aspect-[240/135] w-full blur-xl saturate-150 after:absolute after:inset-0 after:hidden after:bg-white/50 dark:after:bg-black/50 md:block md:after:block">
                  <Image
                    src={post.mainImage.asset.url}
                    alt=""
                    className="select-none"
                    unoptimized
                    fill
                    aria-hidden={true}
                  />
                </div>
                <Image
                  src={post.mainImage.asset.url}
                  alt={post.title}
                  className="select-none rounded-2xl ring-1 ring-zinc-900/5 transition dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 md:rounded-3xl"
                  placeholder={post.mainImage.asset.lqip ? 'blur' : 'empty'}
                  blurDataURL={post.mainImage.asset.lqip}
                  unoptimized
                  fill
                />
              </motion.div>
              <motion.div
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-600/80 dark:text-zinc-400/80"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                <time
                  dateTime={post.publishedAt}
                  className="flex items-center space-x-1.5"
                >
                  <CalendarIcon />
                  <span>
                    {parseDateTime({
                      date: new Date(post.publishedAt),
                      timezone: 'Asia/Shanghai',
                    })?.format('YYYY/MM/DD')}
                  </span>
                </time>
                {localizedCategories.length > 0 && (
                  <span
                    lang={isFallbackArticle ? 'en' : undefined}
                    className="inline-flex flex-wrap items-center gap-1.5"
                  >
                    <ScriptIcon className="shrink-0" />
                    {localizedCategories.map((tag) => (
                      <Link
                        key={tag}
                        href={buildBlogTagHref(blogBasePath, tag)}
                        className="inline-flex items-center rounded-md bg-zinc-100/90 px-2 py-0.5 text-xs font-medium leading-4 text-zinc-700 ring-1 ring-zinc-900/5 transition-[color,background-color,box-shadow,transform] duration-150 ease-out hover:bg-lime-500/15 hover:text-lime-800 hover:ring-lime-600/30 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-600 dark:bg-zinc-800/80 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-lime-400/15 dark:hover:text-lime-300 dark:hover:ring-lime-400/30 dark:focus-visible:outline-lime-400"
                      >
                        {tag}
                      </Link>
                    ))}
                  </span>
                )}
              </motion.div>
              <motion.h1
                className="mt-6 w-full text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 150,
                  damping: 30,
                  delay: 0.2,
                }}
              >
                <Balancer>{post.title}</Balancer>
              </motion.h1>
              <motion.p
                className="my-5 w-full text-sm font-medium text-zinc-500"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  delay: 0.23,
                }}
              >
                {post.description}
              </motion.p>
              <motion.div
                lang={isFallbackArticle ? 'en' : undefined}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-700/50 dark:text-zinc-300/50"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.15,
                  type: 'spring',
                  stiffness: 150,
                  damping: 20,
                  delay: 0.255,
                }}
              >
                <span
                  className="inline-flex items-center space-x-1.5"
                  title={views?.toString()}
                >
                  <CursorClickIcon />
                  <span>
                    {prettifyNumber(views ?? 0, locale !== 'en')}
                    {t.viewsSuffix}
                  </span>
                </span>

                <span className="inline-flex items-center space-x-1.5">
                  <HourglassIcon />
                  <span>
                    {post.readingTime.toFixed(0)}
                    {t.readingTimeSuffix}
                  </span>
                </span>

                {post.hasTranslation && !post.isFallback && (
                  <Link
                    href={otherLocaleHref}
                    lang={otherLocale === 'en' ? 'en' : 'zh-CN'}
                    hrefLang={otherLocale === 'en' ? 'en' : 'zh-CN'}
                    className="ml-auto inline-flex items-center rounded-full border border-lime-500/35 bg-lime-500/10 px-2.5 py-0.5 text-xs font-medium text-lime-700 transition hover:bg-lime-500/20 dark:border-lime-400/30 dark:bg-lime-400/10 dark:text-lime-300"
                  >
                    {t.readOtherLang}
                  </Link>
                )}
              </motion.div>
            </header>
            {isFallbackArticle && (
              <div
                lang="en"
                className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-amber-50/70 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-400/25 dark:bg-amber-950/25 dark:text-amber-200"
              >
                <span>{t.fallbackBanner}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  lang="zh-CN"
                  className="font-semibold underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100"
                >
                  {t.fallbackLinkLabel}
                </Link>
              </div>
            )}
            {post.aiSummary && (
              <AiSummaryCard
                key={`${locale}:${post.slug}`}
                aiSummary={post.aiSummary}
                locale={locale}
                lang={isFallbackArticle ? 'en' : undefined}
              />
            )}
            <Prose className="mt-8">
              <PostPortableText value={post.body} />
            </Prose>
          </article>
        </div>
        <aside className="hidden w-[90px] shrink-0 lg:block">
          <div className="sticky top-2 flex justify-end pt-20">
            <BlogReactions
              _id={post._id}
              mood={post.mood}
              reactions={reactions}
            />
          </div>
        </aside>
      </div>

      {post.related && post.related.length > 0 ? (
        <section className="mb-12 mt-32">
          <h2 className="mb-6 flex items-center justify-center text-lg font-bold text-zinc-900 dark:text-zinc-100">
            <PencilSwooshIcon className="h-5 w-5 flex-none" />
            <span className="ml-2">{t.relatedHeading}</span>
          </h2>

          <div className="mt-6 grid grid-cols-1 justify-center gap-6 md:grid-cols-[repeat(auto-fit,75%)] lg:grid-cols-[repeat(auto-fit,45%)] lg:gap-8">
            {post.related.map((post, idx) => (
              <BlogPostCard
                post={post}
                views={relatedViews[idx] ?? 0}
                locale={locale}
                key={post._id}
              />
            ))}
          </div>
        </section>
      ) : null}

      <ClientOnly>
        <BlogPostStateLoader post={post} />
      </ClientOnly>
    </Container>
  )
}
