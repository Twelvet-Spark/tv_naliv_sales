import {
  PROMOTIONS_CACHE_MAX_ENTRIES,
  PROMOTIONS_CACHE_PREFIX,
  PROMOTIONS_CACHE_RETENTION_MS,
} from './constants'
import type { CachedPromotionsState, UsePromotionsState } from './types'
import { telemetry } from '../../shared/telemetry'

export type CachedPromotionsPayload = Pick<UsePromotionsState, 'businessId' | 'businessName' | 'businessAddress' | 'count' | 'updatedAt' | 'data'>

function getPromotionsCacheKey(token: string) {
  return `${PROMOTIONS_CACHE_PREFIX}${token}`
}

type CacheEntry = {
  key: string
  updatedAtMs: number
}

function parseCacheEntry(raw: string | null): CachedPromotionsState | null {
  if (!raw) return null

  const parsed = JSON.parse(raw) as CachedPromotionsState
  if (!Array.isArray(parsed.data)) return null
  return parsed
}

function toTimestamp(value: string | null | undefined) {
  if (!value) return 0
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function collectCacheEntries() {
  if (typeof window === 'undefined') return [] as CacheEntry[]

  const entries: CacheEntry[] = []

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index)
    if (!key || !key.startsWith(PROMOTIONS_CACHE_PREFIX)) continue

    try {
      const parsed = parseCacheEntry(window.localStorage.getItem(key))
      if (!parsed) {
        window.localStorage.removeItem(key)
        telemetry.warn('cache.entry.invalid', { key })
        continue
      }

      entries.push({
        key,
        updatedAtMs: toTimestamp(parsed.updatedAt),
      })
    } catch {
      window.localStorage.removeItem(key)
      telemetry.warn('cache.entry.corrupted', { key })
    }
  }

  return entries
}

function cleanupPromotionsCache(activeToken: string) {
  if (typeof window === 'undefined') return

  const activeKey = getPromotionsCacheKey(activeToken)
  const now = Date.now()
  let removedByAge = 0
  let removedByLimit = 0

  const allEntries = collectCacheEntries()
  const keptAfterAgeFilter: CacheEntry[] = []

  for (const entry of allEntries) {
    const isActiveEntry = entry.key === activeKey
    const isExpired = entry.updatedAtMs > 0 && now - entry.updatedAtMs > PROMOTIONS_CACHE_RETENTION_MS

    if (isExpired && !isActiveEntry) {
      window.localStorage.removeItem(entry.key)
      removedByAge += 1
      continue
    }

    keptAfterAgeFilter.push(entry)
  }

  if (keptAfterAgeFilter.length > PROMOTIONS_CACHE_MAX_ENTRIES) {
    const sorted = [...keptAfterAgeFilter].sort((a, b) => b.updatedAtMs - a.updatedAtMs)
    const keep = new Set<string>()

    if (sorted.some((entry) => entry.key === activeKey)) {
      keep.add(activeKey)
    }

    for (const entry of sorted) {
      if (keep.size >= PROMOTIONS_CACHE_MAX_ENTRIES) break
      keep.add(entry.key)
    }

    for (const entry of keptAfterAgeFilter) {
      if (!keep.has(entry.key)) {
        window.localStorage.removeItem(entry.key)
        removedByLimit += 1
      }
    }
  }

  if (removedByAge > 0 || removedByLimit > 0) {
    telemetry.info('cache.cleanup.completed', {
      removedByAge,
      removedByLimit,
      maxEntries: PROMOTIONS_CACHE_MAX_ENTRIES,
      retentionMs: PROMOTIONS_CACHE_RETENTION_MS,
      tokenHash: activeToken.slice(0, 6),
    })
  }
}

export function readCachedPromotions(token: string) {
  if (typeof window === 'undefined') return null

  try {
    const cached = window.localStorage.getItem(getPromotionsCacheKey(token))
    if (!cached) {
      telemetry.debug('cache.miss', { tokenHash: token.slice(0, 6) })
      return null
    }

    const parsed = JSON.parse(cached) as CachedPromotionsState
    if (!Array.isArray(parsed.data)) return null

    const parsedDate = parsed.updatedAt ? new Date(parsed.updatedAt) : null
    const updatedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null

    const payload = {
      businessId: parsed.businessId ?? null,
      businessName: parsed.businessName ?? null,
      businessAddress: parsed.businessAddress ?? null,
      count: parsed.count ?? parsed.data.length,
      updatedAt,
      data: parsed.data,
    }

    telemetry.info('cache.hit', {
      tokenHash: token.slice(0, 6),
      count: payload.count,
      updatedAt: payload.updatedAt?.toISOString() ?? null,
    })

    return payload
  } catch {
    window.localStorage.removeItem(getPromotionsCacheKey(token))
    telemetry.warn('cache.corrupted', { tokenHash: token.slice(0, 6) })
    return null
  }
}

export function writeCachedPromotions(token: string, payload: CachedPromotionsPayload) {
  if (typeof window === 'undefined') return false

  const serialized: CachedPromotionsState = {
    version: 1,
    businessId: payload.businessId,
    businessName: payload.businessName,
    businessAddress: payload.businessAddress,
    count: payload.count,
    updatedAt: payload.updatedAt?.toISOString() ?? null,
    data: payload.data,
  }

  try {
    window.localStorage.setItem(getPromotionsCacheKey(token), JSON.stringify(serialized))
    cleanupPromotionsCache(token)
    telemetry.debug('cache.write.ok', {
      tokenHash: token.slice(0, 6),
      count: payload.count,
      updatedAt: payload.updatedAt?.toISOString() ?? null,
    })
    return true
  } catch {
    cleanupPromotionsCache(token)

    try {
      window.localStorage.setItem(getPromotionsCacheKey(token), JSON.stringify(serialized))
      telemetry.warn('cache.write.retry_ok', {
        tokenHash: token.slice(0, 6),
        count: payload.count,
      })
      return true
    } catch {
      telemetry.warn('cache.write.retry_failed', {
        tokenHash: token.slice(0, 6),
        count: payload.count,
      })
    }

    telemetry.warn('cache.write.failed', {
      tokenHash: token.slice(0, 6),
      count: payload.count,
    })
    return false
  }
}
