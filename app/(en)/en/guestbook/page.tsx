import { type Metadata } from 'next'
import Balancer from 'react-wrap-balancer'

import { Guestbook } from '~/app/(main)/guestbook/Guestbook'
import { Container } from '~/components/ui/Container'
import { fetchGuestbookMessages } from '~/db/queries/guestbook'
import { url } from '~/lib'
import { getMessages } from '~/lib/i18n'

const t = getMessages('en').guestbook

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
    canonical: url('/en/guestbook').href,
    languages: {
      'zh-CN': url('/guestbook').href,
      en: url('/en/guestbook').href,
      'x-default': url('/guestbook').href,
    },
  },
} satisfies Metadata

export default async function EnGuestBookPage() {
  const messages = await fetchGuestbookMessages()

  return (
    <Container className="mt-16 sm:mt-32">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
          {t.heading}
        </h1>
        <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
          <Balancer>{t.description}</Balancer>
        </p>
      </header>
      <div className="mt-16 sm:mt-20">
        <Guestbook messages={messages} />
      </div>
    </Container>
  )
}

export const dynamic = 'force-dynamic'
