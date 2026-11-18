import { type Metadata } from 'next'
import Balancer from 'react-wrap-balancer'

import { SocialLink } from '~/components/links/SocialLink'
import { Container } from '~/components/ui/Container'
import { url } from '~/lib'
import { resolveTagParam } from '~/lib/post-tags'

import { BlogPosts } from './BlogPosts'

const description =
  '什么都写写，随缘更新，留个印记（人生在世，总得留点痕迹）'
export const metadata = {
  title: '我的博客',
  description,
  openGraph: {
    title: '我的博客',
    description,
  },
  twitter: {
    title: '我的博客',
    description,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: url('/blog').href,
    languages: {
      'zh-CN': url('/blog').href,
      en: url('/en/blog').href,
      'x-default': url('/blog').href,
    },
  },
} satisfies Metadata

// TODO: add pagination or infinite scroll
export default function BlogPage({
  searchParams,
}: {
  searchParams?: { tag?: string | string[] }
}) {
  return (
    <Container className="mt-16 sm:mt-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          欢迎光临我的博客
        </h1>
        <p className="my-6 text-base text-zinc-600 dark:text-zinc-400">
          <Balancer>{description}</Balancer>
        </p>
        <p className="flex items-center">
          <SocialLink href="/feed.xml" platform="rss" />
        </p>
      </header>
      <BlogPosts
        limit={200}
        filterable
        initialTag={resolveTagParam(searchParams?.tag, 'zh')}
      />
    </Container>
  )
}
