#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const POSTS_DIR = path.join(ROOT_DIR, 'content', 'posts')
const EN_POSTS_DIR = path.join(POSTS_DIR, 'en')

dotenv.config({ path: path.join(ROOT_DIR, '.env') })

const API_KEY = process.env.DEEPSEEK_API_KEY?.trim() || ''
const BASE_URL = (
  process.env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com/v1'
).replace(/\/+$/, '')
const MODEL = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-flash'

/**
 * Splits a Markdown body cleanly along heading or paragraph boundaries outside
 * fenced code blocks so long articles stay well under model output token limits.
 * @param {string} markdown
 * @param {number} maxChars
 * @returns {string[]}
 */
function splitMarkdownForTranslation(markdown, maxChars = 2600) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  /** @type {string[]} */
  const chunks = []
  /** @type {string[]} */
  let current = []
  let currentLen = 0
  let inFence = false
  let fenceChar = ''
  let fenceLen = 0

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1]
      const ch = marker[0]
      if (!inFence) {
        inFence = true
        fenceChar = ch
        fenceLen = marker.length
      } else if (
        ch === fenceChar &&
        marker.length >= fenceLen &&
        line.trim() === marker
      ) {
        inFence = false
        fenceChar = ''
        fenceLen = 0
      }
    }

    const isHeading = !inFence && /^#{1,4}\s+/.test(line)
    const isBlankBreak = !inFence && line.trim() === ''
    if (
      current.length > 0 &&
      ((isHeading && currentLen >= Math.floor(maxChars * 0.7)) ||
        (isBlankBreak && currentLen >= maxChars))
    ) {
      chunks.push(current.join('\n').trim())
      current = []
      currentLen = 0
    }

    current.push(line)
    currentLen += line.length + 1
  }

  if (current.length > 0) {
    chunks.push(current.join('\n').trim())
  }

  return chunks.filter(Boolean)
}

/**
 * Calls DeepSeek Chat Completions API.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function callDeepSeek(systemPrompt, userPrompt) {
  if (!API_KEY) {
    throw new Error(
      'Missing DEEPSEEK_API_KEY in environment or .env; cannot run translation.'
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
      max_tokens: 8000,
      messages: [
        { role: 'system', content: systemPrompt },
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
    throw new Error('DeepSeek returned an empty translation response.')
  }
  return content
}

/**
 * Translates frontmatter metadata (title, description, categories) to English JSON.
 * @param {{ title: string; description: string; categories: string[] }} meta
 */
async function translateMetadata(meta) {
  const systemPrompt =
    'You are a senior AI/backend engineering technical translator. Translate the given blog post metadata from Chinese to crisp, natural English. Preserve brand names, acronyms, and model names accurately (e.g., Claude Code, DeepSeekMath-V2, LLM, SFT, RL, Agent). Respond with pure valid JSON matching keys "title", "description", "categories" (array of concise English tags, 1-2 words each). No markdown fences.'
  const userPrompt = JSON.stringify(meta, null, 2)
  const raw = await callDeepSeek(systemPrompt, userPrompt)
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  /** @type {{ title?: string; description?: string; categories?: string[] }} */
  const parsed = JSON.parse(cleaned)
  return {
    title: typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : meta.title,
    description:
      typeof parsed.description === 'string'
        ? parsed.description.trim()
        : meta.description,
    categories: Array.isArray(parsed.categories)
      ? parsed.categories.map((c) => String(c).trim()).filter(Boolean)
      : meta.categories,
  }
}

/**
 * Translates one Markdown body chunk while strictly preserving code/math/image paths.
 * @param {string} chunk
 * @param {number} idx
 * @param {number} total
 */
async function translateMarkdownChunk(chunk, idx, total) {
  const systemPrompt = [
    'You are an expert bilingual software engineer & AI researcher translating a personal technical blog post from Chinese into natural, idiomatic English Markdown.',
    'STRICT PRESERVATION RULES:',
    '1. Output ONLY the translated Markdown body — no preamble, no outer ```markdown wrapper.',
    '2. Preserve ALL Markdown structure verbatim: heading levels (#, ##, ###), tables, blockquotes, lists, links, and horizontal rules.',
    '3. Preserve ALL URLs and local asset paths byte-for-byte (especially `/uploads/...` image and PDF links). Do NOT alter filenames or query strings.',
    '4. Preserve ALL fenced code blocks, CLI flags, keybindings, HTML tags, and KaTeX math (`$...$` and `$$...$$`) intact. If a fenced block contains Chinese natural-language example prompts (e.g. ```txt or ```latex example prompts), translate that natural-language prompt text into English while preserving the fence delimiters and mathematical formulas.',
    '5. Keep the author’s friendly, practical first-person engineering voice. NEVER omit, merge, or skip ANY heading, list item, table row, code fence, or consecutive screenshot image (`![](/uploads/...)`). Every single image path in the input MUST appear in the output.',
  ].join('\n')

  const userPrompt = `Chunk ${idx + 1}/${total}:\n\n${chunk}`
  return callDeepSeek(systemPrompt, userPrompt)
}

/**
 * @param {string} slug
 * @param {{ force: boolean; dryRun: boolean }} opts
 */
async function translateSinglePost(slug, opts) {
  const srcPath = path.join(POSTS_DIR, `${slug}.md`)
  const destPath = path.join(EN_POSTS_DIR, `${slug}.md`)

  if (!opts.force) {
    try {
      await fs.access(destPath)
      console.log(`[skip] ${slug}.md already exists in content/posts/en/`)
      return
    } catch {
      // Destination does not exist yet
    }
  }

  const raw = await fs.readFile(srcPath, 'utf8')
  const parsed = matter(raw)
  const data = /** @type {Record<string, unknown>} */ (parsed.data)

  if (data.draft) {
    console.log(`[skip] ${slug}.md is marked draft: true`)
    return
  }

  if (opts.dryRun) {
    console.log(`[dry-run] Would translate ${slug}.md -> en/${slug}.md`)
    return
  }

  console.log(`[translate] Starting ${slug}.md using ${MODEL}...`)
  const categories = Array.isArray(data.categories)
    ? data.categories.map((c) => String(c))
    : []
  const meta = await translateMetadata({
    title: typeof data.title === 'string' ? data.title : slug,
    description: typeof data.description === 'string' ? data.description : '',
    categories,
  })

  const chunks = splitMarkdownForTranslation(parsed.content)
  /** @type {string[]} */
  const translatedChunks = []
  for (let i = 0; i < chunks.length; i++) {
    console.log(`  - chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
    translatedChunks.push(
      await translateMarkdownChunk(chunks[i], i, chunks.length)
    )
  }

  const nextFrontmatter = {
    title: meta.title,
    slug: typeof data.slug === 'string' ? data.slug : slug,
    publishedAt: data.publishedAt,
    categories: meta.categories,
    description: meta.description,
    cover: typeof data.cover === 'string' ? data.cover : '/opengraph-image.png',
    ...(typeof data.readingTime === 'number'
      ? { readingTime: data.readingTime }
      : {}),
    mood: typeof data.mood === 'string' ? data.mood : 'neutral',
    draft: Boolean(data.draft),
    ...(typeof data.id === 'string' ? { id: data.id } : {}),
    ...(typeof data.coverLqip === 'string' ? { coverLqip: data.coverLqip } : {}),
    ...(typeof data.coverBg === 'string' ? { coverBg: data.coverBg } : {}),
    ...(typeof data.coverFg === 'string' ? { coverFg: data.coverFg } : {}),
  }

  const output = matter.stringify(`${translatedChunks.join('\n\n')}\n`, nextFrontmatter)
  await fs.mkdir(EN_POSTS_DIR, { recursive: true })
  await fs.writeFile(destPath, output, 'utf8')
  console.log(`[done] Wrote content/posts/en/${slug}.md`)
}

async function main() {
  const args = process.argv.slice(2)
  const flags = new Set(args.filter((a) => a.startsWith('--')))
  const slugs = args.filter((a) => !a.startsWith('--'))

  if (flags.has('--help') || (slugs.length === 0 && !flags.has('--all'))) {
    console.log(
      'Usage:\n  pnpm translate:posts <slug1> [slug2 ...] [--force] [--dry-run]\n  pnpm translate:posts --all [--force] [--dry-run]'
    )
    process.exit(flags.has('--help') ? 0 : 1)
  }

  const opts = {
    force: flags.has('--force'),
    dryRun: flags.has('--dry-run'),
  }

  let targetSlugs = slugs
  if (flags.has('--all')) {
    const entries = await fs.readdir(POSTS_DIR, { withFileTypes: true })
    targetSlugs = entries
      .filter((e) => e.isFile() && e.name.endsWith('.md') && !e.name.startsWith('.'))
      .map((e) => e.name.replace(/\.md$/i, ''))
      .sort()
  }

  for (const slug of targetSlugs) {
    await translateSinglePost(slug, opts)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
