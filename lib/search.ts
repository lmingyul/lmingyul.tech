import fs from 'node:fs/promises'
import path from 'node:path'

import {
  getPublishedSearchSources,
  getSearchWatchDirectories,
} from '~/lib/content'
import { cleanHeadingText, createHeadingSlugger } from '~/lib/heading-slug'
import { type Locale, localizePath } from '~/lib/i18n'

export type SearchDocType = 'post' | 'ai-daily'
export type SearchTypeFilter = 'all' | SearchDocType

export interface SearchResultItem {
  id: string
  type: SearchDocType
  slug: string
  title: string
  altTitle?: string
  href: string
  date: string
  tags: string[]
  readingTime: number
  snippet: string
  matchedHeading?: string
  isFallback?: boolean
}

export interface SearchResponse {
  query: string
  terms: string[]
  locale: Locale
  type: SearchTypeFilter
  isDefault: boolean
  counts: {
    all: number
    post: number
    'ai-daily': number
  }
  results: SearchResultItem[]
}

type IndexedSection = {
  anchorId: string
  headingText: string
  normHeading: string
  plainText: string
  normText: string
}

type IndexedDoc = {
  id: string
  type: SearchDocType
  slug: string
  title: string
  altTitle?: string
  baseHref: string
  date: string
  sortTimestamp: number
  tags: string[]
  readingTime: number
  summaryText: string
  isFallback?: boolean
  normTitle: string
  normAltTitle: string
  normTags: string[]
  normSummary: string
  sections: IndexedSection[]
}

type SearchCacheBucket = {
  signature: string
  checkedAt: number
  docs: IndexedDoc[]
}

type SearchCacheState = {
  buckets: Map<Locale, SearchCacheBucket>
  inFlight: Map<Locale, Promise<IndexedDoc[]>>
  generation: number
}

const SIGNATURE_CHECK_TTL_MS = 15_000
const DEFAULT_RECENT_POST_COUNT = 4
const DEFAULT_RECENT_DAILY_COUNT = 3
const DEFAULT_SINGLE_TYPE_COUNT = 7
const SNIPPET_MAX_LEN = 116

const globalForSearch = globalThis as unknown as {
  __lmingyulSearchCache?: SearchCacheState
}

function getCacheState(): SearchCacheState {
  if (!globalForSearch.__lmingyulSearchCache) {
    globalForSearch.__lmingyulSearchCache = {
      buckets: new Map<Locale, SearchCacheBucket>(),
      inFlight: new Map<Locale, Promise<IndexedDoc[]>>(),
      generation: 0,
    }
  }
  return globalForSearch.__lmingyulSearchCache
}

export function invalidateSearchIndex(): void {
  const state = getCacheState()
  state.generation += 1
  state.buckets.clear()
  state.inFlight.clear()
}

export function normalizeSearchText(input: string): string {
  return input.normalize('NFKC').toLowerCase()
}

export function tokenizeSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query).trim()
  if (!normalized) return []

  const rawTokens = normalized.split(/[\s,，、;；|/]+/)
  const seen = new Set<string>()
  const terms: string[] = []

  for (const token of rawTokens) {
    const trimmed = token.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    terms.push(trimmed)
    if (terms.length >= 8) break
  }

  return terms
}

export function stripMarkdownForSearch(markdown: string): string {
  return markdown
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^ {0,3}(?:`{3,}|~{3,})[^\n]*$/gm, ' ')
    .replace(/^ {0,3}\|?(?:\s*:?-{2,}:?\s*\|)+\s*:?-{2,}:?\s*\|?\s*$/gm, ' ')
    .replace(/\\\[(\d+)\\\]\([^)]+\)/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^ {0,3}#{1,6}\s+/gm, '')
    .replace(/^ {0,3}[-*_]{3,}\s*$/gm, ' ')
    .replace(/^ {0,3}>\s?/gm, '')
    .replace(/^ {0,3}(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/[*`~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function finalizeSection(
  anchorId: string,
  headingText: string,
  lines: string[]
): IndexedSection | null {
  const plainText = stripMarkdownForSearch(lines.join('\n'))
  if (!headingText && !plainText) {
    return null
  }
  return {
    anchorId,
    headingText,
    normHeading: normalizeSearchText(headingText),
    plainText,
    normText: normalizeSearchText(plainText),
  }
}

export function splitBlogPostSections(body: string): IndexedSection[] {
  const sections: IndexedSection[] = []
  const lines = body.split('\n')
  let offset = 0
  let inFence = false
  let fenceChar = ''
  let fenceLen = 0

  let currentAnchorId = ''
  let currentHeading = ''
  let currentLines: string[] = []

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1] ?? '```'
      const ch = marker[0] ?? '`'
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
      currentLines.push(line)
      offset += line.length + 1
      continue
    }

    if (!inFence) {
      const headingMatch = line.match(/^( {0,3})(#{1,4})\s+(.+)$/)
      if (headingMatch) {
        const flushed = finalizeSection(
          currentAnchorId,
          currentHeading,
          currentLines
        )
        if (flushed) {
          sections.push(flushed)
        }

        const indent = headingMatch[1]?.length ?? 0
        currentAnchorId = String(offset + indent)
        currentHeading = cleanHeadingText(headingMatch[3] ?? '')
        currentLines = []
        offset += line.length + 1
        continue
      }
    }

    currentLines.push(line)
    offset += line.length + 1
  }

  const tail = finalizeSection(currentAnchorId, currentHeading, currentLines)
  if (tail) {
    sections.push(tail)
  }

  return sections
}

export function splitAiDailySections(body: string): IndexedSection[] {
  const sections: IndexedSection[] = []
  const slugger = createHeadingSlugger()
  const lines = body.split('\n')
  let inFence = false
  let fenceChar = ''
  let fenceLen = 0

  let currentAnchorId = ''
  let currentHeading = ''
  let currentLines: string[] = []

  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/)
    if (fenceMatch) {
      const marker = fenceMatch[1] ?? '```'
      const ch = marker[0] ?? '`'
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
      currentLines.push(line)
      continue
    }

    if (!inFence) {
      const headingMatch = line.match(/^ {0,3}(#{1,4})\s+(.+)$/)
      if (headingMatch) {
        const flushed = finalizeSection(
          currentAnchorId,
          currentHeading,
          currentLines
        )
        if (flushed) {
          sections.push(flushed)
        }

        const headingText = cleanHeadingText(headingMatch[2] ?? '')
        currentAnchorId = headingText ? slugger.slug(headingText) : ''
        currentHeading = headingText
        currentLines = []
        continue
      }
    }

    currentLines.push(line)
  }

  const tail = finalizeSection(currentAnchorId, currentHeading, currentLines)
  if (tail) {
    sections.push(tail)
  }

  return sections
}

async function computeContentSignature(): Promise<string> {
  const dirs = getSearchWatchDirectories()
  const entriesPerDir = await Promise.all(
    dirs.map(async (dir) => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        const fileStats = await Promise.all(
          entries
            .filter(
              (entry) =>
                entry.isFile() &&
                entry.name.endsWith('.md') &&
                !entry.name.startsWith('.') &&
                entry.name.toLowerCase() !== 'readme.md'
            )
            .map(async (entry) => {
              const fullPath = path.join(dir, entry.name)
              const stat = await fs.stat(fullPath)
              return `${fullPath}:${stat.mtimeMs}:${stat.size}`
            })
        )
        return fileStats
      } catch {
        return []
      }
    })
  )

  return entriesPerDir.flat().sort().join('|')
}

async function buildIndexForLocale(locale: Locale): Promise<IndexedDoc[]> {
  const { posts, aiDaily } = await getPublishedSearchSources(locale)
  const docs: IndexedDoc[] = []

  for (const post of posts) {
    const sections = splitBlogPostSections(post.body)
    const fallbackText = sections[0]?.plainText ?? ''
    const summaryText = stripMarkdownForSearch(post.description) || fallbackText

    docs.push({
      id: `post:${post.slug}`,
      type: 'post',
      slug: post.slug,
      title: post.title,
      ...(post.altTitle ? { altTitle: post.altTitle } : {}),
      baseHref: localizePath(`/blog/${post.slug}`, locale),
      date: post.publishedAt.slice(0, 10),
      sortTimestamp: new Date(post.publishedAt).getTime() || 0,
      tags: post.categories,
      readingTime: post.readingTime,
      summaryText,
      isFallback: post.isFallback,
      normTitle: normalizeSearchText(post.title),
      normAltTitle: normalizeSearchText(post.altTitle ?? ''),
      normTags: post.categories.map(normalizeSearchText),
      normSummary: normalizeSearchText(summaryText),
      sections,
    })
  }

  for (const issue of aiDaily) {
    const sections = splitAiDailySections(issue.body)
    const joinedSummary = stripMarkdownForSearch(
      [issue.summary, ...issue.highlights].filter(Boolean).join(' · ')
    )
    const summaryText = joinedSummary || (sections[0]?.plainText ?? '')

    docs.push({
      id: `ai-daily:${issue.slug}`,
      type: 'ai-daily',
      slug: issue.slug,
      title: issue.title,
      ...(issue.altTitle ? { altTitle: issue.altTitle } : {}),
      baseHref: localizePath(`/ai/${issue.slug}`, locale),
      date: issue.date,
      sortTimestamp: new Date(`${issue.date}T00:00:00.000Z`).getTime() || 0,
      tags: issue.tags,
      readingTime: issue.readingTime,
      summaryText,
      isFallback: issue.isFallback,
      normTitle: normalizeSearchText(issue.title),
      normAltTitle: normalizeSearchText(issue.altTitle ?? ''),
      normTags: issue.tags.map(normalizeSearchText),
      normSummary: normalizeSearchText(summaryText),
      sections,
    })
  }

  return docs.sort((a, b) => b.sortTimestamp - a.sortTimestamp)
}

async function getIndexedDocs(locale: Locale): Promise<IndexedDoc[]> {
  const state = getCacheState()
  const now = Date.now()
  const existing = state.buckets.get(locale)

  if (existing && now - existing.checkedAt < SIGNATURE_CHECK_TTL_MS) {
    return existing.docs
  }

  const signature = await computeContentSignature()
  if (existing && existing.signature === signature) {
    existing.checkedAt = now
    return existing.docs
  }

  const inflight = state.inFlight.get(locale)
  if (inflight) {
    return inflight
  }

  const buildGeneration = state.generation
  const buildPromise = buildIndexForLocale(locale)
    .then((docs) => {
      if (state.generation === buildGeneration) {
        state.buckets.set(locale, {
          signature,
          checkedAt: Date.now(),
          docs,
        })
      }
      return docs
    })
    .finally(() => {
      if (state.inFlight.get(locale) === buildPromise) {
        state.inFlight.delete(locale)
      }
    })

  state.inFlight.set(locale, buildPromise)
  return buildPromise
}

function countOccurrences(haystack: string, needle: string, cap = 5): number {
  if (!haystack || !needle) return 0
  let count = 0
  let idx = 0
  while (count < cap) {
    const found = haystack.indexOf(needle, idx)
    if (found === -1) break
    count += 1
    idx = found + needle.length
  }
  return count
}

function truncateText(text: string, maxLen = SNIPPET_MAX_LEN): string {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen).trimEnd()}…`
}

function buildSnippet(
  text: string,
  terms: string[],
  maxLen = SNIPPET_MAX_LEN
): string {
  const clean = text.trim()
  if (!clean) return ''
  if (clean.length <= maxLen) return clean

  const normalized = normalizeSearchText(clean)
  let earliest = -1

  for (const term of terms) {
    const idx = normalized.indexOf(term)
    if (idx !== -1 && (earliest === -1 || idx < earliest)) {
      earliest = idx
    }
  }

  if (earliest === -1) {
    return truncateText(clean, maxLen)
  }

  const lead = 34
  let start = Math.max(0, earliest - lead)
  if (start > 0 && clean.length - start < maxLen) {
    start = Math.max(0, clean.length - maxLen)
  }

  let end = Math.min(clean.length, start + maxLen)
  if (start > 0) {
    const spaceAfter = clean.indexOf(' ', start)
    if (spaceAfter !== -1 && spaceAfter - start < 10) {
      start = spaceAfter + 1
      end = Math.min(clean.length, start + maxLen)
    }
  }

  const slice = clean.slice(start, end).trim()
  const prefix = start > 0 ? '…' : ''
  const suffix = end < clean.length ? '…' : ''
  return `${prefix}${slice}${suffix}`
}

function scoreDocument(
  doc: IndexedDoc,
  normQuery: string,
  terms: string[]
): { score: number; item: SearchResultItem } | null {
  const matchedTerms = new Set<string>()
  let topLevelScore = 0

  if (normQuery) {
    if (doc.normTitle === normQuery) {
      topLevelScore += 220
    } else if (doc.normTitle.startsWith(normQuery)) {
      topLevelScore += 150
    } else if (doc.normTitle.includes(normQuery)) {
      topLevelScore += 110
    }

    if (doc.normAltTitle && doc.normAltTitle.includes(normQuery)) {
      topLevelScore += 55
    }
  }

  for (const term of terms) {
    if (doc.normTitle.includes(term)) {
      matchedTerms.add(term)
      topLevelScore += 45
    }

    let tagMatched = false
    for (const tag of doc.normTags) {
      if (tag === term) {
        topLevelScore += 38
        tagMatched = true
        break
      } else if (tag.includes(term)) {
        topLevelScore += 26
        tagMatched = true
        break
      }
    }
    if (tagMatched) {
      matchedTerms.add(term)
    }

    if (doc.normAltTitle && doc.normAltTitle.includes(term)) {
      matchedTerms.add(term)
      topLevelScore += 24
    }

    if (doc.normSummary.includes(term)) {
      matchedTerms.add(term)
      topLevelScore += 18
    }
  }

  let bestSection: IndexedSection | null = null
  let bestSectionScore = 0
  let totalSectionScore = 0

  for (const section of doc.sections) {
    let secScore = 0
    if (normQuery && section.normHeading && section.normHeading.includes(normQuery)) {
      secScore += 70
    }

    for (const term of terms) {
      if (section.normHeading && section.normHeading.includes(term)) {
        matchedTerms.add(term)
        secScore += 32
      }
      const hits = countOccurrences(section.normText, term, 5)
      if (hits > 0) {
        matchedTerms.add(term)
        secScore += 12 + (hits - 1) * 3
      }
    }

    if (secScore > 0) {
      totalSectionScore += Math.min(secScore, 90)
      if (secScore > bestSectionScore) {
        bestSectionScore = secScore
        bestSection = section
      }
    }
  }

  if (matchedTerms.size === 0) {
    return null
  }

  let rawScore = topLevelScore + bestSectionScore + Math.min(totalSectionScore, 140) * 0.25

  if (terms.length >= 2) {
    const isFullMatch = matchedTerms.size === terms.length
    if (isFullMatch) {
      rawScore += 45
    } else {
      if (terms.length === 2) {
        const [matchedOnly] = Array.from(matchedTerms)
        if (!matchedOnly || matchedOnly.length < 2) {
          return null
        }
      } else if (matchedTerms.size < Math.ceil(terms.length / 2)) {
        return null
      }
      rawScore *= 0.35
    }
  }

  const jumpToSection = Boolean(
    bestSection &&
      bestSection.anchorId &&
      bestSectionScore > 0 &&
      (topLevelScore === 0 || bestSectionScore > topLevelScore)
  )

  const href =
    jumpToSection && bestSection
      ? `${doc.baseHref}#${encodeURIComponent(bestSection.anchorId)}`
      : doc.baseHref

  const matchedHeading =
    jumpToSection && bestSection && bestSection.headingText
      ? bestSection.headingText
      : undefined

  let snippetSource = doc.summaryText
  if (jumpToSection && bestSection?.plainText) {
    snippetSource = bestSection.plainText
  } else {
    const normSummaryHit = terms.some((term) => doc.normSummary.includes(term))
    if (!normSummaryHit && bestSection?.plainText) {
      snippetSource = bestSection.plainText
    }
  }

  const snippet = buildSnippet(
    snippetSource || doc.sections[0]?.plainText || doc.title,
    terms
  )

  return {
    score: rawScore,
    item: {
      id: doc.id,
      type: doc.type,
      slug: doc.slug,
      title: doc.title,
      ...(doc.altTitle ? { altTitle: doc.altTitle } : {}),
      href,
      date: doc.date,
      tags: doc.tags.slice(0, 4),
      readingTime: doc.readingTime,
      snippet,
      ...(matchedHeading ? { matchedHeading } : {}),
      ...(doc.isFallback ? { isFallback: true } : {}),
    },
  }
}

function toDefaultItem(doc: IndexedDoc): SearchResultItem {
  return {
    id: doc.id,
    type: doc.type,
    slug: doc.slug,
    title: doc.title,
    ...(doc.altTitle ? { altTitle: doc.altTitle } : {}),
    href: doc.baseHref,
    date: doc.date,
    tags: doc.tags.slice(0, 4),
    readingTime: doc.readingTime,
    snippet: truncateText(doc.summaryText || doc.sections[0]?.plainText || ''),
    ...(doc.isFallback ? { isFallback: true } : {}),
  }
}

export async function searchSiteContent({
  query,
  locale = 'zh',
  type = 'all',
  limit = 20,
}: {
  query: string
  locale?: Locale
  type?: SearchTypeFilter
  limit?: number
}): Promise<SearchResponse> {
  const docs = await getIndexedDocs(locale)
  const trimmedQuery = query.trim()
  const terms = tokenizeSearchQuery(trimmedQuery)
  const clampedLimit = Math.max(1, Math.min(30, limit))

  if (terms.length === 0) {
    const postDocs = docs.filter((doc) => doc.type === 'post')
    const dailyDocs = docs.filter((doc) => doc.type === 'ai-daily')

    const selected =
      type === 'all'
        ? [
            ...postDocs.slice(0, DEFAULT_RECENT_POST_COUNT),
            ...dailyDocs.slice(0, DEFAULT_RECENT_DAILY_COUNT),
          ]
        : (type === 'post' ? postDocs : dailyDocs).slice(
            0,
            Math.min(clampedLimit, DEFAULT_SINGLE_TYPE_COUNT)
          )

    return {
      query: '',
      terms: [],
      locale,
      type,
      isDefault: true,
      counts: {
        all: docs.length,
        post: postDocs.length,
        'ai-daily': dailyDocs.length,
      },
      results: selected.map(toDefaultItem),
    }
  }

  const normQuery = normalizeSearchText(trimmedQuery)
  const scored: { score: number; sortTimestamp: number; item: SearchResultItem }[] = []

  for (const doc of docs) {
    const match = scoreDocument(doc, normQuery, terms)
    if (match) {
      scored.push({
        score: match.score,
        sortTimestamp: doc.sortTimestamp,
        item: match.item,
      })
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return b.sortTimestamp - a.sortTimestamp
  })

  let postCount = 0
  let dailyCount = 0
  for (const entry of scored) {
    if (entry.item.type === 'post') postCount += 1
    else dailyCount += 1
  }

  const filtered =
    type === 'all'
      ? scored
      : scored.filter((entry) => entry.item.type === type)

  return {
    query: trimmedQuery,
    terms,
    locale,
    type,
    isDefault: false,
    counts: {
      all: scored.length,
      post: postCount,
      'ai-daily': dailyCount,
    },
    results: filtered.slice(0, clampedLimit).map((entry) => entry.item),
  }
}
