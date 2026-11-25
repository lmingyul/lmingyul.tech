import Redis from 'ioredis'

const WEEKLY_KEY = 'weekly_visitors'
const SINCE_KEY = 'visitors:daily_since'
const DAILY_KEY_PREFIX = 'visitors:day:'
const DAILY_TTL_SECONDS = 45 * 24 * 60 * 60

const shanghaiDayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function toShanghaiDayStr(epochSeconds) {
  return shanghaiDayFormatter.format(new Date(epochSeconds * 1000)).replace(/-/g, '')
}

async function main() {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is required')
  }

  const client = new Redis(redisUrl, { maxRetriesPerRequest: 2 })

  try {
    const raw = await client.zrange(WEEKLY_KEY, 0, -1, 'WITHSCORES')
    const buckets = new Map()

    for (let i = 0; i + 1 < raw.length; i += 2) {
      const member = raw[i]
      const score = Number(raw[i + 1])
      if (!member || !Number.isFinite(score) || score <= 0) continue
      const dayStr = toShanghaiDayStr(score)
      let set = buckets.get(dayStr)
      if (!set) {
        set = new Set()
        buckets.set(dayStr, set)
      }
      set.add(member)
    }

    const sortedDays = Array.from(buckets.keys()).sort()
    const pipeline = client.pipeline()

    for (const dayStr of sortedDays) {
      const members = Array.from(buckets.get(dayStr))
      if (members.length === 0) continue
      const key = `${DAILY_KEY_PREFIX}${dayStr}`
      pipeline.sadd(key, ...members)
      pipeline.expire(key, DAILY_TTL_SECONDS)
    }

    const existingSinceRaw = await client.get(SINCE_KEY)
    const existingSince = existingSinceRaw
      ? existingSinceRaw.replace(/^"|"$/g, '').trim()
      : ''

    const candidates = [...sortedDays]
    if (/^\d{8}$/.test(existingSince)) {
      candidates.push(existingSince)
    }
    candidates.sort()

    const earliest = candidates[0] ?? null
    if (earliest) {
      pipeline.set(SINCE_KEY, earliest)
    }

    if (sortedDays.length > 0 || earliest) {
      await pipeline.exec()
    }

    const summary = []
    for (const dayStr of sortedDays) {
      const count = await client.scard(`${DAILY_KEY_PREFIX}${dayStr}`)
      summary.push({ day: dayStr, seeded: buckets.get(dayStr).size, total: count })
    }

    console.log(
      JSON.stringify(
        {
          weeklyMembersProcessed: Math.floor(raw.length / 2),
          dailySince: earliest,
          days: summary,
        },
        null,
        2
      )
    )
  } finally {
    await client.quit()
  }
}

main().catch((err) => {
  console.error('[seed-daily-visitors]', err)
  process.exit(1)
})
