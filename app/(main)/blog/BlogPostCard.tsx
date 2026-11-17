import { parseDateTime } from '@zolplay/utils'
import Image from 'next/image'
import Link from 'next/link'

import {
  CalendarIcon,
  CursorClickIcon,
  HourglassIcon,
  ScriptIcon,
} from '~/assets'
import { getMessages, type Locale, localizePath } from '~/lib/i18n'
import { prettifyNumber } from '~/lib/math'
import { type Post } from '~/sanity/schemas/post'

export function BlogPostCard({
  post,
  views,
  locale = 'zh',
}: {
  post: Post
  views: number
  locale?: Locale
}) {
  const {
    title,
    slug,
    mainImage,
    publishedAt,
    categories,
    readingTime,
    isFallback,
  } = post
  const t = getMessages(locale).blog
  const isChineseFallbackOnEn = locale === 'en' && Boolean(isFallback)

  return (
    <Link
      href={localizePath(`/blog/${slug}`, locale)}
      prefetch={false}
      className="group relative flex w-full transform-gpu flex-col rounded-3xl bg-transparent ring-2 ring-[--post-image-bg] transition-transform hover:-translate-y-0.5"
      style={
        {
          '--post-image-fg': mainImage.asset.dominant?.foreground,
          '--post-image-bg': mainImage.asset.dominant?.background,
          '--post-image': `url(${mainImage.asset.url}`,
        } as React.CSSProperties
      }
    >
      <div className="relative aspect-[240/135] w-full">
        <Image
          src={mainImage.asset.url}
          alt=""
          className="rounded-t-3xl object-cover"
          placeholder={mainImage.asset.lqip ? 'blur' : 'empty'}
          blurDataURL={mainImage.asset.lqip}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
        />
        {isChineseFallbackOnEn && (
          <span
            aria-label="Chinese only"
            className="absolute right-3 top-3 rounded-full bg-zinc-950/75 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-100 ring-1 ring-white/20 backdrop-blur-sm"
          >
            ZH
          </span>
        )}
      </div>
      <span className="relative z-10 flex w-full flex-1 shrink-0 flex-col justify-between gap-0.5 rounded-b-[calc(1.5rem+1px)] bg-cover bg-bottom bg-no-repeat p-4 bg-blend-overlay [background-image:var(--post-image)] before:pointer-events-none before:absolute before:inset-0 before:z-10 before:select-none before:rounded-b-[calc(1.5rem-1px)] before:bg-[--post-image-bg] before:opacity-70 before:transition-opacity after:pointer-events-none after:absolute after:inset-0 after:z-10 after:select-none after:rounded-b-[calc(1.5rem-1px)] after:bg-gradient-to-b after:from-transparent after:to-[--post-image-bg] after:backdrop-blur after:transition-opacity group-hover:before:opacity-30 md:p-5">
        <h2
          lang={isChineseFallbackOnEn ? 'zh-CN' : undefined}
          className="z-20 text-base font-bold tracking-tight text-[--post-image-fg] opacity-70 transition-opacity group-hover:opacity-100 md:text-xl"
        >
          {title}
        </h2>

        <span className="relative z-20 flex items-center justify-between opacity-50 transition-opacity group-hover:opacity-80">
          <span className="inline-flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1 text-[12px] font-medium text-[--post-image-fg] md:text-sm">
              <CalendarIcon />
              <span>
                {parseDateTime({ date: new Date(publishedAt) })?.format(
                  'YYYY/MM/DD'
                )}
              </span>
            </span>

            {Array.isArray(categories) && (
              <span className="inline-flex items-center space-x-1 text-[12px] font-medium text-[--post-image-fg] md:text-sm">
                <ScriptIcon />
                <span lang={isChineseFallbackOnEn ? 'zh-CN' : undefined}>
                  {categories.join(', ')}
                </span>
              </span>
            )}
          </span>
          <span className="inline-flex items-center space-x-3 text-[12px] font-medium text-[--post-image-fg] md:text-xs">
            <span className="inline-flex items-center space-x-1">
              <CursorClickIcon />
              <span>{prettifyNumber(views, locale !== 'en')}</span>
            </span>

            <span className="inline-flex items-center space-x-1">
              <HourglassIcon />
              <span>
                {readingTime.toFixed(0)}
                {t.readingTimeSuffix}
              </span>
            </span>
          </span>
        </span>
      </span>
    </Link>
  )
}
