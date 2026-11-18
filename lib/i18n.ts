export type Locale = 'zh' | 'en'

export function isEnglishPathname(pathname?: string | null): boolean {
  return Boolean(pathname && (pathname === '/en' || pathname.startsWith('/en/')))
}

export function localeFromPathname(pathname?: string | null): Locale {
  return isEnglishPathname(pathname) ? 'en' : 'zh'
}

export function stripLocalePrefix(pathname: string): string {
  if (!pathname) return '/'
  if (pathname === '/en') return '/'
  if (pathname.startsWith('/en/')) {
    return pathname.slice(3) || '/'
  }
  return pathname
}

export function localizePath(path: string, locale: Locale): string {
  if (
    !path ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('mailto:') ||
    path.startsWith('#')
  ) {
    return path
  }

  const normalized = path.startsWith('/') ? path : `/${path}`
  const match = normalized.match(/^([^?#]*)(.*)$/)
  const basePath = match?.[1] || '/'
  const suffix = match?.[2] || ''
  const stripped = stripLocalePrefix(basePath)

  if (locale === 'zh') {
    return `${stripped}${suffix}`
  }

  const enBase = stripped === '/' ? '/en' : `/en${stripped}`
  return `${enBase}${suffix}`
}

export function switchLocalePath(pathname: string, targetLocale: Locale): string {
  return localizePath(pathname || '/', targetLocale)
}

export type LocalizedNavItem = {
  href: string
  baseHref: string
  text: string
}

const BASE_NAV_ITEMS: readonly { baseHref: string; zh: string; en: string }[] = [
  { baseHref: '/', zh: '首页', en: 'Home' },
  { baseHref: '/blog', zh: '博客', en: 'Blog' },
  { baseHref: '/ai', zh: 'AI', en: 'AI' },
  { baseHref: '/guestbook', zh: '留言墙', en: 'Guestbook' },
  { baseHref: '/about', zh: '关于', en: 'About' },
]

export function getNavigationItems(locale: Locale): LocalizedNavItem[] {
  return BASE_NAV_ITEMS.map((item) => ({
    baseHref: item.baseHref,
    href: localizePath(item.baseHref, locale),
    text: item[locale],
  }))
}

export const PHOTO_CAPTIONS_BY_LOCALE: Record<
  string,
  { zh: { location: string; date: string }; en: { location: string; date: string } }
> = {
  '/uploads/photos/travel-09-guilin.jpg': {
    zh: { location: '桂林象鼻山', date: '2025.06.02' },
    en: { location: 'Elephant Trunk Hill, Guilin', date: '2025.06.02' },
  },
  '/uploads/photos/travel-08-suzhou.jpg': {
    zh: { location: '苏州金鸡湖', date: '2025.05.04' },
    en: { location: 'Jinji Lake, Suzhou', date: '2025.05.04' },
  },
  '/uploads/photos/travel-07-hangzhou.jpg': {
    zh: { location: '杭州湘湖', date: '2025.05.02' },
    en: { location: 'Xianghu Lake, Hangzhou', date: '2025.05.02' },
  },
  '/uploads/photos/travel-06-shanghai.jpg': {
    zh: { location: '上海黄浦江', date: '2025.04.29' },
    en: { location: 'Huangpu River, Shanghai', date: '2025.04.29' },
  },
  '/uploads/photos/travel-05-qingyuan.jpg': {
    zh: { location: '清远笔架山', date: '2025.04.05' },
    en: { location: 'Bijia Mountain, Qingyuan', date: '2025.04.05' },
  },
  '/uploads/photos/travel-04-shenzhen.jpg': {
    zh: { location: '深圳湾人才公园附近', date: '2025.01.04' },
    en: { location: 'Shenzhen Bay Talent Park', date: '2025.01.04' },
  },
  '/uploads/photos/travel-03-phuket.jpg': {
    zh: { location: '泰国普吉岛卡伦海滩边', date: '2024.10.02' },
    en: { location: 'Karon Beach, Phuket', date: '2024.10.02' },
  },
  '/uploads/photos/travel-02-singapore.jpg': {
    zh: { location: '新加坡鱼尾狮附近', date: '2024.09.29' },
    en: { location: 'Merlion Park, Singapore', date: '2024.09.29' },
  },
  '/uploads/photos/travel-01-dali.jpg': {
    zh: { location: '云南大理洱海边', date: '2023.10.03' },
    en: { location: 'Erhai Lake, Dali', date: '2023.10.03' },
  },
}

const zhMessages = {
  seo: {
    defaultTitle: 'lmingyul | 程序员博客',
    titleTemplate: '%s | 阿梁（lmingyul）',
    siteName: '阿梁（lmingyul）',
    description:
      '我是 阿梁，朋友都这样叫（lmingyul，博客的名字取自我和我对象名字的组合），目前是一名后端程序员，兼大模型炼丹师，偏 I 人，现在深圳。座右铭：Keep Learning、Keep Thinking、Keep Trying',
    keywords: '阿梁,lmingyul,梁泰铭,后端程序员,大模型炼丹师,细节控,创新',
    rssTitle: 'RSS 订阅',
  },
  nav: {
    homeLabel: '主页',
    signIn: '登录',
    mobileMenu: '前往',
    closeMenu: '关闭菜单',
    siteNavHeading: '站内导航',
    primaryNavAriaLabel: '主导航',
    dockAriaLabel: '悬浮导航',
    themeSwitchAria: '切换颜色主题',
    themeLight: '浅色模式',
    themeDark: '深色模式',
    themeSystem: '系统模式',
    dockAppearance: '外观',
    dockAppearanceSettings: '外观与语言设置',
    dockLanguage: '语言',
    dockLight: '浅色',
    dockSystem: '系统',
    dockDark: '深色',
    switchToLanguageLabel: 'EN — 切换至英文版',
    switchToLanguageShort: 'EN',
    switchToLanguageTooltip: 'English',
    shortcutHint: (label: string, key: string) =>
      `${label}，快捷键 G 然后 ${key}`,
  },
  headline: {
    developer: '后端程序员',
    alchemist: '大模型炼丹师',
    ocd: '细节控',
    introvert: 'I 人',
    bio: '我是 阿梁，朋友都这样叫（lmingyul，博客的名字取自我和我对象名字的组合），目前是一名后端程序员，兼大模型炼丹师，偏 I 人，现在深圳。座右铭：Keep Learning、Keep Thinking、Keep Trying',
    twitterLabel: '我的推特',
    bilibiliLabel: '我的 Bilibili',
    githubLabel: '我的 GitHub',
    rssLabel: 'RSS 订阅',
    mailLabel: '我的邮箱',
  },
  photos: {
    fallbackCaption: (idx: number) => `旅途瞬间 ${idx + 1}`,
  },
  home: {
    trending: '大家都在看',
    trendingPost: '文章',
    trendingAi: 'AI 板块',
    trendingAiTitle: 'AI 每日简讯',
    trendingAiFallbackSub: '每日追踪大模型与 Agent 工程前沿信号',
    trendingVisitors: (count: number) => `${count} 位访客`,
    recentPosts: '近期文章',
  },
  resume: {
    heading: '工作与教育经历',
    present: '至今',
    companySr: '公司',
    roleSr: '职位',
    periodSr: '日期',
  },
  askMe: {
    heading: '通过 AI 了解我',
    hint: (postCount: number) =>
      `基于我的工程履历、工具清单与 ${postCount} 篇博文实时解答，点下方快捷问题或直接提问。`,
    expand: '展开',
    collapse: '收起',
    clear: '清空',
    thinking: '思考整理中…',
    thinkingSr: 'AI 阿梁正在生成回答',
    inputLabel: '向 AI 阿梁提问',
    placeholder: '问问我的工作、装备或博客文章…',
    submit: '提问',
    errEmpty: '请先输入你想了解的问题',
    errTooLong: '单次提问请控制在 500 字以内',
    errBusy: 'AI 分身暂时有点忙，请稍后再试',
    errNetwork: '网络连接中断，可以直接前往「关于」页面了解阿梁',
    starters: [
      { label: '目前做什么方向？', query: '阿梁目前主要做什么工作与技术方向？' },
      { label: '推荐几篇代表作', query: '推荐几篇阿梁写的 AI 或大模型相关代表文章' },
      { label: '平时用什么硬件？', query: '阿梁平时主力使用哪些电脑和开发硬件？' },
      { label: '怎么联系阿梁？', query: '怎么联系阿梁或者交流互动？' },
    ],
  },
  footer: {
    totalViews: '总浏览量',
    viewsTitle: (formatted: string) => `${formatted}次浏览`,
    weeklyVisitors: '近一周访客',
    weeklyVisitorsTitle: (formatted: string) =>
      `最近 7 天共 ${formatted} 位独立访客`,
    lastVisitorFrom: '最近访客来自',
    forkPrefix: '网站是 Fork 另一个项目：',
  },
  newsletter: {
    heading: '动态更新',
    line1: '喜欢我的内容的话不妨订阅支持一下 🫶',
    subPrefix: '加入其他 ',
    subSuffix: ' 位订阅者，',
    line2: '每月一封，随时可以取消订阅。',
    placeholder: '你的邮箱',
    emailAria: '电子邮箱',
    submit: '订阅',
    success: '请查收订阅确认邮件 🥳',
    invalidEmail: '邮箱地址不正确',
  },
  blog: {
    metaTitle: '我的博客',
    heading: '欢迎光临我的博客',
    description: '什么都写写，随缘更新，留个印记（人生在世，总得留点痕迹）',
    filterAria: '筛选文章语言',
    filterAll: (total: number) => `全部 (${total})`,
    filterEnglish: (count: number) => `英文 (${count})`,
    tagNavAria: '按标签筛选文章',
    tagNavLabel: '标签',
    tagAll: '全部',
    tagMore: (count: number) => `更多 ${count}`,
    tagLess: '收起',
    tagStatusAll: (total: number) => `共 ${total} 篇文章`,
    tagStatusActive: (tag: string, count: number) =>
      `#${tag} 下共 ${count} 篇文章`,
    tagClear: '清除筛选',
    emptyFiltered: '暂无符合条件的技术文章。',
    backToBlog: '返回博客页面',
    viewsSuffix: '次点击',
    readingTimeSuffix: '分钟阅读',
    relatedHeading: '相关文章',
    aiSummaryTitle: 'AI 总结',
    aiSummaryBy: 'DeepSeek 生成',
    aiSummarySkip: '跳过动画',
    readOtherLang: 'Read in English →',
    fallbackBanner: '当前访问中文页面。',
    fallbackLinkLabel: '查看英文版 →',
  },
  aiDaily: {
    metaTitle: 'AI 每日简讯',
    metaDescription:
      '阿梁（lmingyul）的 AI 每日简讯与日报归档，持续记录大模型、Agent 工程与开源前沿信号。',
    notFoundTitle: '未找到该期简讯',
    issueSummaryFallback: (date: string) =>
      `阿梁 AI 每日简讯（${date}）归档内容。`,
    badge: 'AI 每日简讯',
    archiveCount: (count: number) => `共 ${count} 期归档`,
    heading: 'AI 每日简讯 · 日报',
    description:
      '持续追踪大模型训练推理、Agent 工程实践与高价值开源动态，从日常阅读与研究笔记中沉淀高信噪比信号。',
    permalinkLabel: '本期永久链接：',
    emptyTitle: '首期 AI 每日简讯即将同步上线',
    emptyDescPrefix: '当 Notion 日报工作流向 GitHub 仓库推送 ',
    emptyDescSuffix: ' 后，这里会自动展示最新一期内容与历史时间轴归档。',
    mobileArchiveNavAria: '移动端日报期数切换',
    desktopArchiveNavAria: '日报期数归档',
    latestBadge: '最新',
    archiveHeading: '📅 期数归档',
    archiveTotal: (count: number) => `共 ${count} 期`,
    readingTimeText: (mins: number) => `约 ${mins} 分钟阅读`,
    tldrHeading: '今日速览',
    issuePrevNextAria: '前后期日报切换',
    newerIssue: (date: string) => `← 更新一期 (${date})`,
    olderIssue: (date: string) => `更早一期 (${date}) →`,
    fallbackNotice: '',
    tocTitle: '📑 本期目录',
    tocMobileSummary: (count: number) =>
      `📑 本期目录（共 ${count} 节，点击快速跳转）`,
    tocMobileToggleExpand: '展开 ▾',
    tocMobileShowDetails: (count: number) => `显示细项 (${count})`,
    tocMobileSectionsOnly: '仅看章节',
    tocDesktopShowDetails: (count: number) => `细项 (${count})`,
    tocDesktopHideDetails: '收起细项',
    tocTop: '↑ 顶部',
    tocNavAria: '本期目录',
    tocMobileNavAria: '移动端本期目录',
  },
  guestbook: {
    metaTitle: '留言墙',
    heading: '欢迎来到我的留言墙',
    description:
      '在这里，你可以留下你想对我说的话，或是你的建议，或是你的想法，或是你的批评，或是你的赞美，或是你的鼓励，或是你的吐槽。',
    signInToPost: '登录后才可以留言噢',
    placeholder: '说点什么吧，万一火不了呢...',
    markdownSupportPrefix: '支持 ',
    markdownSupportMiddle: ' 与 ',
    markdownDocsUrl:
      'https://docs.github.com/zh/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax',
    previewOpen: '预览一下',
    previewClose: '关闭预览',
    send: '发送',
    dayJsLocale: 'zh-cn',
  },
  comments: {
    signInToComment: '登录后参与讨论',
    reply: '回复',
    replyingPlaceholder: (name: string) => `回复 ${name} 的评论...`,
    commentPlaceholder: '留下你的评论吧...',
    markdownSupportPrefix: '支持 ',
    markdownSupportMiddle: ' 与 ',
    previewOpen: '预览一下',
    previewClose: '关闭预览',
    send: '发送',
  },
  social: {
    bilibili: '哔哩哔哩',
    mail: '邮箱地址',
    rss: 'RSS 订阅',
  },
  notFound: {
    backHome: '返回主页',
  },
}

const enMessages: typeof zhMessages = {
  seo: {
    defaultTitle: 'lmingyul | Backend & LLM Engineering Blog',
    titleTemplate: '%s | Liang (lmingyul)',
    siteName: 'Liang (lmingyul)',
    description:
      'Hi, I’m Liang (lmingyul) — an introverted backend engineer and LLM practitioner in Shenzhen working on search ranking and multi-agent systems. Motto: Keep Learning, Keep Thinking, Keep Trying.',
    keywords:
      'Liang,lmingyul,Backend Engineer,LLM,Agents,Search Ranking,Shenzhen',
    rssTitle: 'RSS Feed',
  },
  nav: {
    homeLabel: 'Home',
    signIn: 'Sign in',
    mobileMenu: 'Menu',
    closeMenu: 'Close menu',
    siteNavHeading: 'Navigation',
    primaryNavAriaLabel: 'Primary',
    dockAriaLabel: 'Floating dock',
    themeSwitchAria: 'Toggle color theme',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    themeSystem: 'System mode',
    dockAppearance: 'Theme',
    dockAppearanceSettings: 'Appearance and language settings',
    dockLanguage: 'Language',
    dockLight: 'Light',
    dockSystem: 'System',
    dockDark: 'Dark',
    switchToLanguageLabel: '中文 — Switch to Chinese version',
    switchToLanguageShort: '中文',
    switchToLanguageTooltip: '切换中文',
    shortcutHint: (label: string, key: string) =>
      `${label}, shortcut G then ${key}`,
  },
  headline: {
    developer: 'Backend Engineer',
    alchemist: 'LLM Alchemist',
    ocd: 'Detail-Obsessed',
    introvert: 'Introvert',
    bio: 'Hi, I’m Liang — friends call me Ah Liang (lmingyul combines my partner’s name and mine). I’m an introverted backend engineer & LLM practitioner based in Shenzhen. Motto: Keep Learning, Keep Thinking, Keep Trying.',
    twitterLabel: 'My X (Twitter)',
    bilibiliLabel: 'My Bilibili',
    githubLabel: 'My GitHub',
    rssLabel: 'RSS Feed',
    mailLabel: 'Email me',
  },
  photos: {
    fallbackCaption: (idx: number) => `Travel moment ${idx + 1}`,
  },
  home: {
    trending: 'Popular right now',
    trendingPost: 'Article',
    trendingAi: 'AI Section',
    trendingAiTitle: 'AI Daily Brief',
    trendingAiFallbackSub: 'Daily signals on LLMs, agents, and open source',
    trendingVisitors: (count: number) => `${count} visitors`,
    recentPosts: 'Recent Posts',
  },
  resume: {
    heading: 'Work & Education',
    present: 'Present',
    companySr: 'Company',
    roleSr: 'Role',
    periodSr: 'Period',
  },
  askMe: {
    heading: 'Ask AI About Me',
    hint: (postCount: number) =>
      `Grounded in my engineering resume, gear list, and ${postCount} blog posts — pick a prompt or ask anything.`,
    expand: 'Expand',
    collapse: 'Collapse',
    clear: 'Clear',
    thinking: 'Thinking…',
    thinkingSr: 'AI Liang is generating an answer',
    inputLabel: 'Ask AI Liang a question',
    placeholder: 'Ask about my work, gear, or blog posts…',
    submit: 'Ask',
    errEmpty: 'Please enter a question first',
    errTooLong: 'Please keep questions under 500 characters',
    errBusy: 'AI assistant is busy right now, please try again shortly',
    errNetwork: 'Connection interrupted — visit the About page to learn more.',
    starters: [
      {
        label: 'What do you work on?',
        query: 'What does Liang currently work on and specialize in?',
      },
      {
        label: 'Flagship AI posts',
        query: 'Recommend a few flagship blog posts by Liang on LLMs or Agents.',
      },
      {
        label: 'Hardware & gear',
        query: 'What computers, display, and daily hardware does Liang use?',
      },
      {
        label: 'How to connect?',
        query: 'How can I contact Liang or connect with him?',
      },
    ],
  },
  footer: {
    totalViews: 'Total views',
    viewsTitle: (formatted: string) => `${formatted} total page views`,
    weeklyVisitors: 'Weekly visitors',
    weeklyVisitorsTitle: (formatted: string) =>
      `${formatted} unique visitors in the past 7 days`,
    lastVisitorFrom: 'Recent visitor from',
    forkPrefix: 'Customized & forked from open-source: ',
  },
  newsletter: {
    heading: 'Monthly Updates',
    line1: 'Enjoying what you read? Subscribe for occasional updates 🫶',
    subPrefix: 'Join ',
    subSuffix: ' other subscribers — ',
    line2: 'one digest a month, unsubscribe anytime.',
    placeholder: 'Your email address',
    emailAria: 'Email address',
    submit: 'Subscribe',
    success: 'Check your inbox to confirm your subscription 🥳',
    invalidEmail: 'Please enter a valid email address',
  },
  blog: {
    metaTitle: 'Blog',
    heading: 'Writing & Notes',
    description:
      'Notes on LLM training, AI agents, backend systems, and everyday life — leaving a trace along the way.',
    filterAria: 'Filter posts by language',
    filterAll: (total: number) => `All (${total})`,
    filterEnglish: (count: number) => `English (${count})`,
    tagNavAria: 'Filter posts by topic',
    tagNavLabel: 'Topics',
    tagAll: 'All',
    tagMore: (count: number) => `${count} more`,
    tagLess: 'Show less',
    tagStatusAll: (total: number) =>
      `${total} ${total === 1 ? 'post' : 'posts'}`,
    tagStatusActive: (tag: string, count: number) =>
      `${count} ${count === 1 ? 'post' : 'posts'} in #${tag}`,
    tagClear: 'Clear filter',
    emptyFiltered: 'No matching articles yet.',
    backToBlog: 'Back to blog',
    viewsSuffix: ' views',
    readingTimeSuffix: ' min read',
    relatedHeading: 'Related Posts',
    aiSummaryTitle: 'AI Summary',
    aiSummaryBy: 'By DeepSeek',
    aiSummarySkip: 'Skip animation',
    readOtherLang: '阅读中文原版 →',
    fallbackBanner:
      'This article is currently available in Chinese only. Showing the original Chinese version below.',
    fallbackLinkLabel: 'View original Chinese URL →',
  },
  aiDaily: {
    metaTitle: 'AI Daily Digest',
    metaDescription:
      'Liang (lmingyul)’s curated AI daily digest archive tracking LLM training & inference, AI agent engineering, and open-source releases.',
    notFoundTitle: 'Digest Issue Not Found',
    issueSummaryFallback: (date: string) =>
      `AI Daily Digest curated by Liang (${date}).`,
    badge: 'AI Daily Digest',
    archiveCount: (count: number) => `${count} archived issues`,
    heading: 'AI Daily Digest',
    description:
      'High-signal daily notes across LLM training & inference, AI agent engineering, research papers, and notable open-source releases.',
    permalinkLabel: 'Issue permalink:',
    emptyTitle: 'The first AI Daily Digest issue is on its way',
    emptyDescPrefix: 'Once the Notion-to-GitHub workflow pushes ',
    emptyDescSuffix:
      ', the latest issue and timeline archive will appear here automatically.',
    mobileArchiveNavAria: 'Issue archive switcher',
    desktopArchiveNavAria: 'Digest issue archive',
    latestBadge: 'Latest',
    archiveHeading: '📅 Archive',
    archiveTotal: (count: number) => `${count} issues`,
    readingTimeText: (mins: number) => `~${mins} min read`,
    tldrHeading: 'TL;DR Highlights',
    issuePrevNextAria: 'Adjacent digest issues',
    newerIssue: (date: string) => `← Newer (${date})`,
    olderIssue: (date: string) => `Older (${date}) →`,
    fallbackNotice:
      'Synced automatically from Notion in Chinese — use the Contents rail on the left to jump across sections.',
    tocTitle: '📑 Contents',
    tocMobileSummary: (count: number) =>
      `📑 Contents (${count} sections, tap to jump)`,
    tocMobileToggleExpand: 'Expand ▾',
    tocMobileShowDetails: (count: number) => `Show items (${count})`,
    tocMobileSectionsOnly: 'Sections only',
    tocDesktopShowDetails: (count: number) => `Items (${count})`,
    tocDesktopHideDetails: 'Hide items',
    tocTop: '↑ Top',
    tocNavAria: 'Issue table of contents',
    tocMobileNavAria: 'Mobile issue table of contents',
  },
  guestbook: {
    metaTitle: 'Guestbook',
    heading: 'Guestbook',
    description:
      'Leave a note here — suggestions, ideas, constructive feedback, encouragement, or just a quick hello.',
    signInToPost: 'Sign in to leave a message',
    placeholder: 'Write something nice (Markdown supported)...',
    markdownSupportPrefix: 'Supports ',
    markdownSupportMiddle: ' & ',
    markdownDocsUrl:
      'https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax',
    previewOpen: 'Preview',
    previewClose: 'Edit',
    send: 'Send',
    dayJsLocale: 'en',
  },
  comments: {
    signInToComment: 'Sign in to join the discussion',
    reply: 'Reply',
    replyingPlaceholder: (name: string) => `Reply to ${name}...`,
    commentPlaceholder: 'Leave a comment...',
    markdownSupportPrefix: 'Supports ',
    markdownSupportMiddle: ' & ',
    previewOpen: 'Preview',
    previewClose: 'Edit',
    send: 'Send',
  },
  social: {
    bilibili: 'Bilibili',
    mail: 'Email',
    rss: 'RSS Feed',
  },
  notFound: {
    backHome: 'Back to Home',
  },
}

export function getMessages(locale: Locale) {
  return locale === 'en' ? enMessages : zhMessages
}
