import type { Dirent } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

import matter from 'gray-matter'
import readingTime from 'reading-time'

import { getDate } from '~/lib/date'
import {
  type AiTocHeading,
  extractAiTocHeadings,
} from '~/lib/heading-slug'
import { type Locale } from '~/lib/i18n'
import {
  type Post,
  type PostAiSummary,
  type PostDetail,
  type PostHeadingBlock,
} from '~/sanity/schemas/post'
import { type Project } from '~/sanity/schemas/project'

const DEFAULT_COVER = '/opengraph-image.png'

const FALLBACK_PALETTES = [
  { bg: '#27272a', fg: '#ffffff' },
  { bg: '#1e293b', fg: '#ffffff' },
  { bg: '#1f2937', fg: '#ffffff' },
  { bg: '#292524', fg: '#ffffff' },
  { bg: '#18181b', fg: '#ffffff' },
  { bg: '#172554', fg: '#ffffff' },
] as const

function getContentRoot(): string {
  return process.env.BLOG_CONTENT_DIR || path.join(process.cwd(), 'content')
}

function pickPalette(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return FALLBACK_PALETTES[hash % FALLBACK_PALETTES.length]
}

function normalizePublishedAt(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString()
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value.trim())
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
  }
  return new Date().toISOString()
}

function normalizeCategories(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeMood(value: unknown): Post['mood'] {
  if (value === 'happy' || value === 'sad' || value === 'neutral') {
    return value
  }
  return 'neutral'
}

function cleanMarkdownInline(raw: string): string {
  return raw
    .replace(/\s+#+\s*$/, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .trim()
}

function extractHeadings(markdown: string): PostHeadingBlock[] {
  const headings: PostHeadingBlock[] = []
  const lines = markdown.split('\n')
  let offset = 0
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
      offset += line.length + 1
      continue
    }

    if (!inFence) {
      const headingMatch = line.match(/^( {0,3})(#{1,4})\s+(.+)$/)
      if (headingMatch) {
        const indent = headingMatch[1]?.length ?? 0
        const hashes = headingMatch[2]
        const level = hashes.length as 1 | 2 | 3 | 4
        const text = cleanMarkdownInline(headingMatch[3] ?? '')
        if (text) {
          const key = String(offset + indent)
          headings.push({
            _type: 'block',
            style: `h${level}`,
            _key: key,
            children: [
              {
                _type: 'span',
                text,
                _key: `${key}-0`,
              },
            ],
          })
        }
      }
    }

    offset += line.length + 1
  }

  return headings
}

type StoredPost = Post & {
  draft: boolean
  headings: PostHeadingBlock[]
}

async function readPostsFromDirectory(postsDir: string): Promise<StoredPost[]> {
  let entries: Dirent[] = []
  try {
    entries = await fs.readdir(postsDir, { withFileTypes: true })
  } catch {
    return []
  }

  const posts: StoredPost[] = []

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name.startsWith('.')) {
      continue
    }

    const filePath = path.join(postsDir, entry.name)
    const raw = await fs.readFile(filePath, 'utf8')
    const parsed = matter(raw)
    const data = parsed.data as Record<string, unknown>
    const fileSlug = entry.name.replace(/\.md$/i, '')
    const slug =
      typeof data.slug === 'string' && data.slug.trim()
        ? data.slug.trim()
        : fileSlug
    const _id =
      typeof data.id === 'string' && data.id.trim() ? data.id.trim() : slug
    const body = parsed.content.replace(/\r\n/g, '\n').trim()
    const palette = pickPalette(slug)
    const cover =
      typeof data.cover === 'string' && data.cover.trim()
        ? data.cover.trim()
        : DEFAULT_COVER

    const computedReadingTime =
      typeof data.readingTime === 'number' && data.readingTime > 0
        ? data.readingTime
        : Math.max(1, Math.round(readingTime(body).minutes))

    posts.push({
      _id,
      title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : slug,
      slug,
      publishedAt: normalizePublishedAt(data.publishedAt ?? data.date),
      categories: normalizeCategories(data.categories),
      description: typeof data.description === 'string' ? data.description.trim() : '',
      body,
      readingTime: computedReadingTime,
      mood: normalizeMood(data.mood),
      draft: Boolean(data.draft),
      mainImage: {
        _ref: slug,
        asset: {
          url: cover,
          ...(typeof data.coverLqip === 'string' && data.coverLqip.trim()
            ? { lqip: data.coverLqip.trim() }
            : {}),
          dominant: {
            background:
              typeof data.coverBg === 'string' && data.coverBg.trim()
                ? data.coverBg.trim()
                : palette.bg,
            foreground:
              typeof data.coverFg === 'string' && data.coverFg.trim()
                ? data.coverFg.trim()
                : palette.fg,
          },
        },
      },
      headings: extractHeadings(body),
    })
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

async function readLocalizedPosts(locale: Locale = 'zh'): Promise<StoredPost[]> {
  const root = getContentRoot()
  const [zhPosts, enPosts] = await Promise.all([
    readPostsFromDirectory(path.join(root, 'posts')),
    readPostsFromDirectory(path.join(root, 'posts', 'en')),
  ])

  const enMap = new Map<string, StoredPost>()
  for (const enPost of enPosts) {
    if (!enPost.draft) {
      enMap.set(enPost.slug, enPost)
    }
  }

  if (locale === 'zh') {
    return zhPosts.map((post) => ({
      ...post,
      locale: 'zh',
      isFallback: false,
      hasTranslation: enMap.has(post.slug),
    }))
  }

  const zhSlugs = new Set<string>()
  const merged: StoredPost[] = []

  for (const zhPost of zhPosts) {
    zhSlugs.add(zhPost.slug)
    const enPost = enMap.get(zhPost.slug)
    if (enPost) {
      const useZhCover =
        enPost.mainImage.asset.url === DEFAULT_COVER &&
        zhPost.mainImage.asset.url !== DEFAULT_COVER
      merged.push({
        ...enPost,
        _id: zhPost._id || enPost._id,
        publishedAt: zhPost.publishedAt || enPost.publishedAt,
        mainImage: useZhCover ? zhPost.mainImage : enPost.mainImage,
        draft: zhPost.draft || enPost.draft,
        locale: 'en',
        isFallback: false,
        hasTranslation: true,
      })
    } else {
      merged.push({
        ...zhPost,
        locale: 'zh',
        isFallback: true,
        hasTranslation: false,
      })
    }
  }

  for (const enPost of enPosts) {
    if (!zhSlugs.has(enPost.slug) && !enPost.draft) {
      merged.push({
        ...enPost,
        locale: 'en',
        isFallback: false,
        hasTranslation: false,
      })
    }
  }

  return merged.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

function isPublished(post: StoredPost, now = getDate()): boolean {
  return !post.draft && new Date(post.publishedAt).getTime() <= now.valueOf()
}

function toPostSummary(post: StoredPost): Post {
  return {
    _id: post._id,
    title: post.title,
    slug: post.slug,
    mainImage: post.mainImage,
    publishedAt: post.publishedAt,
    description: post.description,
    categories: post.categories,
    body: post.body,
    readingTime: post.readingTime,
    mood: post.mood,
    locale: post.locale,
    isFallback: post.isFallback,
    hasTranslation: post.hasTranslation,
  }
}

function toPostDetail(
  post: StoredPost,
  related?: Post[],
  aiSummary?: PostAiSummary
): PostDetail {
  return {
    ...toPostSummary(post),
    headings: post.headings,
    related,
    ...(aiSummary ? { aiSummary } : {}),
  }
}

type LocalizedSummaryData = {
  summary?: unknown
  points?: unknown
}

type AiSummaryEntry = {
  zh?: LocalizedSummaryData
  en?: LocalizedSummaryData
}

type AiSummaryFile = {
  version?: number
  items?: Record<string, AiSummaryEntry>
}

async function readAiSummaries(): Promise<Record<string, AiSummaryEntry>> {
  try {
    const raw = await fs.readFile(
      path.join(getContentRoot(), 'ai-summaries.json'),
      'utf8'
    )
    const parsed = JSON.parse(raw) as AiSummaryFile
    return parsed?.items && typeof parsed.items === 'object' ? parsed.items : {}
  } catch {
    return {}
  }
}

function pickLocalizedAiSummary(
  entry: AiSummaryEntry | undefined,
  locale: Locale
): PostAiSummary | undefined {
  const block = entry?.[locale]
  if (!block || typeof block !== 'object') {
    return undefined
  }

  const summary = typeof block.summary === 'string' ? block.summary.trim() : ''
  const points = Array.isArray(block.points)
    ? block.points
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : []

  if (!summary || points.length === 0) {
    return undefined
  }

  return { summary, points }
}

export async function getAllLatestBlogPostSlugs(
  locale: Locale = 'zh'
): Promise<string[]> {
  const posts = await readLocalizedPosts(locale)
  const now = getDate()
  return posts.filter((post) => isPublished(post, now)).map((post) => post.slug)
}

export async function getTranslatedEnglishPostSlugs(): Promise<string[]> {
  const posts = await readLocalizedPosts('en')
  const now = getDate()
  return posts
    .filter((post) => isPublished(post, now) && !post.isFallback)
    .map((post) => post.slug)
}

type GetBlogPostsOptions = {
  limit?: number
  offset?: number
  forDisplay?: boolean
  locale?: Locale
  preferTranslated?: boolean
}

export async function getLatestBlogPosts({
  limit = 5,
  offset = 0,
  locale = 'zh',
  preferTranslated = false,
}: GetBlogPostsOptions = {}): Promise<Post[] | null> {
  const posts = await readLocalizedPosts(locale)
  const now = getDate()
  const published = posts.filter((post) => isPublished(post, now))

  if (locale === 'en' && preferTranslated) {
    published.sort((a, b) => {
      const aTranslated = a.isFallback ? 1 : 0
      const bTranslated = b.isFallback ? 1 : 0
      if (aTranslated !== bTranslated) {
        return aTranslated - bTranslated
      }
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    })
  }

  return published.slice(offset, offset + limit).map(toPostSummary)
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export async function getBlogPost(
  slug: string,
  locale: Locale = 'zh'
): Promise<PostDetail | undefined> {
  const [posts, aiSummaries] = await Promise.all([
    readLocalizedPosts(locale),
    readAiSummaries(),
  ])
  const decoded = safeDecode(slug)
  const target = posts.find(
    (post) => !post.draft && (post.slug === slug || post.slug === decoded)
  )
  if (!target) {
    return undefined
  }

  const now = getDate()
  const categories = target.categories ?? []
  const relatedCandidates =
    categories.length > 0
      ? posts.filter(
          (candidate) =>
            candidate._id !== target._id &&
            isPublished(candidate, now) &&
            candidate.categories?.some((cat) => categories.includes(cat))
        )
      : []

  if (locale === 'en') {
    relatedCandidates.sort((a, b) => {
      const aFallback = a.isFallback ? 1 : 0
      const bFallback = b.isFallback ? 1 : 0
      if (aFallback !== bFallback) {
        return aFallback - bFallback
      }
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    })
  }

  const related = relatedCandidates.slice(0, 3).map(toPostSummary)
  const aiSummary = pickLocalizedAiSummary(aiSummaries[target.slug], locale)

  return toPostDetail(target, related, aiSummary)
}

export async function getBlogPostById(
  id: string
): Promise<{ _id: string; slug: string; title: string; imageUrl: string } | undefined> {
  const posts = await readLocalizedPosts('zh')
  const target = posts.find((post) => post._id === id || post.slug === id)
  if (!target) {
    return undefined
  }
  return {
    _id: target._id,
    slug: target.slug,
    title: target.title,
    imageUrl: target.mainImage.asset.url,
  }
}

export async function getBlogPostsByIds(
  ids: string[]
): Promise<{ _id: string; title: string; slug: string }[]> {
  if (ids.length === 0) {
    return []
  }
  const posts = await readLocalizedPosts('zh')
  const result: { _id: string; title: string; slug: string }[] = []
  for (const id of ids) {
    const match = posts.find((post) => post._id === id || post.slug === id)
    if (match) {
      result.push({
        _id: id,
        title: match.title,
        slug: match.slug,
      })
    }
  }
  return result
}

type RawSettings = {
  projects?: {
    id?: string
    name?: string
    url?: string
    description?: string
    icon?: string
  }[]
  heroPhotos?: string[]
  resume?: {
    company: string
    companyEn?: string
    title: string
    titleEn?: string
    logo: string
    start: string
    end?: string
  }[]
}

export async function getSettings(): Promise<{
  projects: Project[] | null
  heroPhotos?: string[] | null
  resume?:
    | {
        company: string
        companyEn?: string
        title: string
        titleEn?: string
        logo: string
        start: string
        end?: string
      }[]
    | null
}> {
  const settingsPath = path.join(getContentRoot(), 'settings.json')
  try {
    const raw = await fs.readFile(settingsPath, 'utf8')
    const data = JSON.parse(raw) as RawSettings

    const projects: Project[] = (data.projects ?? []).map((item, idx) => ({
      _id: item.id?.trim() || item.name?.trim() || `project-${idx + 1}`,
      name: item.name ?? '',
      url: item.url ?? 'https://lmingyul.top',
      description: item.description ?? '',
      icon: item.icon ?? '',
    }))

    return {
      projects,
      heroPhotos: data.heroPhotos ?? null,
      resume: data.resume ?? null,
    }
  } catch {
    return {
      projects: [],
      heroPhotos: null,
      resume: null,
    }
  }
}

export type AiDailyIssueSummary = {
  slug: string
  date: string
  title: string
  summary: string
  tags: string[]
  highlights: string[]
  readingTime: number
  isFallback?: boolean
  hasTranslation?: boolean
}

export type AiDailyIssueDetail = AiDailyIssueSummary & {
  body: string
  headings: AiTocHeading[]
}

function normalizeDailyDate(value: unknown, fileSlug: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim()
    const directMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/)
    if (directMatch?.[1]) {
      return directMatch[1]
    }
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }
  const slugMatch = fileSlug.match(/(\d{4}-\d{2}-\d{2})/)
  if (slugMatch?.[1]) {
    return slugMatch[1]
  }
  return new Date().toISOString().slice(0, 10)
}

function normalizeHighlights(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanMarkdownInline(String(item)))
      .filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split('\n')
      .map((line) => cleanMarkdownInline(line.replace(/^[-*•\d.)\s]+/, '')))
      .filter(Boolean)
  }
  return []
}

function extractSummaryFromBody(markdown: string): string {
  const lines = markdown.split('\n')
  let inFence = false
  for (const rawLine of lines) {
    const trimmed = rawLine.trim()
    if (/^(`{3,}|~{3,})/.test(trimmed)) {
      inFence = !inFence
      continue
    }
    if (inFence || !trimmed) continue
    if (/^#{1,6}\s+/.test(trimmed)) continue
    if (/^[-*_]{3,}$/.test(trimmed)) continue
    if (/^\|.*\|$/.test(trimmed)) continue

    const cleaned = cleanMarkdownInline(
      trimmed.replace(/^>\s*/, '').replace(/^[-*+]\s+/, '').replace(/^\d+\.\s+/, '')
    )
    if (cleaned.length >= 8) {
      return cleaned.length > 140 ? `${cleaned.slice(0, 140)}…` : cleaned
    }
  }
  return ''
}

type StoredAiDailyIssue = AiDailyIssueDetail & {
  draft: boolean
}

async function readAiDailyIssuesFromDir(
  dailyDir: string,
  defaultLocale: Locale
): Promise<StoredAiDailyIssue[]> {
  let entries: Dirent[] = []
  try {
    entries = await fs.readdir(dailyDir, { withFileTypes: true })
  } catch {
    return []
  }

  const issues: StoredAiDailyIssue[] = []

  for (const entry of entries) {
    if (
      !entry.isFile() ||
      !entry.name.endsWith('.md') ||
      entry.name.startsWith('.') ||
      entry.name.toLowerCase() === 'readme.md'
    ) {
      continue
    }

    try {
      const filePath = path.join(dailyDir, entry.name)
      const raw = await fs.readFile(filePath, 'utf8')
      const parsed = matter(raw)
      const data = parsed.data as Record<string, unknown>
      const fileSlug = entry.name.replace(/\.md$/i, '')
      const slug =
        typeof data.slug === 'string' && data.slug.trim()
          ? data.slug.trim()
          : fileSlug
      const date = normalizeDailyDate(data.date ?? data.publishedAt, slug)
      const body = parsed.content.replace(/\r\n/g, '\n').trim()
      if (!body && !data.title) {
        continue
      }

      const title =
        typeof data.title === 'string' && data.title.trim()
          ? data.title.trim()
          : defaultLocale === 'en'
            ? `AI Daily Digest · ${date}`
            : `AI 每日简讯 · ${date}`
      const rawSummary =
        typeof data.summary === 'string' && data.summary.trim()
          ? data.summary.trim()
          : typeof data.description === 'string' && data.description.trim()
            ? data.description.trim()
            : extractSummaryFromBody(body)
      const tags = normalizeCategories(data.tags ?? data.categories)
      const highlights = normalizeHighlights(data.highlights ?? data.tldr)
      const computedReadingTime =
        typeof data.readingTime === 'number' && data.readingTime > 0
          ? data.readingTime
          : Math.max(1, Math.round(readingTime(body).minutes))

      issues.push({
        slug,
        date,
        title,
        summary: rawSummary,
        tags,
        highlights,
        readingTime: computedReadingTime,
        body,
        headings: extractAiTocHeadings(body),
        draft: Boolean(data.draft),
      })
    } catch (err) {
      console.error(`[ai-daily] Failed to parse ${entry.name}:`, err)
    }
  }

  return issues.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date)
    }
    return b.slug.localeCompare(a.slug)
  })
}

async function readLocalizedAiDailyIssues(
  locale: Locale = 'zh'
): Promise<StoredAiDailyIssue[]> {
  const root = getContentRoot()
  const [zhIssues, enIssues] = await Promise.all([
    readAiDailyIssuesFromDir(path.join(root, 'ai-daily'), 'zh'),
    readAiDailyIssuesFromDir(path.join(root, 'ai-daily', 'en'), 'en'),
  ])

  const enMap = new Map<string, StoredAiDailyIssue>()
  for (const enIssue of enIssues) {
    if (!enIssue.draft) {
      enMap.set(enIssue.slug, enIssue)
      if (!enMap.has(enIssue.date)) {
        enMap.set(enIssue.date, enIssue)
      }
    }
  }

  if (locale === 'zh') {
    return zhIssues
      .filter((issue) => !issue.draft)
      .map((issue) => ({
        ...issue,
        isFallback: false,
        hasTranslation: enMap.has(issue.slug) || enMap.has(issue.date),
      }))
  }

  const seenSlugs = new Set<string>()
  const merged: StoredAiDailyIssue[] = []

  for (const zhIssue of zhIssues) {
    if (zhIssue.draft) continue
    seenSlugs.add(zhIssue.slug)
    const enMatch = enMap.get(zhIssue.slug) ?? enMap.get(zhIssue.date)
    if (enMatch) {
      merged.push({
        ...enMatch,
        isFallback: false,
        hasTranslation: true,
      })
    } else {
      merged.push({
        ...zhIssue,
        isFallback: true,
        hasTranslation: false,
      })
    }
  }

  for (const enIssue of enIssues) {
    if (!enIssue.draft && !seenSlugs.has(enIssue.slug)) {
      merged.push({
        ...enIssue,
        isFallback: false,
        hasTranslation: false,
      })
    }
  }

  return merged.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date)
    }
    return b.slug.localeCompare(a.slug)
  })
}

export async function getAiDailyIssues(
  locale: Locale = 'zh'
): Promise<AiDailyIssueSummary[]> {
  const issues = await readLocalizedAiDailyIssues(locale)
  return issues.map(
    ({
      slug,
      date,
      title,
      summary,
      tags,
      highlights,
      readingTime,
      isFallback,
      hasTranslation,
    }) => ({
      slug,
      date,
      title,
      summary,
      tags,
      highlights,
      readingTime,
      isFallback,
      hasTranslation,
    })
  )
}

export async function getTranslatedEnglishAiDailySlugs(): Promise<string[]> {
  const issues = await readLocalizedAiDailyIssues('en')
  return issues.filter((issue) => !issue.isFallback).map((issue) => issue.slug)
}

function toAiDailyDetail(issue: StoredAiDailyIssue): AiDailyIssueDetail {
  return {
    slug: issue.slug,
    date: issue.date,
    title: issue.title,
    summary: issue.summary,
    tags: issue.tags,
    highlights: issue.highlights,
    readingTime: issue.readingTime,
    body: issue.body,
    headings: issue.headings,
    isFallback: issue.isFallback,
    hasTranslation: issue.hasTranslation,
  }
}

export async function getAiDailyIssue(
  slugOrDate?: string,
  locale: Locale = 'zh'
): Promise<AiDailyIssueDetail | undefined> {
  const issues = await readLocalizedAiDailyIssues(locale)
  if (issues.length === 0) {
    return undefined
  }
  if (!slugOrDate) {
    const latest = issues[0]
    return latest ? toAiDailyDetail(latest) : undefined
  }

  const decoded = safeDecode(slugOrDate)
  const target = issues.find(
    (issue) =>
      issue.slug === slugOrDate ||
      issue.slug === decoded ||
      issue.date === slugOrDate ||
      issue.date === decoded
  )
  return target ? toAiDailyDetail(target) : undefined
}
