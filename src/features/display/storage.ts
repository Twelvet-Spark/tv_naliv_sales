export type PanelColorMode = 'high' | 'low'
export type ReducedMotionMode = 'auto' | 'on' | 'off'

export type TvWallConfig = {
  screenCount: number
  screenIndex: number
  uiScalePercent: number
  safeAreaPx: number
  panelColorMode: PanelColorMode
  reducedMotionMode: ReducedMotionMode
}

const STORAGE_KEY = 'tv_wall_config'
const MIN_SCREEN_COUNT = 1
const MAX_SCREEN_COUNT = 12
export const MIN_UI_SCALE_PERCENT = 50
export const MAX_UI_SCALE_PERCENT = 150
export const MIN_SAFE_AREA_PX = 0
export const MAX_SAFE_AREA_PX = 64
export const PANEL_COLOR_MODES: PanelColorMode[] = ['high', 'low']
export const REDUCED_MOTION_MODES: ReducedMotionMode[] = ['auto', 'on', 'off']

function normalizeScreenCount(value: number | null | undefined) {
  if (!Number.isInteger(value)) return 1
  return Math.max(MIN_SCREEN_COUNT, Math.min(MAX_SCREEN_COUNT, value ?? 1))
}

function normalizeScreenIndex(value: number | null | undefined, screenCount: number) {
  if (!Number.isInteger(value)) return 0
  return Math.max(0, Math.min(screenCount - 1, value ?? 0))
}

function normalizeUiScalePercent(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 100
  return Math.max(MIN_UI_SCALE_PERCENT, Math.min(MAX_UI_SCALE_PERCENT, Math.round(value ?? 100)))
}

function normalizeSafeAreaPx(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 0
  return Math.max(MIN_SAFE_AREA_PX, Math.min(MAX_SAFE_AREA_PX, Math.round(value ?? 0)))
}

function normalizePanelColorMode(value: string | null | undefined): PanelColorMode {
  if (value === 'low' || value === 'normal') return 'low'
  return 'high'
}

function normalizeReducedMotionMode(value: string | null | undefined): ReducedMotionMode {
  if (value === 'on' || value === 'off') return value
  return 'auto'
}

export function normalizeTvWallConfig(value?: Partial<TvWallConfig> | null): TvWallConfig {
  const screenCount = normalizeScreenCount(value?.screenCount)
  const screenIndex = normalizeScreenIndex(value?.screenIndex, screenCount)
  const uiScalePercent = normalizeUiScalePercent(value?.uiScalePercent)
  const safeAreaPx = normalizeSafeAreaPx(value?.safeAreaPx)
  const panelColorMode = normalizePanelColorMode(value?.panelColorMode)
  const reducedMotionMode = normalizeReducedMotionMode(value?.reducedMotionMode)

  return {
    screenCount,
    screenIndex,
    uiScalePercent,
    safeAreaPx,
    panelColorMode,
    reducedMotionMode,
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