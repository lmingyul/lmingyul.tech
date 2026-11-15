export const seo = {
  title: 'lmingyul | 程序员博客',
  description:
    '我是 阿梁，朋友都这样叫（lmingyul，博客的名字取自我和我对象名字的组合），目前是一名后端程序员，兼大模型炼丹师，偏 I 人，现在深圳。座右铭：Keep Learning、Keep Thinking、Keep Trying',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://lmingyul.top'
      : 'http://localhost:3000'
  ),
} as const
