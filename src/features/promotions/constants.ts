export const API_BASE_URL = import.meta.env.VITE_TV_API_URL ?? 'https://njt25.naliv.kz'

export const PROMOTIONS_REFRESH_INTERVAL_MS = 90_000
export const PAGE_ROTATION_INTERVAL_MS = 56_000
export const DETAIL_ROTATION_INTERVAL_MS = 28_000
export const CLIENT_MESSAGE_ROTATION_INTERVAL_MS = 16_000
export const PROGRESS_TICK_INTERVAL_MS = 100
export const STALE_GRACE_PERIOD_MS = 12 * 60 * 60 * 1000

export const PROMOTIONS_CACHE_PREFIX = 'tv_promotions_cache:'
export const PROMOTIONS_CACHE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
export const PROMOTIONS_CACHE_MAX_ENTRIES = 5
