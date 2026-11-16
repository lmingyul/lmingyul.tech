export type AiTocHeading = {
  id: string
  level: 1 | 2 | 3 | 4
  text: string
}

export function cleanHeadingText(raw: string): string {
  return raw
    .replace(/\s+#+\s*$/, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)/g, '')
    .trim()
}

export function createHeadingSlugger() {
  const seen = new Map<string, number>()

  return {
    slug(rawText: string): string {
      const cleaned = cleanHeadingText(rawText).toLowerCase()
      const base =
        cleaned
          .replace(/[^\p{L}\p{N}]+/gu, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 64)
          .replace(/-+$/g, '') || 'section'

      const count = seen.get(base) ?? 0
      seen.set(base, count + 1)
      return count === 0 ? base : `${base}-${count + 1}`
    },
  }
}

export function extractAiTocHeadings(markdown: string): AiTocHeading[] {
  const headings: AiTocHeading[] = []
  const slugger = createHeadingSlugger()
  const lines = markdown.split('\n')
  let inFence = false
  let fenceChar = ''
  let fenceLen = 0

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
      continue
    }

    if (!inFence) {
      const match = line.match(/^ {0,3}(#{1,4})\s+(.+)$/)
      if (match) {
        const level = (match[1]?.length ?? 2) as 1 | 2 | 3 | 4
        const text = cleanHeadingText(match[2] ?? '')
        if (text) {
          headings.push({
            id: slugger.slug(text),
            level,
            text,
          })
        }
      }
    }
  }

  return headings
}
