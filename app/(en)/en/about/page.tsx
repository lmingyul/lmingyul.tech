import { type Metadata } from 'next'

import { AboutPageView } from '~/app/(main)/about/AboutPageView'
import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { buildAboutJsonLd } from '~/lib/structured-data'

const enSeo = getMessages('en').seo
const title = 'About Me'
const description = enSeo.description

export const metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
  },
  alternates: {
    canonical: url('/en/about').href,
    languages: {
      'zh-CN': url('/about').href,
      en: url('/en/about').href,
      'x-default': url('/about').href,
    },
  },
} satisfies Metadata

export default function EnAboutPage() {
  return (
    <>
      <JsonLd data={buildAboutJsonLd('en')} />
      <AboutPageView locale="en" />
    </>
  )
}

export const revalidate = 3600
