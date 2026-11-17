import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogPostPage } from '~/app/(main)/blog/BlogPostPage'
import { JsonLd } from '~/components/JsonLd'
import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { url } from '~/lib'
import { redis } from '~/lib/redis'
import { buildBlogPostJsonLd } from '~/lib/structured-data'
import { getBlogPost } from '~/sanity/queries'

export const generateMetadata = async ({
  params,
}: {
  params: { slug: string }
}) => {
  const post = await getBlogPost(params.slug, 'zh')
  if (!post) {
    notFound()
  }

  const { title, description, mainImage, hasTranslation, slug } = post
  const ogImageUrl = mainImage.asset.url.startsWith('http')
    ? mainImage.asset.url
    : new URL(mainImage.asset.url, env.NEXT_PUBLIC_SITE_URL).href

  const canonicalUrl = url(`/blog/${slug}`).href

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImageUrl,
        },
      ],
      type: 'article',
    },
    twitter: {
      images: [
        {
          url: ogImageUrl,
        },
      ],
      title,
      description,
      card: 'summary_large_image',
      site: '@TommySteve1117',
      creator: '@TommySteve1117',
    },
    alternates: {
      canonical: canonicalUrl,
      ...(hasTranslation
        ? {
            languages: {
              'zh-CN': canonicalUrl,
              en: url(`/en/blog/${slug}`).href,
              'x-default': canonicalUrl,
            },
          }
        : {}),
    },
  } satisfies Metadata
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string }
}) {
  const post = await getBlogPost(params.slug, 'zh')
  if (!post) {
    notFound()
  }

  let views: number
  if (env.VERCEL_ENV === 'production') {
    views = await redis.incr(kvKeys.postViews(post._id))
  } else {
    views = 30578
  }

  let reactions: number[] = []
  try {
    if (env.VERCEL_ENV === 'production') {
      const data = await redis.get<number[]>(`reactions:${post._id}`)
      if (Array.isArray(data)) {
        reactions = data
      }
    } else {
      reactions = Array.from({ length: 4 }, () =>
        Math.floor(Math.random() * 50000)
      )
    }
  } catch (error) {
    console.error(error)
  }

  let relatedViews: number[] = []
  if (typeof post.related !== 'undefined' && post.related.length > 0) {
    if (env.VERCEL_ENV === 'development') {
      relatedViews = post.related.map(() => Math.floor(Math.random() * 1000))
    } else {
      const postIdKeys = post.related.map(({ _id }) => kvKeys.postViews(_id))
      relatedViews = await redis.mget<number[]>(...postIdKeys)
    }
  }

  return (
    <>
      <JsonLd data={buildBlogPostJsonLd(post, 'zh')} />
      <BlogPostPage
        post={post}
        views={views}
        relatedViews={relatedViews}
        reactions={reactions.length > 0 ? reactions : undefined}
      />
    </>
  )
}

export const revalidate = 60
