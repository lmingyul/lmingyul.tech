import Redis from 'ioredis'

import { env } from '~/env.mjs'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const globalForRedis = globalThis as unknown as {
  ioRedis?: Redis
  memStore?: Map<string, { value: string; expiresAt?: number }>
  zsetStore?: Map<string, Map<string, number>>
}

const memStore =
  globalForRedis.memStore ??
  new Map<string, { value: string; expiresAt?: number }>()
const zsetStore =
  globalForRedis.zsetStore ?? new Map<string, Map<string, number>>()
if (process.env.NODE_ENV !== 'production') {
  globalForRedis.memStore = memStore
  globalForRedis.zsetStore = zsetStore
}

function getClient(): Redis | null {
  if (isBuildPhase || !env.REDIS_URL) {
    return null
  }
  if (!globalForRedis.ioRedis) {
    globalForRedis.ioRedis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    })
    globalForRedis.ioRedis.on('error', (err) => {
      console.error('[Redis]', err.message)
    })
  }
  return globalForRedis.ioRedis
}

function parseValue<T>(raw: string | null): T | null {
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return raw as unknown as T
  }
}

function readMem(key: string): string | null {
  const entry = memStore.get(key)
  if (!entry) return null
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memStore.delete(key)
    return null
  }
  return entry.value
}

export const redis = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const client = getClient()
    if (!client) return parseValue<T>(readMem(key))
    try {
      return parseValue<T>(await client.get(key))
    } catch (err) {
      console.error('[Redis.get]', err)
      return null
    }
  },

  async set(
    key: string,
    value: unknown,
    opts?: { ex?: number }
  ): Promise<'OK' | null> {
    const serialized = JSON.stringify(value)
    const client = getClient()
    if (!client) {
      memStore.set(key, {
        value: serialized,
        expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
      })
      return 'OK'
    }
    try {
      if (opts?.ex) {
        return await client.set(key, serialized, 'EX', opts.ex)
      }
      return await client.set(key, serialized)
    } catch (err) {
      console.error('[Redis.set]', err)
      return null
    }
  },

  async incr(key: string): Promise<number> {
    const client = getClient()
    if (!client) {
      const next = (Number(readMem(key) ?? '0') || 0) + 1
      memStore.set(key, { value: String(next) })
      return next
    }
    try {
      return await client.incr(key)
    } catch (err) {
      console.error('[Redis.incr]', err)
      return 0
    }
  },

  async mget<T extends unknown[] = unknown[]>(...keys: string[]): Promise<T> {
    if (keys.length === 0) return [] as unknown as T
    const client = getClient()
    if (!client) {
      return keys.map((k) => parseValue(readMem(k))) as unknown as T
    }
    try {
      const values = await client.mget(...keys)
      return values.map((v) => parseValue(v)) as unknown as T
    } catch (err) {
      console.error('[Redis.mget]', err)
      return keys.map(() => null) as unknown as T
    }
  },

  async rollingUniqueCount(
    key: string,
    windowSeconds: number,
    member?: string | null
  ): Promise<number | null> {
    const now = Math.floor(Date.now() / 1000)
    const cutoff = now - windowSeconds
    const normalizedMember = member?.trim() ?? ''
    const client = getClient()
    if (!client) {
      let bucket = zsetStore.get(key)
      if (!bucket) {
        bucket = new Map<string, number>()
        zsetStore.set(key, bucket)
      }
      bucket.forEach((score, id) => {
        if (score <= cutoff) {
          bucket?.delete(id)
        }
      })
      if (normalizedMember) {
        bucket.set(normalizedMember, now)
      }
      return bucket.size
    }
    try {
      const count = await client.eval(
        ROLLING_WINDOW_UV_LUA,
        1,
        key,
        String(now),
        String(windowSeconds),
        normalizedMember
      )
      return Number(count)
    } catch (err) {
      console.error('[Redis.rollingUniqueCount]', err)
      return null
    }
  },
}

const ROLLING_WINDOW_UV_LUA = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local member = ARGV[3]
local cutoff = now - window
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', cutoff)
if member ~= '' then
  redis.call('ZADD', KEYS[1], now, member)
  redis.call('EXPIRE', KEYS[1], window)
end
return redis.call('ZCARD', KEYS[1])
`

const RATE_LIMIT_LUA = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return current
`

export function createRatelimit(maxRequests: number, windowSeconds: number) {
  return {
    async limit(identifier: string): Promise<{ success: boolean }> {
      const key = `ratelimit:${identifier}`
      const client = getClient()
      if (!client) {
        const raw = readMem(key)
        const current = (raw ? Number(raw) : 0) + 1
        const existing = memStore.get(key)
        memStore.set(key, {
          value: String(current),
          expiresAt: existing?.expiresAt ?? Date.now() + windowSeconds * 1000,
        })
        return { success: current <= maxRequests }
      }
      try {
        const count = Number(
          await client.eval(RATE_LIMIT_LUA, 1, key, String(windowSeconds))
        )
        return { success: count <= maxRequests }
      } catch (err) {
        console.error('[Ratelimit]', err)
        return { success: true }
      }
    },
  }
}

export const ratelimit = createRatelimit(30, 10)
