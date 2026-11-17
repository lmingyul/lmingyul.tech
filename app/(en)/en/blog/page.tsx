import { type Metadata } from 'next'
import Balancer from 'react-wrap-balancer'

import { BlogPosts } from '~/app/(main)/blog/BlogPosts'
import { SocialLink } from '~/components/links/SocialLink'
import { Container } from '~/components/ui/Container'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'

const t = getMessages('en').blog

export const metadata = {
  title: t.metaTitle,
  description: t.description,
  openGraph: {
    title: t.metaTitle,
    description: t.description,
  },
  twitter: {
    title: t.metaTitle,
    description: t.description,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: url('/en/blog').href,
    languages: {
      'zh-CN': url('/blog').href,
      en: url('/en/blog').href,
      'x-default': url('/blog').href,
    },
  },
} satisfies Metadata

export default function EnBlogPage() {
  return (
    <Container className="mt-16 sm:mt-24">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {t.heading}
        </h1>
        <p className="my-6 text-base text-zinc-600 dark:text-zinc-400">
          <Balancer>{t.description}</Balancer>
        </p>
        <p className="flex items-center">
          <SocialLink href="/en/feed.xml" platform="rss" />
        </p>
      </header>
      <BlogPosts limit={200} locale="en" filterable />
    </Container>
  )
}

export const revalidate = 60
