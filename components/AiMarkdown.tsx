'use client'

import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { PeekabooLink } from '~/components/links/PeekabooLink'

export function AiMarkdown({ value }: { value: string }) {
  const markdown = value.replace(/\r\n/g, '\n').trim()

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypePrismPlus, { ignoreMissing: true }],
        [rehypeKatex, { strict: 'ignore' }],
      ]}
      components={{
        h1({ children, ...rest }) {
          return <h2 {...rest}>{children}</h2>
        },
        a({ href = '', children, ...rest }) {
          const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
          return (
            <PeekabooLink href={href} rel={rel} {...rest}>
              {children}
            </PeekabooLink>
          )
        },
        li({ children, ...rest }) {
          const liProps = { ...rest }
          delete (liProps as { ordered?: unknown }).ordered
          return <li {...liProps}>{children}</li>
        },
        img({ src = '', alt = '', ...rest }) {
          if (/\.(mp4|webm|mov|m4v)([?#].*)?$/i.test(src)) {
            return (
              <video
                src={src}
                controls
                playsInline
                preload="metadata"
                className="my-4 w-full rounded-xl"
              >
                {alt}
              </video>
            )
          }
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt}
              loading="lazy"
              className="rounded-xl"
              {...rest}
            />
          )
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
