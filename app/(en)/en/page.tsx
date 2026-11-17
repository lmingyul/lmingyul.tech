import { type Metadata } from 'next'
import React from 'react'

import { HomePageView } from '~/app/(main)/HomePageView'
import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'
import { buildHomeJsonLd } from '~/lib/structured-data'

export const metadata: Metadata = {
  title: {
    absolute: getMessages('en').seo.defaultTitle,
  },
  alternates: {
    canonical: url('/en').href,
    languages: {
      'zh-CN': url('/').href,
      en: url('/en').href,
      'x-default': url('/').href,
    },
  },
}

export default function EnHomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd('en')} />
      <HomePageView locale="en" />
    </>
  )
}

export const revalidate = 60
