'use client'

import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import rehypePrismPlus from 'rehype-prism-plus'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { ClientOnly } from '~/components/ClientOnly'
import { Commentable } from '~/components/Commentable'
import { PeekabooLink } from '~/components/links/PeekabooLink'
import { MERMAID_DATA_ATTR, rehypeMermaidBlocks } from '~/lib/rehype-mermaid'

const MermaidDiagram = dynamic(
  () => import('~/components/MermaidDiagram'),
  {
    ssr: false,
    loading: () => (
      <div
        data-mermaid-loading="true"
        className="not-prose my-6 flex min-h-[160px] items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/80 text-xs text-zinc-400 dark:border-zinc-700/60 dark:bg-zinc-900/60 dark:text-zinc-500"
      >
        Mermaid…
      </div>
    ),
  }
)

/**
 * 用于渲染文章正文（Markdown 字符串）
 *
 * props.value 现在是 string
 */
export function PostPortableText(props: { value: string }) {
  const markdown = props.value.replace(/\r\n/g, '\n').trim()
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[
        rehypeMermaidBlocks,
        [rehypePrismPlus, { ignoreMissing: true }],
        [rehypeKatex, { strict: 'ignore' }],
      ]}
      components={{
        pre({ children, ...rest }) {
          const preProps = { ...rest } as Record<string, unknown>
          delete preProps.node
          const chart = preProps[MERMAID_DATA_ATTR]
          if (typeof chart === 'string') {
            return <MermaidDiagram chart={chart} />
          }
          return <pre {...preProps}>{children}</pre>
        },

        // 覆写 a 标签 → PeekabooLink
        a({ href = '', children, ...rest }) {
          const rel = href.startsWith('/') ? undefined : 'noreferrer noopener'
          return (
            <PeekabooLink href={href} rel={rel} {...rest}>
              {children}
            </PeekabooLink>
          )
        },

        // 覆写 p、h1-h4、li、blockquote —— 把原来的「评论锚点」功能迁过去
        p({ node, children, ...rest }) {
          const id = node?.position?.start.offset?.toString() ?? undefined
          return (
            <p
              data-blockid={id}
              className="group relative pr-3 md:pr-0"
              {...rest}
            >
              {id && (
                <ClientOnly>
                  <Commentable blockId={id} />
                </ClientOnly>
              )}
              {children}
            </p>
          )
        },
        h1: headingWithAnchor(1),
        h2: headingWithAnchor(2),
        h3: headingWithAnchor(3),
        h4: headingWithAnchor(4),

        li({ node, children, ...rest }) {
          const id = node?.position?.start.offset?.toString() ?? undefined
          const liProps = { ...rest }
          delete (liProps as { ordered?: unknown }).ordered
          return (
            <li
              data-blockid={id}
              className="group relative pr-3 md:pr-0"
              {...liProps}
            >
              {id && (
                <ClientOnly>
                  <Commentable className="mr-5" blockId={id} />
                </ClientOnly>
              )}
              {children}
            </li>
          )
        },

        blockquote({ node, children, ...rest }) {
          const id = node?.position?.start.offset?.toString() ?? undefined
          return (
            <blockquote
              data-blockid={id}
              className="group relative pr-3 md:pr-0"
              {...rest}
            >
              {id && (
                <ClientOnly>
                  <Commentable blockId={id} />
                </ClientOnly>
              )}
              {children}
            </blockquote>
          )
        },

        // 覆写 img：支持图片懒加载与视频扩展名自动渲染播放器
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

/* ---------- 工具函数 ---------- */
function headingWithAnchor(level: 1 | 2 | 3 | 4) {
  return function Heading({
    node,
    children,
    ...rest
  }: React.ComponentProps<'h1'> & { node?: { position?: { start: { offset?: number } } } }): JSX.Element {
    const id = node?.position?.start.offset?.toString() ?? undefined
    const Tag = `h${level}` as const
    return (
      <Tag
        id={id}
        data-blockid={id}
        className="group relative pr-3 after:pointer-events-none after:inline after:select-none after:opacity-0 after:transition-opacity after:will-change-[opacity] after:content-['_#'] hover:after:opacity-10 md:pr-0"
        {...rest}
      >
        {id && <a href={`#${id}`} className="absolute inset-0" />}
        {id && (
          <ClientOnly>
            <Commentable blockId={id} />
          </ClientOnly>
        )}
        {children}
      </Tag>
    )
  }
}
