import { type Metadata } from 'next'

import { AboutPageView } from '~/app/(main)/about/AboutPageView'
import { url } from '~/lib'

const title = '关于我'
const description =
  '我是 阿梁，朋友都这样叫（lmingyul，博客的名字取自我和我对象名字的组合），目前是一名后端程序员，兼大模型炼丹师，偏 I 人，现在深圳。座右铭：Keep Learning、Keep Thinking、Keep Trying'

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
    canonical: url('/about').href,
    languages: {
      'zh-CN': url('/about').href,
      en: url('/en/about').href,
      'x-default': url('/about').href,
    },
  },
} satisfies Metadata

export default function AboutPage() {
  return <AboutPageView locale="zh" />
}

export const revalidate = 3600
