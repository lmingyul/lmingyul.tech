import { type SchemaTypeDefinition } from 'sanity'

import { readingTimeType } from '~/sanity/schemas/types/readingTime'

import blockContent from './schemas/blockContent'
import category from './schemas/category'
import post from './schemas/post'
import project from './schemas/project'
import settings from './schemas/settings'
import details from "./schemas/objects/Details";
import embed from "./schemas/objects/Embed"
import mathblock from "./schemas/objects/MathBlock"

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [readingTimeType, post, category, blockContent, project, settings, details, embed, mathblock],
}
