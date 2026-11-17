'use client'

import { clsxm } from '@zolplay/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { SparkleIcon } from '~/assets'
import { Button } from '~/components/ui/Button'
import { getMessages, type Locale, localeFromPathname } from '~/lib/i18n'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

function BubbleMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p({ children }) {
          return <p className="mb-1.5 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="my-1.5 list-disc space-y-1 pl-4">{children}</ul>
        },
        ol({ children }) {
          return (
            <ol className="my-1.5 list-decimal space-y-1 pl-4">{children}</ol>
          )
        },
        li({ children, ...rest }) {
          const liProps = { ...rest }
          delete (liProps as { ordered?: unknown }).ordered
          return <li {...liProps}>{children}</li>
        },
        a({ href = '', children }) {
          const linkClass =
            'font-medium text-lime-700 underline decoration-lime-500/40 underline-offset-2 transition hover:text-lime-600 dark:text-lime-400 dark:hover:text-lime-300'
          if (href.startsWith('/')) {
            return (
              <Link href={href} className={linkClass}>
                {children}
              </Link>
            )
          }
          return (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className={linkClass}
            >
              {children}
            </a>
          )
        },
        code({ children }) {
          return (
            <code className="rounded bg-zinc-200/70 px-1 py-0.5 font-mono text-xs text-zinc-800 dark:bg-zinc-700/70 dark:text-zinc-200">
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export function AskMe({
  postCount,
  locale: localeProp,
}: {
  postCount: number
  locale?: Locale
}) {
  const pathname = usePathname()
  const locale = localeProp ?? localeFromPathname(pathname)
  const t = getMessages(locale).askMe

  const baseId = React.useId()
  const headingId = `${baseId}-heading`
  const inputId = `${baseId}-input`
  const hintId = `${baseId}-hint`
  const errorId = `${baseId}-error`
  const threadId = `${baseId}-thread`

  const [input, setInput] = React.useState('')
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasInteracted, setHasInteracted] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const threadRef = React.useRef<HTMLDivElement>(null)
  const abortRef = React.useRef<AbortController | null>(null)
  const lastCompositionEndAtRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (isExpanded && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, isExpanded])

  React.useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const sendQuestion = React.useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim()
      if (!question) {
        setError(t.errEmpty)
        inputRef.current?.focus()
        return
      }
      if (question.length > 500) {
        setError(t.errTooLong)
        inputRef.current?.focus()
        return
      }
      if (isStreaming) return

      setError(null)
      setInput('')
      setIsExpanded(true)

      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const userMsgId = `${Date.now()}-u`
      const assistantMsgId = `${Date.now()}-a`

      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: 'user', content: question },
        { id: assistantMsgId, role: 'assistant', content: '' },
      ])
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history: historyPayload, locale }),
          signal: controller.signal,
        })

        if (!res.ok) {
          let errMsg = t.errBusy
          try {
            const data = (await res.json()) as { error?: string }
            if (data.error) errMsg = data.error
          } catch {
            // Ignore non-JSON error payload
          }
          setError(errMsg)
          setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))
          return
        }

        if (!res.body) {
          const fallbackText = await res.text()
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fallbackText } : m
            )
          )
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          const snapshot = accumulated
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: snapshot } : m
            )
          )
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          return
        }
        setError(t.errNetwork)
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))
      } finally {
        setIsStreaming(false)
      }
    },
    [isStreaming, locale, messages, t.errBusy, t.errEmpty, t.errNetwork, t.errTooLong]
  )

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      void sendQuestion(input)
    },
    [input, sendQuestion]
  )

  const handleClear = React.useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setMessages([])
    setIsExpanded(false)
    setError(null)
  }, [])

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <div className="flex items-center justify-between gap-2">
        <h2
          id={headingId}
          className="flex items-center text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        >
          <SparkleIcon
            className="h-5 w-5 flex-none text-lime-600 dark:text-lime-400"
            aria-hidden="true"
          />
          <span className="ml-2">{t.heading}</span>
        </h2>

        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls={threadId}
              onClick={() => setIsExpanded((prev) => !prev)}
              className="rounded-md px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              {isExpanded ? t.collapse : t.expand}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="rounded-md px-2 py-0.5 text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              {t.clear}
            </button>
          </div>
        )}
      </div>

      <p
        id={hintId}
        className="mt-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400"
      >
        {t.hint(postCount)}
      </p>

      <div
        id={threadId}
        ref={threadRef}
        hidden={!isExpanded || messages.length === 0}
        className={clsxm(
          'mt-4 max-h-56 space-y-3 overflow-y-auto border-t border-zinc-100 pt-3 pr-1 dark:border-zinc-800',
          (!isExpanded || messages.length === 0) && 'hidden'
        )}
      >
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-zinc-800 px-3 py-2 text-xs leading-5 text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900">
                {msg.content}
              </div>
            </div>
          ) : (
            <div
              key={msg.id}
              className="rounded-2xl rounded-tl-sm border border-zinc-100 bg-zinc-50/90 px-3.5 py-2.5 text-xs leading-5 text-zinc-700 dark:border-zinc-700/50 dark:bg-zinc-800/60 dark:text-zinc-200"
            >
              {msg.content ? (
                <BubbleMarkdown content={msg.content} />
              ) : (
                <span className="inline-flex items-center gap-1 py-0.5 text-zinc-400">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-500"
                  />
                  <span aria-hidden="true">{t.thinking}</span>
                </span>
              )}
            </div>
          )
        )}
      </div>

      {isStreaming && (
        <progress className="sr-only" aria-label={t.thinkingSr} />
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {t.starters.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={isStreaming}
            onClick={() => void sendQuestion(item.query)}
            className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 px-2.5 py-1 text-xs font-medium text-zinc-700 transition hover:border-lime-500/50 hover:text-lime-700 disabled:opacity-50 dark:border-zinc-700/60 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-lime-400/40 dark:hover:text-lime-300"
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        action="/api/ai/chat"
        method="POST"
        aria-labelledby={headingId}
        onSubmit={handleSubmit}
        className="mt-4 flex h-10"
        noValidate
      >
        <label htmlFor={inputId} className="sr-only">
          {t.inputLabel}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="question"
          type="text"
          value={input}
          maxLength={500}
          enterKeyHint="send"
          placeholder={t.placeholder}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : hintId}
          onChange={(e) => {
            setInput(e.target.value)
            if (error) setError(null)
          }}
          onBlur={() => {
            if (hasInteracted && input.trim().length > 500) {
              setError(t.errTooLong)
            }
          }}
          onFocus={() => setHasInteracted(true)}
          onCompositionEnd={(e) => {
            lastCompositionEndAtRef.current = e.nativeEvent.timeStamp
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const recentlyEndedComposition =
                lastCompositionEndAtRef.current !== null &&
                Math.abs(
                  e.nativeEvent.timeStamp - lastCompositionEndAtRef.current
                ) < 50
              if (
                e.nativeEvent.isComposing ||
                e.keyCode === 229 ||
                recentlyEndedComposition
              ) {
                e.preventDefault()
              }
            }
          }}
          className="min-w-0 flex-auto appearance-none rounded-lg border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] text-base placeholder:text-zinc-400 focus:border-lime-500 focus:outline-none focus:ring-4 focus:ring-lime-500/10 dark:border-zinc-700 dark:bg-zinc-700/[0.15] dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-lime-400/50 dark:focus:ring-lime-400/5 sm:text-sm"
        />
        <Button type="submit" className="ml-2 flex-none" disabled={isStreaming}>
          {t.submit}
        </Button>
      </form>

      {error && (
        <p
          id={errorId}
          role="status"
          aria-live="polite"
          className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}
