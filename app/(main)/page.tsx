import { type Metadata } from 'next'
import React from 'react'

import { HomePageView } from '~/app/(main)/HomePageView'
import { url } from '~/lib'

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
  return <HomePageView locale="zh" />
}

export const revalidate = 60
