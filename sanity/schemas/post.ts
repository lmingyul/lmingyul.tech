import { z } from 'zod'

export interface PostHeadingBlock {
  _type: 'block'
  style: 'h1' | 'h2' | 'h3' | 'h4'
  _key: string
  children: {
    _type: 'span'
    text: string
    _key: string
  }[]
}

export const Post = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  mainImage: z.object({
    _ref: z.string(),
    asset: z.object({
      url: z.string(),
      lqip: z.string().optional(),
      dominant: z
        .object({
          background: z.string(),
          foreground: z.string(),
        })
        .optional(),
    }),
  }),
  publishedAt: z.string(),
  description: z.string(),
  categories: z.array(z.string()).optional(),
  body: z.string(),
  readingTime: z.number(),
  mood: z.enum(['happy', 'sad', 'neutral']),
  locale: z.enum(['zh', 'en']).optional(),
  isFallback: z.boolean().optional(),
  hasTranslation: z.boolean().optional(),
})
export type Post = z.infer<typeof Post>
export type PostAiSummary = {
  summary: string
  points: string[]
}
export type PostDetail = Post & {
  headings: PostHeadingBlock[]
  related?: Post[]
  aiSummary?: PostAiSummary
}
