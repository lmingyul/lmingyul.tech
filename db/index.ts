import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '~/env.mjs'

const globalForDb = globalThis as unknown as { pgPool?: Pool }

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgPool = pool
}

export const db = drizzle(pool)
