import fs from 'node:fs/promises'
import path from 'node:path'

import { url } from '~/lib'
import {
  getAiDailyIssue,
  getAiDailyIssues,
  getLatestBlogPosts,
} from '~/sanity/queries'

const FALLBACK_PERSONA_ZH = `# 阿梁（lmingyul）个人知识库
- 深圳后端程序员 & 大模型炼丹师，偏 I 人，座右铭：Keep Learning、Keep Thinking、Keep Trying。
- 2023.11 至今在招银网络科技（深圳）任系统开发工程师，负责招商银行手机 App 搜索功能研发（LLM 搜索重排、多 Agents 协同）；2021.07–2023.06 任中兴通讯软件开发工程师；合肥工业大学硕士、哈尔滨理工大学本科。
- 联系邮箱：taimingliang1117@gmail.com，GitHub：https://github.com/lmingyul。`

const FALLBACK_PERSONA_EN = `# Liang (lmingyul) Personal Knowledge Base
- Introverted backend engineer & LLM practitioner based in Shenzhen, China. Motto: Keep Learning, Keep Thinking, Keep Trying.
- Systems Development Engineer at CMB Network Technology (2023.11–Present), working on China Merchants Bank mobile app search (LLM reranking & multi-agent workflows); previously Software Engineer at ZTE Corporation (2021.07–2023.06); M.Eng. from Hefei University of Technology, B.Eng. from Harbin University of Science and Technology.
- Email: taimingliang1117@gmail.com, GitHub: https://github.com/lmingyul.`

function getContentRoot(): string {
  return process.env.BLOG_CONTENT_DIR || path.join(process.cwd(), 'content')
}

async function readPersonaFile(
  filename: string,
  fallback: string
): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(getContentRoot(), filename), 'utf8')
    return raw.trim() || fallback
  } catch {
    return fallback
  }
}

export async function buildLlmsTxt(): Promise<string> {
  const [zhPosts, enPosts, aiIssues] = await Promise.all([
    getLatestBlogPosts({ limit: 999, locale: 'zh' }),
    getLatestBlogPosts({ limit: 999, locale: 'en' }),
    getAiDailyIssues('zh'),
  ])

  const zhPostList = zhPosts ?? []
  const enTranslatedPosts = (enPosts ?? []).filter((post) => !post.isFallback)
  const latestAiIssues = aiIssues.slice(0, 30)

  const lines: string[] = [
    '# 阿梁（lmingyul）| Backend & LLM Engineering Blog',
    '',
    `> Personal engineering blog and curated AI daily digest by Liang (阿梁 / lmingyul, \`https://lmingyul.top\`), a Shenzhen-based Systems Development Engineer working on search ranking, LLM reranking, RAG, and multi-agent workflows.`,
    '',
    '## Author Profile & Feeds',
    '',
    '- Name / Handles: 阿梁, lmingyul, 梁泰铭 (Taiming Liang)',
    '- Role: Backend & LLM Systems Development Engineer (CMB Network Technology, Shenzhen; previously ZTE)',
    `- Bilingual Editions: Chinese (${url('/').href}) and English (${url('/en').href})`,
    `- Extended Full Context: [llms-full.txt](${url('/llms-full.txt').href})`,
    `- Sitemap: [sitemap.xml](${url('/sitemap.xml').href})`,
    `- RSS Feeds: [Chinese Blog RSS](${url('/feed.xml').href}) | [English Blog RSS](${url('/en/feed.xml').href}) | [AI Daily Digest RSS](${url('/ai/feed.xml').href})`,
    '- Links: [GitHub](https://github.com/lmingyul) | [X](https://x.com/TommySteve1117) | [Bilibili](https://space.bilibili.com/209721840) | Email: `taimingliang1117@gmail.com`',
    '',
    '## Primary Routes',
    '',
    `- [首页 / Home (ZH)](${url('/').href}): Featured engineering bio, stacked travel photos, recent blog posts, work & education timeline, and interactive "Ask AI About Me".`,
    `- [关于我 / About (ZH)](${url('/about').href}): Detailed resume, daily hardware & software gear ratings, and photo highlights.`,
    `- [技术博客 / Blog (ZH)](${url('/blog').href}): Complete archive of ${zhPostList.length} Chinese engineering articles and reflections.`,
    `- [AI 每日简讯 / AI Daily Digest (ZH)](${url('/ai').href}): ${aiIssues.length} archived daily digests covering LLM releases, Agent engineering, open-source tools, and papers.`,
    `- [留言墙 / Guestbook (ZH)](${url('/guestbook').href}): Reader guestbook and community discussion.`,
    `- [English Home](${url('/en').href}) | [English About](${url('/en/about').href}) | [English Blog](${url('/en/blog').href}) | [English AI Daily](${url('/en/ai').href})`,
    '',
    `## AI Daily Digest (AI 每日简讯 — Latest ${latestAiIssues.length} of ${aiIssues.length} Issues)`,
    '',
  ]

  if (latestAiIssues.length === 0) {
    lines.push('- (No AI Daily Digest issues published yet.)')
  } else {
    for (const issue of latestAiIssues) {
      const tags = issue.tags.length > 0 ? ` [${issue.tags.join(', ')}]` : ''
      const summary = issue.summary ? `: ${issue.summary}` : ''
      lines.push(
        `- [${issue.title}](${url(`/ai/${issue.slug}`).href}) (${issue.date})${tags}${summary}`
      )
    }
  }

  lines.push('', `## English Articles (${enTranslatedPosts.length} Translated Flagship Posts)`, '')

  for (const post of enTranslatedPosts) {
    const date = post.publishedAt.slice(0, 10)
    const cats =
      post.categories && post.categories.length > 0
        ? ` [${post.categories.join(', ')}]`
        : ''
    const desc = post.description ? `: ${post.description}` : ''
    lines.push(
      `- [${post.title}](${url(`/en/blog/${post.slug}`).href}) (${date})${cats}${desc}`
    )
  }

  lines.push('', `## All Blog Posts (${zhPostList.length} 中文博文全集)`, '')

  for (const post of zhPostList) {
    const date = post.publishedAt.slice(0, 10)
    const cats =
      post.categories && post.categories.length > 0
        ? ` [${post.categories.join(', ')}]`
        : ''
    const desc = post.description ? `: ${post.description}` : ''
    lines.push(
      `- [${post.title}](${url(`/blog/${post.slug}`).href}) (${date})${cats}${desc}`
    )
  }

  lines.push('')
  return lines.join('\n')
}

export async function buildLlmsFullTxt(): Promise<string> {
  const [personaZh, personaEn, zhPosts, aiIssues] = await Promise.all([
    readPersonaFile('ai-persona.md', FALLBACK_PERSONA_ZH),
    readPersonaFile('ai-persona.en.md', FALLBACK_PERSONA_EN),
    getLatestBlogPosts({ limit: 999, locale: 'zh' }),
    getAiDailyIssues('zh'),
  ])

  const zhPostList = zhPosts ?? []
  const latestFiveSummaries = aiIssues.slice(0, 5)
  const latestFiveDetails = await Promise.all(
    latestFiveSummaries.map((item) => getAiDailyIssue(item.slug, 'zh'))
  )

  const lines: string[] = [
    '# 阿梁（lmingyul）| Full Site Knowledge Corpus for LLMs',
    '',
    `> Source: ${url('/').href} | Concise Index: ${url('/llms.txt').href} | Sitemap: ${url('/sitemap.xml').href}`,
    '',
    '## Part 1: Author Persona (中文个人知识库)',
    '',
    personaZh,
    '',
    '## Part 2: Author Persona (English Knowledge Base)',
    '',
    personaEn,
    '',
    `## Part 3: Blog Post Catalog & Outlines (${zhPostList.length} Posts)`,
    '',
  ]

  for (const post of zhPostList) {
    const date = post.publishedAt.slice(0, 10)
    const cats =
      post.categories && post.categories.length > 0
        ? post.categories.join(', ')
        : '未分类'
    lines.push(
      `### ${post.title}`,
      `- URL: ${url(`/blog/${post.slug}`).href}${
        post.hasTranslation ? ` | EN: ${url(`/en/blog/${post.slug}`).href}` : ''
      }`,
      `- Published: ${date} | Reading Time: ${post.readingTime.toFixed(0)} min | Categories: ${cats}`
    )
    if (post.description) {
      lines.push(`- Summary: ${post.description}`)
    }
    const outline = post.body
      .split('\n')
      .filter((line) => /^#{1,3}\s+/.test(line.trim()))
      .map((line) => line.replace(/^#+\s+/, '').trim())
      .filter(Boolean)
      .slice(0, 12)
    if (outline.length > 0) {
      lines.push(`- Sections: ${outline.join(' / ')}`)
    }
    lines.push('')
  }

  lines.push(
    `## Part 4: Latest ${latestFiveDetails.filter(Boolean).length} AI Daily Digests (Full Text)`,
    ''
  )

  for (const detail of latestFiveDetails) {
    if (!detail) continue
    lines.push(
      `### ${detail.title}`,
      `- Permalink: ${url(`/ai/${detail.slug}`).href}`,
      `- Date: ${detail.date}${
        detail.tags.length > 0 ? ` | Tags: ${detail.tags.join(', ')}` : ''
      }`
    )
    if (detail.summary) {
      lines.push(`- Summary: ${detail.summary}`)
    }
    lines.push('', detail.body, '')
  }

  return lines.join('\n')
}
