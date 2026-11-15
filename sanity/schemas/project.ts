import { z } from 'zod'

export const Project = z.object({
  _id: z.string(),
  name: z.string(),
  url: z.string().url(),
  description: z.string(),
  icon: z.string(),
})
export type Project = z.infer<typeof Project>
