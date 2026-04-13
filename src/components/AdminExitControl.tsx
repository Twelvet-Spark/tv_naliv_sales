import { useEffect, useRef, useState } from 'react'
import SystemButton from './SystemButton'

const HOLD_DURATION_MS = 2800
const HOLD_TICK_MS = 50

type Props = {
  onOpenSettings: () => void
}

export default function AdminExitControl({ onOpenSettings }: Props) {
  const [holdProgress, setHoldProgress] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const holdStartedAtRef = useRef<number | null>(null)
  const holdTimerRef = useRef<number | null>(null)

  const stopHolding = () => {
    if (holdTimerRef.current !== null) {
      window.clearInterval(holdTimerRef.current)
      holdTimerRef.current = null
    }

    holdStartedAtRef.current = null
    setHoldProgress(0)
  }

  const beginHolding = () => {
    if (holdTimerRef.current !== null) return

    holdStartedAtRef.current = Date.now()
    holdTimerRef.current = window.setInterval(() => {
      if (holdStartedAtRef.current === null) return

      const elapsedMs = Date.now() - holdStartedAtRef.current
      const nextProgress = Math.min(1, elapsedMs / HOLD_DURATION_MS)
      setHoldProgress(nextProgress)

      if (nextProgress >= 1) {
        stopHolding()
        setIsDialogOpen(true)
      }
    }, HOLD_TICK_MS)
  }

  useEffect(() => stopHolding, [])

  const progressLabel = holdProgress > 0 ? `Удерживайте для настроек ${Math.round(holdProgress * 100)}%` : 'Удерживайте для настроек'

  return (
    <>
      <button
        type="button"
        className={`admin-exit-trigger ${holdProgress > 0 ? 'is-arming' : ''}`}
        aria-label="Открыть настройки экрана"
        onPointerDown={beginHolding}
        onPointerUp={stopHolding}
        onPointerLeave={stopHolding}
        onPointerCancel={stopHolding}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="admin-exit-label">{progressLabel}</span>
        <span className="admin-exit-bar" aria-hidden>
          <span className="admin-exit-bar-fill" style={{ transform: `scaleX(${holdProgress})` }} />
        </span>
      </button>

      {isDialogOpen && (
        <div className="admin-exit-modal-backdrop" role="presentation">
          <div className="admin-exit-modal glass-surface" role="dialog" aria-modal="true" aria-label="Настройки экрана">
            <p className="app-fatal-eyebrow">Настройки экрана</p>
            <h2 className="admin-exit-title">Открыть конфигурацию этого ТВ?</h2>
            <p className="admin-exit-text">Вы сможете изменить бизнес-токен, количество экранов и номер текущего ТВ.</p>
            <div className="admin-exit-actions">
              <SystemButton variant="secondary" type="button" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </SystemButton>
              <SystemButton
                variant="primary"
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                  onOpenSettings()
                }}
              >
                Открыть настройки
              </SystemButton>
            </div>
          </div>
        </div>
      )}
    </>
  )
}