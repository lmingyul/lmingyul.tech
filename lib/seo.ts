export const seo = {
  title: 'lmingyul | 程序员博客',
  description:
    '我叫 阿梁（lmingyul），一名后端程序员，大模型炼丹师，I 人，现在深圳。座右铭：Keep Learning、Keep Thinking、Keep Trying',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://lmingyul-tech.vercel.app/'
      : 'http://localhost:3000'
  ),
} as const
