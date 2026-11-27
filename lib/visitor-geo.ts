import { createHash } from 'crypto'

import { kvKeys } from '~/config/kv'
import { getDate } from '~/lib/date'
import { redis } from '~/lib/redis'
import {
  extractPublicIP,
  type HeaderReader,
  isBotUserAgent,
  resolveVisitorDigest,
} from '~/lib/visitor-stats'

const SHANGHAI_TZ = 'Asia/Shanghai'
const GEO_IP_HASH_SALT = 'lmingyul-geo-ip-v1'
const GEO_IP_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60
const GEO_IP_MISS_TTL_SECONDS = 60 * 60
const GEO_SEEN_TTL_SECONDS = 48 * 60 * 60
const GEO_MAX_LOCATIONS = 200
const EXTERNAL_GEO_TIMEOUT_MS = 2000

export type VisitorGeoPoint = {
  key: string
  lat: number
  lng: number
  city: string | null
  country: string
  countryCode: string
  count: number
}

export type VisitorMapResponse = {
  current: VisitorGeoPoint | null
  locations: VisitorGeoPoint[]
  totalLocations: number
  totalVisits: number
}

type ResolvedGeoBase = {
  key: string
  lat: number
  lng: number
  city: string | null
  country: string
  countryCode: string
}

type CachedGeoEntry = ResolvedGeoBase | { miss: true }

const COUNTRY_CENTROIDS: Record<
  string,
  { lat: number; lng: number; name: string }
> = {
  CN: { lat: 35.86, lng: 104.2, name: 'China' },
  HK: { lat: 22.32, lng: 114.17, name: 'Hong Kong' },
  TW: { lat: 23.7, lng: 120.96, name: 'Taiwan' },
  MO: { lat: 22.2, lng: 113.54, name: 'Macao' },
  JP: { lat: 36.2, lng: 138.25, name: 'Japan' },
  KR: { lat: 35.91, lng: 127.77, name: 'South Korea' },
  SG: { lat: 1.35, lng: 103.82, name: 'Singapore' },
  MY: { lat: 4.21, lng: 101.98, name: 'Malaysia' },
  TH: { lat: 15.87, lng: 100.99, name: 'Thailand' },
  VN: { lat: 14.06, lng: 108.28, name: 'Vietnam' },
  ID: { lat: -0.79, lng: 113.92, name: 'Indonesia' },
  PH: { lat: 12.88, lng: 121.77, name: 'Philippines' },
  IN: { lat: 20.59, lng: 78.96, name: 'India' },
  AU: { lat: -25.27, lng: 133.78, name: 'Australia' },
  NZ: { lat: -40.9, lng: 174.89, name: 'New Zealand' },
  US: { lat: 37.09, lng: -95.71, name: 'United States' },
  CA: { lat: 56.13, lng: -106.35, name: 'Canada' },
  MX: { lat: 23.63, lng: -102.55, name: 'Mexico' },
  BR: { lat: -14.24, lng: -51.93, name: 'Brazil' },
  AR: { lat: -38.42, lng: -63.62, name: 'Argentina' },
  CL: { lat: -35.68, lng: -71.54, name: 'Chile' },
  CO: { lat: 4.57, lng: -74.3, name: 'Colombia' },
  GB: { lat: 55.38, lng: -3.44, name: 'United Kingdom' },
  IE: { lat: 53.14, lng: -7.69, name: 'Ireland' },
  FR: { lat: 46.23, lng: 2.21, name: 'France' },
  DE: { lat: 51.17, lng: 10.45, name: 'Germany' },
  NL: { lat: 52.13, lng: 5.29, name: 'Netherlands' },
  BE: { lat: 50.5, lng: 4.47, name: 'Belgium' },
  CH: { lat: 46.82, lng: 8.23, name: 'Switzerland' },
  AT: { lat: 47.52, lng: 14.55, name: 'Austria' },
  IT: { lat: 41.87, lng: 12.57, name: 'Italy' },
  ES: { lat: 40.46, lng: -3.75, name: 'Spain' },
  PT: { lat: 39.4, lng: -8.22, name: 'Portugal' },
  SE: { lat: 60.13, lng: 18.64, name: 'Sweden' },
  NO: { lat: 60.47, lng: 8.47, name: 'Norway' },
  DK: { lat: 56.26, lng: 9.5, name: 'Denmark' },
  FI: { lat: 61.92, lng: 25.75, name: 'Finland' },
  PL: { lat: 51.92, lng: 19.15, name: 'Poland' },
  CZ: { lat: 49.82, lng: 15.47, name: 'Czechia' },
  RO: { lat: 45.94, lng: 24.97, name: 'Romania' },
  GR: { lat: 39.07, lng: 21.82, name: 'Greece' },
  RU: { lat: 61.52, lng: 105.32, name: 'Russia' },
  UA: { lat: 48.38, lng: 31.17, name: 'Ukraine' },
  TR: { lat: 38.96, lng: 35.24, name: 'Turkey' },
  IL: { lat: 31.05, lng: 34.85, name: 'Israel' },
  AE: { lat: 23.42, lng: 53.85, name: 'United Arab Emirates' },
  SA: { lat: 23.89, lng: 45.08, name: 'Saudi Arabia' },
  ZA: { lat: -30.56, lng: 22.94, name: 'South Africa' },
  EG: { lat: 26.82, lng: 30.8, name: 'Egypt' },
  NG: { lat: 9.08, lng: 8.68, name: 'Nigeria' },
  KE: { lat: -0.02, lng: 37.91, name: 'Kenya' },
  PK: { lat: 30.38, lng: 69.35, name: 'Pakistan' },
  BD: { lat: 23.68, lng: 90.36, name: 'Bangladesh' },
  LK: { lat: 7.87, lng: 80.77, name: 'Sri Lanka' },
  NP: { lat: 28.39, lng: 84.12, name: 'Nepal' },
  KZ: { lat: 48.02, lng: 66.92, name: 'Kazakhstan' },
  HU: { lat: 47.16, lng: 19.5, name: 'Hungary' },
  BG: { lat: 42.73, lng: 25.49, name: 'Bulgaria' },
  HR: { lat: 45.1, lng: 15.2, name: 'Croatia' },
  RS: { lat: 44.02, lng: 21.01, name: 'Serbia' },
  SK: { lat: 48.67, lng: 19.7, name: 'Slovakia' },
  EE: { lat: 58.6, lng: 25.01, name: 'Estonia' },
  LV: { lat: 56.88, lng: 24.6, name: 'Latvia' },
  LT: { lat: 55.17, lng: 23.88, name: 'Lithuania' },
  LU: { lat: 49.82, lng: 6.13, name: 'Luxembourg' },
  IS: { lat: 64.96, lng: -19.02, name: 'Iceland' },
  PE: { lat: -9.19, lng: -75.02, name: 'Peru' },
  VE: { lat: 6.42, lng: -66.59, name: 'Venezuela' },
  EC: { lat: -1.83, lng: -78.18, name: 'Ecuador' },
  UY: { lat: -32.52, lng: -55.77, name: 'Uruguay' },
  MA: { lat: 31.79, lng: -7.09, name: 'Morocco' },
  DZ: { lat: 28.03, lng: 1.66, name: 'Algeria' },
  TN: { lat: 33.89, lng: 9.54, name: 'Tunisia' },
  QA: { lat: 25.35, lng: 51.18, name: 'Qatar' },
  KW: { lat: 29.31, lng: 47.48, name: 'Kuwait' },
  OM: { lat: 21.51, lng: 55.92, name: 'Oman' },
  KH: { lat: 12.57, lng: 104.99, name: 'Cambodia' },
  MM: { lat: 21.91, lng: 95.96, name: 'Myanmar' },
  MN: { lat: 46.86, lng: 103.85, name: 'Mongolia' },
}

function roundCoord(n: number): number {
  return Math.round(n * 100) / 100
}

function isValidCoords(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false
  if (lat === 0 && lng === 0) return false
  return true
}

function sanitizeCountryCode(raw: string | null | undefined): string | null {
  const cc = raw?.trim().toUpperCase() ?? ''
  if (!/^[A-Z]{2}$/.test(cc) || cc === 'XX' || cc === 'T1') {
    return null
  }
  return cc
}

function safeDecodeCity(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    return decodeURIComponent(trimmed).trim() || null
  } catch {
    return trimmed
  }
}

function buildBucketKey(countryCode: string, city: string | null): string {
  if (!city) {
    return `${countryCode}:_country`
  }
  const slug = city
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return `${countryCode}:${slug || '_country'}`
}

export function isPublicRoutableIP(ip: string): boolean {
  const clean = ip.trim().toLowerCase().replace(/^::ffff:/, '')
  if (!clean || clean === '::1' || clean === 'localhost') return false

  // IPv6 private / link-local ranges
  if (clean.includes(':')) {
    if (
      clean.startsWith('fe80:') ||
      clean.startsWith('fc') ||
      clean.startsWith('fd') ||
      clean === '::'
    ) {
      return false
    }
    return true
  }

  const parts = clean.split('.').map((p) => Number(p))
  if (
    parts.length !== 4 ||
    parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)
  ) {
    return false
  }

  const a = parts[0]!
  const b = parts[1]!
  if (a === 0 || a === 10 || a === 127) return false
  if (a === 169 && b === 254) return false
  if (a === 172 && b >= 16 && b <= 31) return false
  if (a === 192 && b === 168) return false
  if (a === 100 && b >= 64 && b <= 127) return false
  return true
}

function normalizeGeoBase(input: {
  lat: number
  lng: number
  city: string | null
  country: string
  countryCode: string
}): ResolvedGeoBase | null {
  const cc = sanitizeCountryCode(input.countryCode)
  if (!cc || !isValidCoords(input.lat, input.lng)) {
    return null
  }
  const city = input.city?.trim() ? input.city.trim().slice(0, 64) : null
  const country =
    input.country.trim() || COUNTRY_CENTROIDS[cc]?.name || cc
  return {
    key: buildBucketKey(cc, city),
    lat: roundCoord(input.lat),
    lng: roundCoord(input.lng),
    city,
    country,
    countryCode: cc,
  }
}

function resolveGeoFromCloudflareHeaders(
  reqHeaders: HeaderReader
): ResolvedGeoBase | null {
  const cc = sanitizeCountryCode(reqHeaders.get('cf-ipcountry'))
  const latRaw = reqHeaders.get('cf-iplatitude')
  const lngRaw = reqHeaders.get('cf-iplongitude')
  if (!cc || !latRaw || !lngRaw) {
    return null
  }
  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  const city = safeDecodeCity(reqHeaders.get('cf-ipcity'))
  return normalizeGeoBase({
    lat,
    lng,
    city,
    country: COUNTRY_CENTROIDS[cc]?.name ?? cc,
    countryCode: cc,
  })
}

function resolveGeoFromCountryHeader(
  reqHeaders: HeaderReader
): ResolvedGeoBase | null {
  const cc = sanitizeCountryCode(reqHeaders.get('cf-ipcountry'))
  if (!cc) return null
  const centroid = COUNTRY_CENTROIDS[cc]
  if (!centroid) return null
  return normalizeGeoBase({
    lat: centroid.lat,
    lng: centroid.lng,
    city: null,
    country: centroid.name,
    countryCode: cc,
  })
}

async function fetchIpWhoIs(ip: string): Promise<ResolvedGeoBase | null> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(EXTERNAL_GEO_TIMEOUT_MS),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as {
      success?: boolean
      country?: string
      country_code?: string
      city?: string
      latitude?: number
      longitude?: number
    }
    if (!data?.success) return null
    return normalizeGeoBase({
      lat: Number(data.latitude),
      lng: Number(data.longitude),
      city: typeof data.city === 'string' ? data.city : null,
      country: typeof data.country === 'string' ? data.country : '',
      countryCode:
        typeof data.country_code === 'string' ? data.country_code : '',
    })
  } catch {
    return null
  }
}

async function fetchIpApi(ip: string): Promise<ResolvedGeoBase | null> {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city,lat,lon`,
      {
        signal: AbortSignal.timeout(EXTERNAL_GEO_TIMEOUT_MS),
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      status?: string
      country?: string
      countryCode?: string
      city?: string
      lat?: number
      lon?: number
    }
    if (data?.status !== 'success') return null
    return normalizeGeoBase({
      lat: Number(data.lat),
      lng: Number(data.lon),
      city: typeof data.city === 'string' ? data.city : null,
      country: typeof data.country === 'string' ? data.country : '',
      countryCode:
        typeof data.countryCode === 'string' ? data.countryCode : '',
    })
  } catch {
    return null
  }
}

async function lookupExternalGeoByIP(
  ip: string
): Promise<ResolvedGeoBase | null> {
  if (!isPublicRoutableIP(ip)) {
    return null
  }

  const ipHash = createHash('sha256')
    .update(`${GEO_IP_HASH_SALT}:${ip}`)
    .digest('hex')
    .slice(0, 24)
  const cacheKey = kvKeys.visitorGeoIpCache(ipHash)

  const cached = await redis.get<CachedGeoEntry>(cacheKey)
  if (cached) {
    if ('miss' in cached && cached.miss) {
      return null
    }
    if ('key' in cached && isValidCoords(cached.lat, cached.lng)) {
      return cached
    }
  }

  const resolved = (await fetchIpWhoIs(ip)) ?? (await fetchIpApi(ip))
  if (resolved) {
    await redis.set(cacheKey, resolved, { ex: GEO_IP_CACHE_TTL_SECONDS })
    return resolved
  }

  await redis.set(
    cacheKey,
    { miss: true },
    { ex: GEO_IP_MISS_TTL_SECONDS }
  )
  return null
}

function parseMetaEntry(
  key: string,
  count: number,
  metaJson: string | null
): VisitorGeoPoint | null {
  if (!metaJson) return null
  try {
    const parsed = JSON.parse(metaJson) as Partial<ResolvedGeoBase>
    if (
      typeof parsed.lat !== 'number' ||
      typeof parsed.lng !== 'number' ||
      !isValidCoords(parsed.lat, parsed.lng) ||
      typeof parsed.countryCode !== 'string'
    ) {
      return null
    }
    return {
      key,
      lat: parsed.lat,
      lng: parsed.lng,
      city: typeof parsed.city === 'string' && parsed.city ? parsed.city : null,
      country:
        typeof parsed.country === 'string' && parsed.country
          ? parsed.country
          : parsed.countryCode,
      countryCode: parsed.countryCode,
      count,
    }
  } catch {
    return null
  }
}

export async function resolveAndRecordVisitorMap(
  reqHeaders: HeaderReader
): Promise<VisitorMapResponse> {
  const isBot = isBotUserAgent(reqHeaders.get('user-agent'))
  const publicIP = extractPublicIP(reqHeaders)

  let currentBase: ResolvedGeoBase | null = null
  if (!isBot) {
    currentBase = resolveGeoFromCloudflareHeaders(reqHeaders)
    if (!currentBase && publicIP) {
      currentBase = await lookupExternalGeoByIP(publicIP)
    }
    if (!currentBase) {
      currentBase = resolveGeoFromCountryHeader(reqHeaders)
    }
  }

  let recordedCurrentCount: number | null = null
  if (!isBot && currentBase && (publicIP || resolveGeoFromCloudflareHeaders(reqHeaders))) {
    const ua = reqHeaders.get('user-agent')?.trim() ?? ''
    const visitorDigest =
      resolveVisitorDigest(reqHeaders) ??
      createHash('sha256')
        .update(`${GEO_IP_HASH_SALT}:${publicIP ?? currentBase.key}|${ua}`)
        .digest('hex')
        .slice(0, 16)
    const dayStr = getDate(SHANGHAI_TZ).format('YYYYMMDD')

    const recordRes = await redis.recordVisitorGeoVisit({
      countsKey: kvKeys.visitorGeoCounts,
      metaKey: kvKeys.visitorGeoMeta,
      seenKey: kvKeys.visitorGeoSeen(dayStr),
      bucketKey: currentBase.key,
      metaJson: JSON.stringify(currentBase),
      visitorDigest,
      seenTtlSeconds: GEO_SEEN_TTL_SECONDS,
    })
    if (recordRes) {
      recordedCurrentCount = recordRes.count
    }
  }

  const topData = await redis.getTopVisitorGeoLocations({
    countsKey: kvKeys.visitorGeoCounts,
    metaKey: kvKeys.visitorGeoMeta,
    limit: GEO_MAX_LOCATIONS,
  })

  const locations: VisitorGeoPoint[] = []
  if (topData?.items) {
    for (const item of topData.items) {
      const point = parseMetaEntry(item.key, item.count, item.metaJson)
      if (point) {
        locations.push(point)
      }
    }
  }

  let current: VisitorGeoPoint | null = null
  if (currentBase) {
    const matched = locations.find((loc) => loc.key === currentBase.key)
    const count = Math.max(1, recordedCurrentCount ?? matched?.count ?? 1)
    current = {
      ...currentBase,
      count,
    }
    if (!matched) {
      locations.unshift(current)
    }
  }

  const totalVisits = locations.reduce((sum, item) => sum + item.count, 0)
  const totalLocations = Math.max(topData?.totalLocations ?? 0, locations.length)

  return {
    current,
    locations,
    totalLocations,
    totalVisits,
  }
}
