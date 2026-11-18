import { type Locale } from '~/lib/i18n'

export const DEFAULT_VISIBLE_TAG_COUNT = 12

const EN_TAG_LABELS: Record<string, string> = {
  工具: 'Tools',
  随笔: 'Essays',
  总结: 'Recaps',
  编程语言: 'Programming',
  运维: 'DevOps',
  用好系列: 'Guides',
  命令: 'Commands',
  常用系列: 'Essentials',
  思考: 'Thinking',
  面试: 'Interviews',
  框架: 'Frameworks',
  收藏夹: 'Bookmarks',
  知识图谱: 'Knowledge Graph',
  系统设计: 'System Design',
}

/** Localize a single post tag into the active route locale while preserving unknown tags. */
export function localizeTag(tag: string, locale: Locale): string {
  const trimmed = tag.trim()
  if (!trimmed) return ''
  return locale === 'en' ? EN_TAG_LABELS[trimmed] ?? trimmed : trimmed
}

/** Localize and deduplicate a post's tag list while keeping declaration order. */
export function localizePostTags(
  tags: string[] | undefined,
  locale: Locale
): string[] {
  if (!tags || tags.length === 0) return []
  return Array.from(
    new Set(tags.map((tag) => localizeTag(tag, locale)).filter(Boolean))
  )
}

export type TagStat = {
  tag: string
  count: number
}

/** Aggregate post counts per tag sorted by frequency desc, then alphabetical. */
export function collectTagStats(
  posts: ReadonlyArray<{ categories?: string[] }>,
  locale: Locale = 'zh'
): TagStat[] {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of new Set(post.categories ?? [])) {
      const clean = tag.trim()
      if (!clean) continue
      counts.set(clean, (counts.get(clean) ?? 0) + 1)
    }
  }

  const collatorLocale = locale === 'en' ? 'en' : 'zh-Hans-CN'
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort(
      (a, b) =>
        b.count - a.count || a.tag.localeCompare(b.tag, collatorLocale)
    )
}

/** Normalize the incoming `?tag=` query value and localize it when needed. */
export function resolveTagParam(
  value: string | string[] | undefined,
  locale: Locale = 'zh'
): string | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  return localizeTag(trimmed, locale)
}

/** Resolve a candidate tag against live stats (exact match first, then case-insensitive). */
export function matchActiveTag(
  candidate: string | null | undefined,
  stats: ReadonlyArray<TagStat>
): string | null {
  if (!candidate) return null
  const trimmed = candidate.trim()
  if (!trimmed) return null
  const exact = stats.find((item) => item.tag === trimmed)
  if (exact) return exact.tag
  const lower = trimmed.toLowerCase()
  const insensitive = stats.find((item) => item.tag.toLowerCase() === lower)
  return insensitive ? insensitive.tag : null
}

/** Build the deep-link URL for the blog list filtered by a single tag (or unfiltered when null). */
export function buildBlogTagHref(
  basePath: string,
  tag: string | null
): string {
  if (!tag) return basePath
  return `${basePath}?tag=${encodeURIComponent(tag)}`
}
