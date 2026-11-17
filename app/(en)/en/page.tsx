import { type Metadata } from 'next'
import React from 'react'

import { HomePageView } from '~/app/(main)/HomePageView'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'

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
  return <HomePageView locale="en" />
}

export const revalidate = 60
