'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrismPlus from 'rehype-prism-plus'

import { PeekabooLink } from '~/components/links/PeekabooLink'
import { ClientOnly } from '~/components/ClientOnly'
import { Commentable } from '~/components/Commentable'

/**
 * 用于渲染文章正文（Markdown 字符串）
 *
 * props.value 现在是 string
 */
export function PostPortableText(props: { value: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypePrismPlus]}
      components={{
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
          return (
            <li
              data-blockid={id}
              className="group relative pr-3 md:pr-0"
              {...rest}
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

        // 覆写 img：如果你有 PortableTextImage 里的一些逻辑，可在这里实现
        img({ src = '', alt = '', ...rest }) {
          // eslint-disable-next-line @next/next/no-img-element
          return <img src={src} alt={alt} className="rounded-xl" {...rest} />
        },
      }}
    >
      {props.value}
    </ReactMarkdown>
  )
}

/* ---------- 工具函数 ---------- */
function headingWithAnchor(level: 1 | 2 | 3 | 4) {
  return function Heading({
    node,
    children,
    ...rest
  }: React.ComponentProps<'h1'> & { node?: any }) {
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
