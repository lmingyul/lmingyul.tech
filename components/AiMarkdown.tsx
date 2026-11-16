'use client'

import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { PeekabooLink } from '~/components/links/PeekabooLink'
import {
  type AiTocHeading,
  createHeadingSlugger,
} from '~/lib/heading-slug'

type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4'])
const DEMOTE_MAP: Record<string, string> = {
  h1: 'h2',
  h2: 'h3',
  h3: 'h4',
  h4: 'h5',
}

function extractHastText(node: HastNode): string {
  if (node.type === 'text' && typeof node.value === 'string') {
    return node.value
  }
  if (!Array.isArray(node.children)) {
    return ''
  }
  return node.children.map(extractHastText).join('')
}

function checkHasH1(node: HastNode): boolean {
  if (node.type === 'element' && node.tagName === 'h1') {
    return true
  }
  if (!Array.isArray(node.children)) {
    return false
  }
  return node.children.some(checkHasH1)
}

function rehypeAiHeadingIds(options?: { headings?: AiTocHeading[] }) {
  return (tree: HastNode) => {
    const hasTopH1 = checkHasH1(tree)
    const slugger = createHeadingSlugger()
    let headingIdx = 0

    const visit = (node: HastNode) => {
      if (
        node.type === 'element' &&
        node.tagName &&
        HEADING_TAGS.has(node.tagName)
      ) {
        const text = extractHastText(node)
        const fallbackId = slugger.slug(text)
        const assignedId = options?.headings?.[headingIdx]?.id ?? fallbackId
        headingIdx += 1

        const prevProps = node.properties ?? {}
        const prevClass = Array.isArray(prevProps.className)
          ? (prevProps.className as string[])
          : typeof prevProps.className === 'string'
            ? [prevProps.className]
            : []

        node.properties = {
          ...prevProps,
          id: assignedId,
          tabIndex: -1,
          className: ['scroll-mt-24', ...prevClass],
        }

        if (hasTopH1 && DEMOTE_MAP[node.tagName]) {
          node.tagName = DEMOTE_MAP[node.tagName]
        }
        return
      }

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child)
        }
      }
    }

    visit(tree)
  }
}

export function AiMarkdown({
  value,
  headings,
}: {
  value: string
  headings?: AiTocHeading[]
}) {
  const markdown = value.replace(/\r\n/g, '\n').trim()

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        [rehypeAiHeadingIds, { headings }],
        [rehypePrismPlus, { ignoreMissing: true }],
        [rehypeKatex, { strict: 'ignore' }],
      ]}
      components={{
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
