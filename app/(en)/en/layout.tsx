import type { Metadata } from 'next'

import BlogLayout from '~/app/(main)/layout'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'

const enSeo = getMessages('en').seo

export const metadata: Metadata = {
  title: {
    template: enSeo.titleTemplate,
    default: enSeo.defaultTitle,
  },
  description: enSeo.description,
  keywords: enSeo.keywords,
  openGraph: {
    title: {
      default: enSeo.defaultTitle,
      template: enSeo.titleTemplate,
    },
    description: enSeo.description,
    siteName: enSeo.siteName,
    locale: 'en_US',
    type: 'website',
    url: url('/en').href,
  },
  twitter: {
    site: '@TommySteve1117',
    creator: '@TommySteve1117',
    card: 'summary_large_image',
    title: enSeo.defaultTitle,
    description: enSeo.description,
  },
  alternates: {
    types: {
      'application/rss+xml': [
        { url: '/en/feed.xml', title: enSeo.rssTitle },
      ],
    },
  },
}

export default function EnBlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BlogLayout locale="en">{children}</BlogLayout>
}
