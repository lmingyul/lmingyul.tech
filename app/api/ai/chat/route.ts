import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '~/env.mjs'
import {
  buildPersonaPromptContext,
  type ChatHistoryMessage,
  getStaticFallbackAnswer,
} from '~/lib/ai-persona'
import { getIP } from '~/lib/ip'
import { createRatelimit, redis } from '~/lib/redis'

const aiChatRatelimit = createRatelimit(10, 600)
const DAILY_GLOBAL_CAP = 300

const requestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, '请输入你想了解的问题')
    .max(500, '单次提问请控制在 500 字以内'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(1200),
      })
    )
    .max(6)
    .optional(),
})

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
} as const

function makePlainStreamResponse(text: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(text))
      controller.close()
    },
  })
  return new Response(stream, { headers: STREAM_HEADERS })
}

async function checkDailyBudgetAvailable(): Promise<boolean> {
  const today = new Date().toISOString().slice(0, 10)
  const key = `ai:chat:daily:${today}`
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.set(key, 1, { ex: 86400 })
  }
  return count <= DAILY_GLOBAL_CAP
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const { success } = await aiChatRatelimit.limit(`ai_chat:${ip}`)
  if (!success) {
    return NextResponse.json(
      { error: '提问太频繁啦，喝口水歇几分钟再继续聊吧 ☕' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '请求格式不正确' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (parsed.success === false) {
    const firstIssue =
      parsed.error.issues[0]?.message ?? '请输入有效的问题内容'
    return NextResponse.json({ error: firstIssue }, { status: 400 })
  }

  const question = parsed.data.question ?? ''
  const history: ChatHistoryMessage[] = (parsed.data.history ?? []).flatMap(
    (item) =>
      item.role && typeof item.content === 'string'
        ? [{ role: item.role, content: item.content }]
        : []
  )
  const { messages, topChunks, postCount } = await buildPersonaPromptContext(
    question,
    history
  )

  const apiKey = env.DEEPSEEK_API_KEY?.trim()
  const withinBudget = await checkDailyBudgetAvailable()

  if (!apiKey || !withinBudget) {
    return makePlainStreamResponse(
      getStaticFallbackAnswer(question, topChunks, postCount)
    )
  }

  const baseUrl = (
    env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com/v1'
  ).replace(/\/+$/, '')
  const model = env.DEEPSEEK_MODEL?.trim() || 'deepseek-flash'

  let upstream: Response
  try {
    upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.4,
        max_tokens: 600,
      }),
      signal: AbortSignal.timeout(15000),
    })
  } catch (err) {
    console.error('[ai/chat] Upstream connection failed:', err)
    return makePlainStreamResponse(
      getStaticFallbackAnswer(question, topChunks, postCount)
    )
  }

  if (!upstream.ok || !upstream.body) {
    console.error('[ai/chat] Upstream HTTP error:', upstream.status)
    return makePlainStreamResponse(
      getStaticFallbackAnswer(question, topChunks, postCount)
    )
  }

  const upstreamBody = upstream.body
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstreamBody.getReader()
      let buffer = ''
      let emittedAny = false

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const rawLine of lines) {
            const line = rawLine.trim()
            if (!line.startsWith('data:')) continue
            const payload = line.slice(5).trim()
            if (!payload || payload === '[DONE]') continue

            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[]
              }
              const delta = json.choices?.[0]?.delta?.content
              if (delta) {
                emittedAny = true
                controller.enqueue(encoder.encode(delta))
              }
            } catch {
              // Ignore partial JSON frames
            }
          }
        }

        if (!emittedAny) {
          controller.enqueue(
            encoder.encode(
              getStaticFallbackAnswer(question, topChunks, postCount)
            )
          )
        }
      } catch (err) {
        console.error('[ai/chat] Stream interrupted:', err)
        if (!emittedAny) {
          controller.enqueue(
            encoder.encode(
              getStaticFallbackAnswer(question, topChunks, postCount)
            )
          )
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, { headers: STREAM_HEADERS })
}
