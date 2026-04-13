import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import AppErrorBoundary from './components/AppErrorBoundary'
import TimeDebugPanel from './components/TimeDebugPanel'
import PromotionsPage from './features/promotions/PromotionsPage'
import { getKzThemePalette, resolveKzHour, type DebugMessageMode } from './features/theme/kzTime'
import { useKzThemeMode } from './features/theme/useKzThemeMode'
import TokenPage from './features/token/TokenPage'
import { getInitialToken, persistToken } from './features/token/storage'
import { featureFlags } from './shared/featureFlags'
import { telemetry } from './shared/telemetry'
import './App.css'

const DEBUG_HOUR_STORAGE_KEY = 'tv_naliv_sales:debug-hour'

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
  const envToken = import.meta.env.VITE_TV_BUSINESS_TOKEN ?? ''
  const [token, setToken] = useState(() => getInitialToken(envToken))
  const [debugHour, setDebugHour] = useState<number | null>(() => getInitialDebugHour())
  const [debugMessageMode, setDebugMessageMode] = useState<DebugMessageMode>('auto')
  const [debugRotationPaused, setDebugRotationPaused] = useState(false)
  const [debugTextAnimationMode, setDebugTextAnimationMode] = useState<number | null>(null)
  const [debugPageShift, setDebugPageShift] = useState({ seq: 0, delta: 0 })
  const [debugMessageShift, setDebugMessageShift] = useState(0)
  const navigate = useNavigate()
  const themeMode = useKzThemeMode(debugHour)

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.body.dataset.theme = themeMode
  }, [themeMode])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const applyPalette = () => {
      const palette = getKzThemePalette(resolveKzHour(debugHour))
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
    const intervalId = window.setInterval(applyPalette, 60_000)

    return () => window.clearInterval(intervalId)
  }, [debugHour])

  useEffect(() => {
    if (typeof window === 'undefined' || !featureFlags.debugClock) return

    if (debugHour === null) {
      window.localStorage.setItem(DEBUG_HOUR_STORAGE_KEY, 'auto')
      return
    }

    window.localStorage.setItem(DEBUG_HOUR_STORAGE_KEY, String(debugHour))
  }, [debugHour])

  useEffect(() => {
    telemetry.setContext({
      token: token || null,
      tokenHash: token ? token.slice(0, 6) : null,
    })
  }, [token])

  const handleSaveToken = (next: string) => {
    setToken(next)
    persistToken(next)
  }

  const handleInvalidToken = () => {
    handleSaveToken('')
    navigate('/token')
  }

  const handleShiftPage = (delta: number) => {
    setDebugPageShift((prev) => ({ seq: prev.seq + 1, delta }))
  }

  const handleShiftMessage = () => {
    setDebugMessageShift((prev) => prev + 1)
  }

  return (
    <div className={`app-shell theme-${themeMode}`}>
      <div className="app-ambient app-ambient-a" aria-hidden />
      <div className="app-ambient app-ambient-b" aria-hidden />
      <AppErrorBoundary>
        <Routes>
          <Route path="/token" element={<TokenPage token={token} onSave={handleSaveToken} />} />
          <Route path="/" element={token ? <PromotionsPage key={token} token={token} debugHour={debugHour} debugMessageMode={debugMessageMode} debugRotationPaused={debugRotationPaused} debugTextAnimationMode={debugTextAnimationMode} debugPageShift={debugPageShift} debugMessageShift={debugMessageShift} onInvalidToken={handleInvalidToken} /> : <TokenPage token={token} onSave={handleSaveToken} />} />
          <Route path="*" element={token ? <PromotionsPage key={token} token={token} debugHour={debugHour} debugMessageMode={debugMessageMode} debugRotationPaused={debugRotationPaused} debugTextAnimationMode={debugTextAnimationMode} debugPageShift={debugPageShift} debugMessageShift={debugMessageShift} onInvalidToken={handleInvalidToken} /> : <TokenPage token={token} onSave={handleSaveToken} />} />
        </Routes>
      </AppErrorBoundary>
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
          onPrevPage={() => handleShiftPage(-1)}
          onNextPage={() => handleShiftPage(1)}
          onNextMessage={handleShiftMessage}
        />
      )}
    </div>
  )
}

export default App
