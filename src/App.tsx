import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminExitControl from './components/AdminExitControl'
import AppErrorBoundary from './components/AppErrorBoundary'
import TimeDebugPanel, { type BurnInDebugMode } from './components/TimeDebugPanel'
import { grantAdminAccess, hasAdminAccess, revokeAdminAccess } from './features/admin/storage'
import { useViewportDensity } from './features/layout/useViewportDensity'
import PromotionsPage from './features/promotions/PromotionsPage'
import { getInitialTvWallConfig, persistTvWallConfig, type PanelColorMode, type TvWallConfig } from './features/display/storage'
import { getKzThemePalette, resolveKzHour, type DebugMessageMode } from './features/theme/kzTime'
import { useKzThemeMode } from './features/theme/useKzThemeMode'
import TokenPage from './features/token/TokenPage'
import { getInitialToken, persistToken } from './features/token/storage'
import { featureFlags } from './shared/featureFlags'
import { telemetry } from './shared/telemetry'
import './App.css'

const DEBUG_HOUR_STORAGE_KEY = 'tv_naliv_sales:debug-hour'
const PALETTE_REFRESH_INTERVAL_MS = 15_000

const BURN_IN_DEBUG_PRESETS: Record<
  BurnInDebugMode,
  {
    backgroundPrimaryDuration: string
    backgroundSecondaryDuration: string
    contentDuration: string
    overlayDuration: string
    patternOpacity: string
    secondaryOpacity: string
    ambientOpacity: string
    contentDriftScale: string
    overlayDriftScale: string
  }
> = {
  off: {
    backgroundPrimaryDuration: '200s',
    backgroundSecondaryDuration: '240s',
    contentDuration: '260s',
    overlayDuration: '290s',
    patternOpacity: '0.22',
    secondaryOpacity: '0.1',
    ambientOpacity: '0.08',
    contentDriftScale: '1',
    overlayDriftScale: '1',
  },
  slow: {
    backgroundPrimaryDuration: '320s',
    backgroundSecondaryDuration: '380s',
    contentDuration: '420s',
    overlayDuration: '460s',
    patternOpacity: '0.3',
    secondaryOpacity: '0.14',
    ambientOpacity: '0.12',
    contentDriftScale: '1',
    overlayDriftScale: '1',
  },
  normal: {
    backgroundPrimaryDuration: '200s',
    backgroundSecondaryDuration: '240s',
    contentDuration: '260s',
    overlayDuration: '290s',
    patternOpacity: '0.34',
    secondaryOpacity: '0.16',
    ambientOpacity: '0.14',
    contentDriftScale: '1',
    overlayDriftScale: '1',
  },
  fast: {
    backgroundPrimaryDuration: '120s',
    backgroundSecondaryDuration: '150s',
    contentDuration: '170s',
    overlayDuration: '190s',
    patternOpacity: '0.4',
    secondaryOpacity: '0.2',
    ambientOpacity: '0.17',
    contentDriftScale: '1.8',
    overlayDriftScale: '1.6',
  },
  test: {
    backgroundPrimaryDuration: '18s',
    backgroundSecondaryDuration: '22s',
    contentDuration: '24s',
    overlayDuration: '28s',
    patternOpacity: '0.5',
    secondaryOpacity: '0.28',
    ambientOpacity: '0.24',
    contentDriftScale: '5',
    overlayDriftScale: '4',
  },
}

function getInitialDebugHour() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(DEBUG_HOUR_STORAGE_KEY)
  if (!raw || raw === 'auto') return null

  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) {
    return null
  }

  return parsed
}

function App() {
  useViewportDensity()

  const envToken = import.meta.env.VITE_TV_BUSINESS_TOKEN ?? ''
  const [token, setToken] = useState(() => getInitialToken(envToken))
  const [wallConfig, setWallConfig] = useState<TvWallConfig>(() => getInitialTvWallConfig())
  const [previewPanelColorMode, setPreviewPanelColorMode] = useState<PanelColorMode | null>(null)
  const [adminAccessGranted, setAdminAccessGranted] = useState(() => hasAdminAccess())
  const [debugHour, setDebugHour] = useState<number | null>(() => featureFlags.debugClock ? getInitialDebugHour() : null)
  const [debugMessageMode, setDebugMessageMode] = useState<DebugMessageMode>('auto')
  const [debugRotationPaused, setDebugRotationPaused] = useState(false)
  const [debugTextAnimationMode, setDebugTextAnimationMode] = useState<number | null>(null)
  const [burnInMode, setBurnInMode] = useState<BurnInDebugMode>('normal')
  const [debugPageShift, setDebugPageShift] = useState({ seq: 0, delta: 0 })
  const [debugMessageShift, setDebugMessageShift] = useState(0)
  const navigate = useNavigate()
  const themeMode = useKzThemeMode(debugHour)
  const activePanelColorMode = previewPanelColorMode ?? wallConfig.panelColorMode

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.body.dataset.theme = themeMode
  }, [themeMode])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyPalette = () => {
      const palette = getKzThemePalette(resolveKzHour(debugHour), activePanelColorMode)
      const root = document.documentElement

      root.style.setProperty('--bg-base', palette.bgBase)
      root.style.setProperty('--bg-top', palette.bgTop)
      root.style.setProperty('--bg-bottom', palette.bgBottom)
      root.style.setProperty('--accent', palette.accent)
      root.style.setProperty('--accent-soft', palette.accentSoft)
      root.style.setProperty('--surface-panel', palette.surface)
      root.style.setProperty('--surface-strong', palette.surfaceStrong)
      root.style.setProperty('--line', palette.line)
      root.style.setProperty('--text-strong', palette.textStrong)
      root.style.setProperty('--text-main', palette.textMain)
      root.style.setProperty('--text-soft', palette.textSoft)
      root.style.setProperty('--text-muted', palette.textMuted)
      root.style.setProperty('--ambient-primary', palette.ambientPrimary)
      root.style.setProperty('--ambient-secondary', palette.ambientSecondary)
    }

    applyPalette()
    const intervalId = window.setInterval(applyPalette, PALETTE_REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [activePanelColorMode, debugHour])

  useEffect(() => {
    if (typeof window === 'undefined' || !featureFlags.debugClock) return

    if (debugHour === null) {
      window.localStorage.setItem(DEBUG_HOUR_STORAGE_KEY, 'auto')
      return
    }

    window.localStorage.setItem(DEBUG_HOUR_STORAGE_KEY, String(debugHour))
  }, [debugHour])

  useEffect(() => {
    if (typeof window === 'undefined' || featureFlags.debugClock) return

    window.localStorage.removeItem(DEBUG_HOUR_STORAGE_KEY)
  }, [])

  useEffect(() => {
    telemetry.setContext({
      token: token || null,
      tokenHash: token ? token.slice(0, 6) : null,
      tvWallScreenCount: wallConfig.screenCount,
      tvWallScreenIndex: wallConfig.screenIndex + 1,
    })
  }, [token, wallConfig.screenCount, wallConfig.screenIndex])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--ui-scale-factor', String(wallConfig.uiScalePercent / 100))
    root.style.setProperty('--safe-area-size', `${wallConfig.safeAreaPx}px`)
    root.dataset.panelColorMode = activePanelColorMode
  }, [activePanelColorMode, wallConfig.safeAreaPx, wallConfig.uiScalePercent])

  useEffect(() => {
    const root = document.documentElement
    const preset = BURN_IN_DEBUG_PRESETS[burnInMode]

    root.dataset.burnInDebugMode = burnInMode
    root.style.setProperty('--burn-in-bg-primary-duration', preset.backgroundPrimaryDuration)
    root.style.setProperty('--burn-in-bg-secondary-duration', preset.backgroundSecondaryDuration)
    root.style.setProperty('--burn-in-content-duration', preset.contentDuration)
    root.style.setProperty('--burn-in-overlay-duration', preset.overlayDuration)
    root.style.setProperty('--burn-in-pattern-opacity', preset.patternOpacity)
    root.style.setProperty('--burn-in-secondary-opacity', preset.secondaryOpacity)
    root.style.setProperty('--burn-in-ambient-opacity', preset.ambientOpacity)
    root.style.setProperty('--burn-in-content-drift-scale', preset.contentDriftScale)
    root.style.setProperty('--burn-in-overlay-drift-scale', preset.overlayDriftScale)
  }, [burnInMode])

  const handleSaveSetup = (next: string, nextWallConfig: TvWallConfig) => {
    setPreviewPanelColorMode(null)
    setToken(next)
    persistToken(next)
    setWallConfig(nextWallConfig)
    persistTvWallConfig(nextWallConfig)
    revokeAdminAccess()
    setAdminAccessGranted(false)
  }

  const handleInvalidToken = () => {
    handleSaveSetup('', wallConfig)
    navigate('/token')
  }

  const handleShiftPage = (delta: number) => {
    setDebugPageShift((prev) => ({ seq: prev.seq + 1, delta }))
  }

  const handleShiftMessage = () => {
    setDebugMessageShift((prev) => prev + 1)
  }

  const openSettings = () => {
    grantAdminAccess()
    setAdminAccessGranted(true)
    telemetry.info('admin.settings.opened', {
      source: 'hold_to_exit',
    })
    navigate('/token')
  }

  const canEditToken = featureFlags.allowTokenEdit || !token || adminAccessGranted
  const promotionsElement = token ? (
    <PromotionsPage
      key={token}
      token={token}
      wallScreenCount={wallConfig.screenCount}
      wallScreenIndex={wallConfig.screenIndex}
      uiScalePercent={wallConfig.uiScalePercent}
      safeAreaPx={wallConfig.safeAreaPx}
      debugHour={debugHour}
      debugMessageMode={debugMessageMode}
      debugRotationPaused={debugRotationPaused}
      debugTextAnimationMode={debugTextAnimationMode}
      debugPageShift={debugPageShift}
      debugMessageShift={debugMessageShift}
      onInvalidToken={handleInvalidToken}
    />
  ) : (
    <TokenPage token={token} wallConfig={wallConfig} onSave={handleSaveSetup} onPreviewPanelColorModeChange={setPreviewPanelColorMode} />
  )

  return (
    <div className={`app-shell theme-${themeMode}`}>
      <div className="app-ambient app-ambient-a" aria-hidden />
      <div className="app-ambient app-ambient-b" aria-hidden />
      <div className="app-content-layer">
        <AppErrorBoundary>
          <Routes>
            <Route path="/token" element={canEditToken ? <TokenPage token={token} wallConfig={wallConfig} onSave={handleSaveSetup} onPreviewPanelColorModeChange={setPreviewPanelColorMode} /> : <Navigate to="/" replace />} />
            <Route path="/" element={promotionsElement} />
            <Route path="*" element={promotionsElement} />
          </Routes>
        </AppErrorBoundary>
      </div>
      {token && <AdminExitControl onOpenSettings={openSettings} />}
      {featureFlags.debugClock && (
        <TimeDebugPanel
          value={debugHour}
          onChange={setDebugHour}
          messageMode={debugMessageMode}
          onMessageModeChange={setDebugMessageMode}
          isRotationPaused={debugRotationPaused}
          onRotationPausedChange={setDebugRotationPaused}
          textAnimationMode={debugTextAnimationMode}
          onTextAnimationModeChange={setDebugTextAnimationMode}
          burnInMode={burnInMode}
          onBurnInModeChange={setBurnInMode}
          onPrevPage={() => handleShiftPage(-1)}
          onNextPage={() => handleShiftPage(1)}
          onNextMessage={handleShiftMessage}
        />
      )}
    </div>
  )
}

export default App
