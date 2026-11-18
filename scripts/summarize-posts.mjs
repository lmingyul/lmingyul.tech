#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT_DIR, 'content', 'posts')
const OUTPUT_FILE = path.join(ROOT_DIR, 'content', 'ai-summaries.json')

dotenv.config({ path: path.join(ROOT_DIR, '.env') })

const API_KEY = process.env.DEEPSEEK_API_KEY?.trim() || ''
const BASE_URL = (
  process.env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com/v1'
).replace(/\/+$/, '')
const MODEL = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-flash'

const MAX_INPUT_CHARS = 24000
const CONCURRENCY = 4
const MAX_ATTEMPTS = 3

const SYSTEM_PROMPT = [
  '你是一名专业且严谨的技术博客编辑。请仔细阅读博客文章内容，提炼一份中英双语的「AI 总结」，用于展示在文章正文的开头。',
  '必须严格只输出纯 JSON 对象，格式如下（不要输出任何 Markdown 代码围栏或额外说明文字）：',
  '{"zh":{"summary":"...","points":["...","...","..."]},"en":{"summary":"...","points":["...","...","..."]}}',
  '具体要求：',
  '1. zh.summary：一段话（目标 80~140 个汉字；极短的收藏夹/笔记类文章可 45~90 个汉字，勿强行注水），以「本文」开头，用客观第三人称概括主题、核心观点或主要内容。',
  '2. zh.points：恰好 3 条字符串（每条 12~45 个汉字），提炼各自独立的关键信息（实践方法、结论、踩坑或重点章节），不要简单复述 zh.summary 的原句。',
  '3. en.summary：One paragraph (target 50~90 words; concise bookmark/note posts may be 28~55 words without filler), starting with "This post", objective third-person summary.',
  '4. en.points：Exactly 3 distinct strings (6~22 words each) highlighting concrete methods, conclusions, or takeaways without repeating en.summary verbatim.',
  '5. 只陈述原文中明确出现的事实、数据与观点，严禁编造；准确保留技术专有名词（如 Claude Code、DeepSeekMath-V2、LangChain、Lombok、Playwright、RAG、SFT、RL 等）。',
  '6. 全部字段必须为纯文本：不要使用 Markdown 语法（**、`、# 等），不要加列表符号或编号（如「1.」「-」「•」），不要在两端加引号，也不要使用中文破折号「——」或英文破折号「—」（需要停顿时请使用逗号、冒号或句号）。',
].join('\n')

/**
 * Parses CLI arguments.
 * @param {string[]} argv
 */
function parseArgs(argv) {
  let force = false
  let dryRun = false
  /** @type {string | null} */
  let targetSlug = null

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--force') {
      force = true
    } else if (arg === '--dry-run') {
      dryRun = true
    } else if (arg === '--slug') {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        throw new Error('Missing value for --slug')
      }
      targetSlug = next.trim()
      i++
    } else if (arg.startsWith('--slug=')) {
      targetSlug = arg.slice('--slug='.length).trim()
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        [
          'Usage:',
          '  pnpm ai:summary                 # Generate/refresh missing or changed posts',
          '  pnpm ai:summary --force         # Regenerate all published posts',
          '  pnpm ai:summary --slug <slug>   # Regenerate a single post',
          '  pnpm ai:summary --dry-run       # List posts needing updates without calling API',
        ].join('\n')
      )
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return { force, dryRun, targetSlug }
}

/**
 * Strips images and caps verbose fenced code blocks so very long posts fit cleanly.
 * @param {string} markdown
 * @returns {string}
 */
function prepareBody(markdown) {
  const withoutImages = markdown.replace(/!\[[^\]]*]\([^)]*\)/g, '')
  const lines = withoutImages.replace(/\r\n/g, '\n').split('\n')
  /** @type {string[]} */
  const compacted = []

  let inFence = false
  let fenceChar = ''
  let fenceLen = 0
  /** @type {string[]} */
  let fenceLines = []

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (!inFence && fenceMatch) {
      inFence = true
      fenceChar = fenceMatch[1][0]
      fenceLen = fenceMatch[1].length
      compacted.push(line)
      fenceLines = []
      continue
    }

    if (inFence) {
      const trimmed = line.trim()
      if (
        fenceMatch &&
        fenceMatch[1][0] === fenceChar &&
        fenceMatch[1].length >= fenceLen &&
        trimmed === fenceMatch[1]
      ) {
        if (fenceLines.length > 14) {
          compacted.push(...fenceLines.slice(0, 12), '// ... (code omitted)')
        } else {
          compacted.push(...fenceLines)
        }
        compacted.push(line)
        inFence = false
        fenceChar = ''
        fenceLen = 0
        fenceLines = []
      } else {
        fenceLines.push(line)
      }
      continue
    }

    compacted.push(line)
  }

  if (inFence && fenceLines.length > 0) {
    compacted.push(...fenceLines.slice(0, 12))
  }

  const normalized = compacted
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (normalized.length <= MAX_INPUT_CHARS) {
    return normalized
  }

  return (
    normalized.slice(0, 16000).trimEnd() +
    '\n\n[... middle section omitted ...]\n\n' +
    normalized.slice(-8000).trimStart()
  )
}

/**
 * @param {string} value
 * @param {'zh' | 'en'} lang
 * @returns {string}
 */
function sanitizeSummaryText(value, lang) {
  let out = String(value ?? '')
    .replace(/\r\n/g, ' ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  out = out.replace(/^(?:[-*•]\s+|\d+[.、)]\s*)+/, '')
  out = out.replace(/^["“]+|["”]+$/g, '').trim()
  out =
    lang === 'zh'
      ? out.replace(/\s*—+\s*/g, '，')
      : out.replace(/\s*—+\s*/g, ', ')
  return out.replace(/\s+/g, ' ').trim()
}

/**
 * @param {string} text
 * @returns {number}
 */
function countEnglishWords(text) {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Validates and normalizes the model JSON output.
 * @param {string} raw
 */
function parseAndValidateOutput(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  /** @type {{ zh?: { summary?: unknown; points?: unknown }; en?: { summary?: unknown; points?: unknown } }} */
  const parsed = JSON.parse(cleaned)
  if (!parsed || typeof parsed !== 'object' || !parsed.zh || !parsed.en) {
    throw new Error('Response JSON missing zh or en block')
  }

  const zhSummary = sanitizeSummaryText(String(parsed.zh.summary ?? ''), 'zh')
  const zhPoints = Array.isArray(parsed.zh.points)
    ? parsed.zh.points
        .map((p) => sanitizeSummaryText(String(p ?? ''), 'zh'))
        .filter(Boolean)
    : []

  const enSummary = sanitizeSummaryText(String(parsed.en.summary ?? ''), 'en')
  const enPoints = Array.isArray(parsed.en.points)
    ? parsed.en.points
        .map((p) => sanitizeSummaryText(String(p ?? ''), 'en'))
        .filter(Boolean)
    : []

  if (zhSummary.length < 35 || zhSummary.length > 260) {
    throw new Error(`Invalid zh.summary length: ${zhSummary.length}`)
  }
  if (zhPoints.length !== 3) {
    throw new Error(`Expected 3 zh.points, got ${zhPoints.length}`)
  }
  for (const pt of zhPoints) {
    if (pt.length < 8 || pt.length > 95) {
      throw new Error(`Invalid zh.point length (${pt.length}): ${pt}`)
    }
  }

  const enSummaryWords = countEnglishWords(enSummary)
  if (enSummaryWords < 22 || enSummaryWords > 150) {
    throw new Error(`Invalid en.summary word count: ${enSummaryWords}`)
  }
  if (enPoints.length !== 3) {
    throw new Error(`Expected 3 en.points, got ${enPoints.length}`)
  }
  for (const pt of enPoints) {
    const words = countEnglishWords(pt)
    if (words < 4 || words > 35) {
      throw new Error(`Invalid en.point word count (${words}): ${pt}`)
    }
  }

  return {
    zh: { summary: zhSummary, points: zhPoints },
    en: { summary: enSummary, points: enPoints },
  }
}

/**
 * Calls DeepSeek Chat Completions API.
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function callDeepSeek(userPrompt) {
  if (!API_KEY) {
    throw new Error(
      'Missing DEEPSEEK_API_KEY in environment or .env; cannot generate summaries.'
    )
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
    signal: AbortSignal.timeout(120000),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`DeepSeek API HTTP ${res.status}: ${body.slice(0, 300)}`)
  }

  /** @type {{ choices?: { message?: { content?: string } }[] }} */
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('DeepSeek returned an empty response.')
  }
  return content
}

/**
 * Generates bilingual summary with bounded retries.
 * @param {{ slug: string; title: string; description: string; categories: string[]; body: string }} post
 */
async function summarizeWithRetry(post) {
  const preparedBody = prepareBody(post.body)
  const userPrompt = [
    `标题：${post.title}`,
    post.categories.length > 0
      ? `分类：${post.categories.join(', ')}`
      : null,
    post.description ? `原文简介：${post.description}` : null,
    '',
    '正文：',
    preparedBody,
  ]
    .filter((line) => line !== null)
    .join('\n')

  /** @type {unknown} */
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const raw = await callDeepSeek(userPrompt)
      return parseAndValidateOutput(raw)
    } catch (err) {
      lastError = err
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt))
      }
    }
  }
  throw lastError
}

/**
 * Verifies API credentials in CI even when 0 posts need regeneration.
 */
async function verifyCiCredentials() {
  if (!API_KEY) {
    throw new Error('DEEPSEEK_API_KEY secret is missing or empty.')
  }
  const res = await fetch(`${BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`DeepSeek credential check failed: HTTP ${res.status}`)
  }
}

/**
 * Reads published posts from content/posts.
 */
async function loadPublishedPosts() {
  const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true })
  /** @type {{ slug: string; title: string; description: string; categories: string[]; body: string; hash: string }[]} */
  const posts = []

  for (const entry of entries) {
    if (
      !entry.isFile() ||
      !entry.name.endsWith('.md') ||
      entry.name.startsWith('.')
    ) {
      continue
    }

    const filePath = path.join(POSTS_DIR, entry.name)
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const data = /** @type {Record<string, unknown>} */ (parsed.data)
    if (data.draft) {
      continue
    }

    const fileSlug = entry.name.replace(/\.md$/i, '')
    const slug =
      typeof data.slug === 'string' && data.slug.trim()
        ? data.slug.trim()
        : fileSlug
    const title =
      typeof data.title === 'string' && data.title.trim()
        ? data.title.trim()
        : slug
    const description =
      typeof data.description === 'string' ? data.description.trim() : ''
    const categories = Array.isArray(data.categories)
      ? data.categories.map((c) => String(c).trim()).filter(Boolean)
      : []
    const body = parsed.content.replace(/\r\n/g, '\n').trim()
    const hash = crypto
      .createHash('sha256')
      .update(`${title}\n${body}`)
      .digest('hex')
      .slice(0, 16)

    posts.push({ slug, title, description, categories, body, hash })
  }

  return posts.sort((a, b) => a.slug.localeCompare(b.slug))
}

/**
 * Loads existing summaries JSON safely.
 * @returns {Promise<Record<string, { hash: string; model: string; generatedAt: string; zh: { summary: string; points: string[] }; en: { summary: string; points: string[] } }>>}
 */
async function loadExistingSummaries() {
  try {
    const raw = await fs.readFile(OUTPUT_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.items) {
      return parsed.items
    }
  } catch {
    // File missing or unreadable: start fresh
  }
  return {}
}

async function main() {
  const { force, dryRun, targetSlug } = parseArgs(process.argv.slice(2))
  const posts = await loadPublishedPosts()
  const existingItems = await loadExistingSummaries()

  const activeSlugs = new Set(posts.map((p) => p.slug))
  /** @type {typeof posts} */
  let filteredPosts = posts

  if (targetSlug) {
    filteredPosts = posts.filter((p) => p.slug === targetSlug)
    if (filteredPosts.length === 0) {
      throw new Error(`Published post not found for slug: ${targetSlug}`)
    }
  }

  const queue = filteredPosts.filter((post) => {
    if (force) return true
    const current = existingItems[post.slug]
    return !current || current.hash !== post.hash
  })

  if (dryRun) {
    console.log(
      `[dry-run] ${queue.length}/${filteredPosts.length} post(s) queued using ${MODEL}:`
    )
    for (const post of queue) {
      console.log(`  - ${post.slug} (${post.hash})`)
    }
    return
  }

  if (queue.length === 0) {
    if (process.env.GITHUB_ACTIONS === 'true') {
      await verifyCiCredentials()
    }
    if (!targetSlug) {
      let pruned = 0
      const cleaned = /** @type {typeof existingItems} */ ({})
      for (const key of Object.keys(existingItems).sort()) {
        if (activeSlugs.has(key)) {
          cleaned[key] = existingItems[key]
        } else {
          pruned++
        }
      }
      if (pruned > 0) {
        await fs.writeFile(
          OUTPUT_FILE,
          `${JSON.stringify({ version: 1, items: cleaned }, null, 2)}\n`,
          'utf8'
        )
        console.log(`Pruned ${pruned} deleted post(s) from ai-summaries.json.`)
      }
    }
    console.log('All summaries are up to date.')
    return
  }

  if (!API_KEY) {
    throw new Error(
      'Missing DEEPSEEK_API_KEY in environment or .env; cannot generate summaries.'
    )
  }

  console.log(
    `Generating summaries for ${queue.length} post(s) using ${MODEL} (concurrency ${CONCURRENCY})...`
  )

  const nextItems = { ...existingItems }
  if (!targetSlug) {
    for (const key of Object.keys(nextItems)) {
      if (!activeSlugs.has(key)) {
        delete nextItems[key]
      }
    }
  }

  let cursor = 0
  let succeeded = 0
  /** @type {{ slug: string; message: string }[]} */
  const failures = []

  async function worker() {
    while (cursor < queue.length) {
      const index = cursor++
      const post = queue[index]
      try {
        const result = await summarizeWithRetry(post)
        nextItems[post.slug] = {
          hash: post.hash,
          model: MODEL,
          generatedAt: new Date().toISOString(),
          zh: result.zh,
          en: result.en,
        }
        succeeded++
        console.log(`[ok ${succeeded}/${queue.length}] ${post.slug}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        failures.push({ slug: post.slug, message })
        console.error(`[fail] ${post.slug}: ${message}`)
      }
    }
  }

  const workerCount = Math.min(CONCURRENCY, queue.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  /** @type {typeof nextItems} */
  const sortedItems = {}
  for (const key of Object.keys(nextItems).sort()) {
    sortedItems[key] = nextItems[key]
  }

  await fs.writeFile(
    OUTPUT_FILE,
    `${JSON.stringify({ version: 1, items: sortedItems }, null, 2)}\n`,
    'utf8'
  )

  console.log(
    `Done. Succeeded: ${succeeded}, Failed: ${failures.length}, Total stored: ${Object.keys(sortedItems).length}`
  )

  if (failures.length > 0) {
    console.error('Failed posts:')
    for (const f of failures) {
      console.error(`  - ${f.slug}: ${f.message}`)
    }
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
