import Redis from 'ioredis'

import { env } from '~/env.mjs'

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const globalForRedis = globalThis as unknown as {
  ioRedis?: Redis
  memStore?: Map<string, { value: string; expiresAt?: number }>
  zsetStore?: Map<string, Map<string, number>>
  setStore?: Map<string, { members: Set<string>; expiresAt?: number }>
}

const memStore =
  globalForRedis.memStore ??
  new Map<string, { value: string; expiresAt?: number }>()
const zsetStore =
  globalForRedis.zsetStore ?? new Map<string, Map<string, number>>()
const setStore =
  globalForRedis.setStore ??
  new Map<string, { members: Set<string>; expiresAt?: number }>()
if (process.env.NODE_ENV !== 'production') {
  globalForRedis.memStore = memStore
  globalForRedis.zsetStore = zsetStore
  globalForRedis.setStore = setStore
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

  async trackDailyUnique(
    seenKey: string,
    dayKey: string,
    visitor: string,
    target: string,
    seenTtlSeconds: number,
    dayTtlSeconds: number
  ): Promise<boolean | null> {
    if (!visitor || !target) return false
    const client = getClient()
    if (!client) {
      const nowMs = Date.now()
      let seen = setStore.get(seenKey)
      if (!seen || (seen.expiresAt && nowMs > seen.expiresAt)) {
        seen = {
          members: new Set<string>(),
          expiresAt: nowMs + seenTtlSeconds * 1000,
        }
        setStore.set(seenKey, seen)
      }
      if (seen.members.has(visitor)) {
        return false
      }
      seen.members.add(visitor)
      let bucket = zsetStore.get(dayKey)
      if (!bucket) {
        bucket = new Map<string, number>()
        zsetStore.set(dayKey, bucket)
      }
      bucket.set(target, (bucket.get(target) ?? 0) + 1)
      return true
    }
    try {
      const added = await client.eval(
        TRENDING_HIT_LUA,
        2,
        seenKey,
        dayKey,
        visitor,
        target,
        String(seenTtlSeconds),
        String(dayTtlSeconds)
      )
      return Number(added) === 1
    } catch (err) {
      console.error('[Redis.trackDailyUnique]', err)
      return null
    }
  },

  async zunionWithScores(
    keys: string[]
  ): Promise<Array<[string, number]> | null> {
    if (keys.length === 0) return []
    const client = getClient()
    if (!client) {
      const totals = new Map<string, number>()
      for (const key of keys) {
        const bucket = zsetStore.get(key)
        if (!bucket) continue
        bucket.forEach((score, member) => {
          totals.set(member, (totals.get(member) ?? 0) + score)
        })
      }
      return Array.from(totals.entries())
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
    }
    try {
      const raw = await client.call(
        'zunion',
        String(keys.length),
        ...keys,
        'WITHSCORES'
      )
      if (!Array.isArray(raw) || raw.length === 0) {
        return []
      }
      const pairs: Array<[string, number]> = []
      const pushPair = (memberRaw: unknown, scoreRaw: unknown) => {
        if (memberRaw == null) return
        const member = String(memberRaw)
        const score = Number(scoreRaw)
        if (member && Number.isFinite(score) && score > 0) {
          pairs.push([member, score])
        }
      }

      if (Array.isArray(raw[0])) {
        for (const entry of raw) {
          if (Array.isArray(entry) && entry.length >= 2) {
            pushPair(entry[0], entry[1])
          }
        }
      } else {
        for (let i = 0; i + 1 < raw.length; i += 2) {
          pushPair(raw[i], raw[i + 1])
        }
      }
      pairs.sort((a, b) => b[1] - a[1])
      return pairs
    } catch (err) {
      console.error('[Redis.zunionWithScores]', err)
      return null
    }
  },

  async recordVisitorAndCountWeekly(opts: {
    weeklyKey: string
    windowSeconds: number
    dailyKey: string
    dailyTtlSeconds: number
    sinceKey: string
    dayStr: string
    member?: string | null
  }): Promise<{ weeklyCount: number; dailySince: string | null } | null> {
    const now = Math.floor(Date.now() / 1000)
    const nowMs = Date.now()
    const cutoff = now - opts.windowSeconds
    const normalizedMember = opts.member?.trim() ?? ''
    const client = getClient()
    if (!client) {
      let weeklyBucket = zsetStore.get(opts.weeklyKey)
      if (!weeklyBucket) {
        weeklyBucket = new Map<string, number>()
        zsetStore.set(opts.weeklyKey, weeklyBucket)
      }
      weeklyBucket.forEach((score, id) => {
        if (score <= cutoff) {
          weeklyBucket?.delete(id)
        }
      })
      if (normalizedMember) {
        weeklyBucket.set(normalizedMember, now)

        let dailySet = setStore.get(opts.dailyKey)
        if (!dailySet || (dailySet.expiresAt && nowMs > dailySet.expiresAt)) {
          dailySet = {
            members: new Set<string>(),
            expiresAt: nowMs + opts.dailyTtlSeconds * 1000,
          }
          setStore.set(opts.dailyKey, dailySet)
        } else {
          dailySet.expiresAt = nowMs + opts.dailyTtlSeconds * 1000
        }
        dailySet.members.add(normalizedMember)

        if (readMem(opts.sinceKey) === null) {
          memStore.set(opts.sinceKey, { value: opts.dayStr })
        }
      }
      const rawSince = readMem(opts.sinceKey)
      const dailySince = rawSince ? rawSince.replace(/^"|"$/g, '') : null
      return {
        weeklyCount: weeklyBucket.size,
        dailySince: dailySince || null,
      }
    }
    try {
      const res = (await client.eval(
        RECORD_VISITOR_LUA,
        3,
        opts.weeklyKey,
        opts.dailyKey,
        opts.sinceKey,
        String(now),
        String(opts.windowSeconds),
        normalizedMember,
        String(opts.dailyTtlSeconds),
        opts.dayStr
      )) as [unknown, unknown]
      const weeklyCount = Number(res?.[0] ?? 0)
      const rawSince = res?.[1] != null ? String(res[1]).trim() : ''
      const dailySince = rawSince ? rawSince.replace(/^"|"$/g, '') : ''
      return {
        weeklyCount: Number.isFinite(weeklyCount) ? weeklyCount : 0,
        dailySince: dailySince || null,
      }
    } catch (err) {
      console.error('[Redis.recordVisitorAndCountWeekly]', err)
      return null
    }
  },

  async scardMany(keys: string[]): Promise<number[] | null> {
    if (keys.length === 0) return []
    const client = getClient()
    if (!client) {
      const nowMs = Date.now()
      return keys.map((key) => {
        const entry = setStore.get(key)
        if (!entry) return 0
        if (entry.expiresAt && nowMs > entry.expiresAt) {
          setStore.delete(key)
          return 0
        }
        return entry.members.size
      })
    }
    try {
      const pipeline = client.pipeline()
      for (const key of keys) {
        pipeline.scard(key)
      }
      const results = await pipeline.exec()
      if (!results) return null
      return results.map(([err, val]) => {
        if (err) return 0
        const n = Number(val ?? 0)
        return Number.isFinite(n) && n > 0 ? n : 0
      })
    } catch (err) {
      console.error('[Redis.scardMany]', err)
      return null
    }
  },
}

const RECORD_VISITOR_LUA = `
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local member = ARGV[3]
local dailyTtl = tonumber(ARGV[4])
local dayStr = ARGV[5]
local cutoff = now - window
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', cutoff)
if member ~= '' then
  redis.call('ZADD', KEYS[1], now, member)
  redis.call('EXPIRE', KEYS[1], window)
  redis.call('SADD', KEYS[2], member)
  redis.call('EXPIRE', KEYS[2], dailyTtl)
  redis.call('SET', KEYS[3], dayStr, 'NX')
end
local weeklyCount = redis.call('ZCARD', KEYS[1])
local since = redis.call('GET', KEYS[3])
return { weeklyCount, since or '' }
`

const TRENDING_HIT_LUA = `
local added = redis.call('SADD', KEYS[1], ARGV[1])
redis.call('EXPIRE', KEYS[1], tonumber(ARGV[3]))
if added == 1 then
  redis.call('ZINCRBY', KEYS[2], 1, ARGV[2])
  redis.call('EXPIRE', KEYS[2], tonumber(ARGV[4]))
end
return added
`

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
