import RSS from 'rss'

import { getMessages } from '~/lib/i18n'
import { seo } from '~/lib/seo'
import { getLatestBlogPosts } from '~/sanity/queries'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const enSeo = getMessages('en').seo

export async function GET() {
  const feed = new RSS({
    title: enSeo.defaultTitle,
    description: enSeo.description,
    site_url: `${seo.url.href}en`,
    feed_url: `${seo.url.href}en/feed.xml`,
    language: 'en',
    image_url: `${seo.url.href}opengraph-image.png`,
    generator: 'Next.js (lmingyul.top)',
  })

  const data = await getLatestBlogPosts({ limit: 999, locale: 'en' })
  if (!data) {
    return new Response('Not found', { status: 404 })
  }

  data
    .filter((post) => !post.isFallback)
    .forEach((post) => {
      const enclosureUrl = post.mainImage.asset.url.startsWith('http')
        ? post.mainImage.asset.url
        : new URL(post.mainImage.asset.url, seo.url).href
      feed.item({
        title: post.title,
        guid: post._id,
        url: `${seo.url.href}en/blog/${post.slug}`,
        description: post.description,
        date: new Date(post.publishedAt),
        enclosure: {
          url: enclosureUrl,
        },
      })
    })

  return new Response(feed.xml(), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
    },
  })
}
