import { kvKeys } from '~/config/kv'
import { env } from '~/env.mjs'
import { type Locale } from '~/lib/i18n'
import { redis } from '~/lib/redis'
import { getLatestBlogPosts } from '~/sanity/queries'

import { BlogFilterableGrid } from './BlogFilterableGrid'
import { BlogPostCard } from './BlogPostCard'

export async function BlogPosts({
  limit = 5,
  locale = 'zh',
  preferTranslated = false,
  filterable = false,
}: {
  limit?: number
  locale?: Locale
  preferTranslated?: boolean
  filterable?: boolean
}) {
  const posts =
    (await getLatestBlogPosts({
      limit,
      forDisplay: true,
      locale,
      preferTranslated,
    })) || []
  const postIdKeys = posts.map(({ _id }) => kvKeys.postViews(_id))

  let views: number[] = []
  if (env.VERCEL_ENV === 'development') {
    views = posts.map(() => Math.floor(Math.random() * 1000))
  } else {
    if (postIdKeys.length > 0) {
      views = await redis.mget<number[]>(...postIdKeys)
    }
  }

  if (filterable) {
    const viewsByPostId: Record<string, number> = {}
    posts.forEach((post, idx) => {
      viewsByPostId[post._id] = views[idx] ?? 0
    })
    return (
      <BlogFilterableGrid
        posts={posts}
        viewsByPostId={viewsByPostId}
        locale={locale}
      />
    )
  }

  return (
    <>
      {posts.map((post, idx) => (
        <BlogPostCard
          post={post}
          views={views[idx] ?? 0}
          locale={locale}
          key={post._id}
        />
      ))}
    </>
  )
}
