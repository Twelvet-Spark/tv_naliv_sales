export type TvWallConfig = {
  screenCount: number
  screenIndex: number
}

const STORAGE_KEY = 'tv_wall_config'
const MIN_SCREEN_COUNT = 1
const MAX_SCREEN_COUNT = 12

function normalizeScreenCount(value: number | null | undefined) {
  if (!Number.isInteger(value)) return 1
  return Math.max(MIN_SCREEN_COUNT, Math.min(MAX_SCREEN_COUNT, value ?? 1))
}

function normalizeScreenIndex(value: number | null | undefined, screenCount: number) {
  if (!Number.isInteger(value)) return 0
  return Math.max(0, Math.min(screenCount - 1, value ?? 0))
}

export function normalizeTvWallConfig(value?: Partial<TvWallConfig> | null): TvWallConfig {
  const screenCount = normalizeScreenCount(value?.screenCount)
  const screenIndex = normalizeScreenIndex(value?.screenIndex, screenCount)

  return {
    screenCount,
    screenIndex,
  }
}

export function getInitialTvWallConfig() {
  if (typeof window === 'undefined') {
    return normalizeTvWallConfig()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return normalizeTvWallConfig()
  }

  try {
    return normalizeTvWallConfig(JSON.parse(raw) as Partial<TvWallConfig>)
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return normalizeTvWallConfig()
  }
}

export function persistTvWallConfig(config: TvWallConfig) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeTvWallConfig(config)))
}