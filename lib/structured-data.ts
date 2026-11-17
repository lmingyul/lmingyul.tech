import { url } from '~/lib'
import { getMessages, type Locale } from '~/lib/i18n'
import { seo } from '~/lib/seo'
import { type AiDailyIssueDetail } from '~/sanity/queries'
import { type PostDetail } from '~/sanity/schemas/post'

const SAME_AS_LINKS = [
  'https://github.com/lmingyul',
  'https://x.com/TommySteve1117',
  'https://space.bilibili.com/209721840',
]

export function buildPersonEntity(locale: Locale = 'zh') {
  const isEn = locale === 'en'
  return {
    '@type': 'Person',
    '@id': url('/#person').href,
    name: isEn ? 'Liang (lmingyul)' : '阿梁（lmingyul）',
    alternateName: ['lmingyul', '阿梁', '梁泰铭', 'Taiming Liang'],
    url: url(isEn ? '/en/about' : '/about').href,
    image: url('/opengraph-image.png').href,
    jobTitle: isEn
      ? 'Systems Development Engineer (Backend & LLM Search)'
      : '系统开发工程师（后端与大模型搜索）',
    worksFor: {
      '@type': 'Organization',
      name: isEn ? 'CMB Network Technology' : '招银网络科技有限公司',
    },
    alumniOf: [
      {
        '@type': 'CollegeOrUniversity',
        name: isEn ? 'Hefei University of Technology' : '合肥工业大学',
      },
      {
        '@type': 'CollegeOrUniversity',
        name: isEn
          ? 'Harbin University of Science and Technology'
          : '哈尔滨理工大学',
      },
    ],
    homeLocation: {
      '@type': 'Place',
      name: isEn ? 'Shenzhen, Guangdong, China' : '中国广东深圳',
    },
    knowsAbout: [
      'Backend Engineering',
      'Large Language Models',
      'Search Ranking',
      'LLM Reranking',
      'Multi-Agent Systems',
      'RAG',
    ],
    email: 'mailto:taimingliang1117@gmail.com',
    sameAs: SAME_AS_LINKS,
  }
}

export function buildHomeJsonLd(locale: Locale = 'zh') {
  const isEn = locale === 'en'
  const enSeo = getMessages('en').seo

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': url('/#website').href,
        url: url(isEn ? '/en' : '/').href,
        name: isEn ? enSeo.defaultTitle : seo.title,
        description: isEn ? enSeo.description : seo.description,
        inLanguage: isEn ? 'en' : 'zh-CN',
        publisher: {
          '@id': url('/#person').href,
        },
      },
      buildPersonEntity(locale),
    ],
  }
}

export function buildAboutJsonLd(locale: Locale = 'zh') {
  const isEn = locale === 'en'
  const enSeo = getMessages('en').seo

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        url: url(isEn ? '/en/about' : '/about').href,
        name: isEn ? 'About Me | Liang (lmingyul)' : '关于我 | 阿梁（lmingyul）',
        description: isEn ? enSeo.description : seo.description,
        inLanguage: isEn ? 'en' : 'zh-CN',
        mainEntity: {
          '@id': url('/#person').href,
        },
      },
      buildPersonEntity(locale),
    ],
  }
}

export function buildBlogPostJsonLd(post: PostDetail, locale: Locale = 'zh') {
  const isEnglishEdition = locale === 'en' && !post.isFallback
  const canonicalUrl = url(
    isEnglishEdition ? `/en/blog/${post.slug}` : `/blog/${post.slug}`
  ).href
  const ogImageUrl = post.mainImage.asset.url.startsWith('http')
    ? post.mainImage.asset.url
    : url(post.mainImage.asset.url).href
  const parsedDate = new Date(post.publishedAt)
  const publishedIso = Number.isNaN(parsedDate.getTime())
    ? post.publishedAt
    : parsedDate.toISOString()

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: [ogImageUrl],
    datePublished: publishedIso,
    dateModified: publishedIso,
    inLanguage: isEnglishEdition ? 'en' : 'zh-CN',
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    ...(post.categories && post.categories.length > 0
      ? { keywords: post.categories.join(', ') }
      : {}),
    author: buildPersonEntity(locale),
    publisher: buildPersonEntity(locale),
  }
}

function buildAiIssueArticleEntity(
  issue: AiDailyIssueDetail,
  locale: Locale,
  series: { '@type': string; name: string; url: string }
) {
  const isEnglishEdition = locale === 'en' && !issue.isFallback
  const canonicalIssueUrl = url(
    isEnglishEdition ? `/en/ai/${issue.slug}` : `/ai/${issue.slug}`
  ).href
  const publishedIso = `${issue.date}T08:00:00+08:00`

  return {
    '@type': 'TechArticle',
    headline: issue.title,
    description:
      issue.summary ||
      getMessages(locale).aiDaily.issueSummaryFallback(issue.date),
    datePublished: publishedIso,
    dateModified: publishedIso,
    inLanguage: isEnglishEdition ? 'en' : 'zh-CN',
    url: canonicalIssueUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalIssueUrl,
    },
    isPartOf: series,
    ...(issue.tags.length > 0 ? { keywords: issue.tags.join(', ') } : {}),
    ...(issue.highlights.length > 0
      ? { abstract: issue.highlights.join('；') }
      : {}),
    author: buildPersonEntity(locale),
    publisher: buildPersonEntity(locale),
  }
}

export function buildAiDailyJsonLd({
  issue,
  issuesCount,
  isIndexPage = false,
  locale = 'zh',
}: {
  issue?: AiDailyIssueDetail
  issuesCount: number
  isIndexPage?: boolean
  locale?: Locale
}) {
  const isEn = locale === 'en'
  const indexUrl = url(isEn ? '/en/ai' : '/ai').href
  const series = {
    '@type': 'CreativeWorkSeries',
    name: isEn
      ? 'Liang (lmingyul) AI Daily Digest'
      : '阿梁（lmingyul）AI 每日简讯',
    url: indexUrl,
  }

  if (!isIndexPage && issue) {
    return {
      '@context': 'https://schema.org',
      ...buildAiIssueArticleEntity(issue, locale, series),
    }
  }

  const aiDailyMsg = getMessages(locale).aiDaily

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: aiDailyMsg.heading,
        description: aiDailyMsg.metaDescription,
        url: indexUrl,
        inLanguage: isEn ? 'en' : 'zh-CN',
        isPartOf: {
          '@id': url('/#website').href,
        },
        about: series,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: issuesCount,
        },
      },
      ...(issue ? [buildAiIssueArticleEntity(issue, locale, series)] : []),
    ],
  }
}
