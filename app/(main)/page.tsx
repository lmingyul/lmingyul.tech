import { type Metadata } from 'next'
import React from 'react'

import { HomePageView } from '~/app/(main)/HomePageView'
import { JsonLd } from '~/components/JsonLd'
import { url } from '~/lib'
import { buildHomeJsonLd } from '~/lib/structured-data'

export const metadata: Metadata = {
  alternates: {
    canonical: url('/').href,
    languages: {
      'zh-CN': url('/').href,
      en: url('/en').href,
      'x-default': url('/').href,
    },
  },
}

export default function BlogHomePage() {
  return (
    <>
      <JsonLd data={buildHomeJsonLd('zh')} />
      <HomePageView locale="zh" />
    </>
  )
}

export const revalidate = 60
