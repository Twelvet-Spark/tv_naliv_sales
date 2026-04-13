import { type FormEvent } from 'react'
import { useViewportMetrics } from '../features/layout/useViewportMetrics'
import PrimaryButton from './PrimaryButton'
import TokenInput from './TokenInput'
import TokenSurface from './TokenSurface'

type Props = {
  isInitialSetup?: boolean
  value: string
  onChange: (value: string) => void
  screenCountValue: string
  onScreenCountChange: (value: string) => void
  screenNumberValue: string
  onScreenNumberChange: (value: string) => void
  uiScaleValue: string
  onUiScaleChange: (value: string) => void
  safeAreaValue: string
  onSafeAreaChange: (value: string) => void
  panelColorModeValue: 'high' | 'low'
  onPanelColorModeChange: (value: 'high' | 'low') => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  validationMessage?: string | null
}

export default function TokenScreen({
  isInitialSetup = false,
  value,
  onChange,
  screenCountValue,
  onScreenCountChange,
  screenNumberValue,
  onScreenNumberChange,
  uiScaleValue,
  onUiScaleChange,
  safeAreaValue,
  onSafeAreaChange,
  panelColorModeValue,
  onPanelColorModeChange,
  onSubmit,
  validationMessage,
}: Props) {
  const metrics = useViewportMetrics()
  const title = isInitialSetup ? 'Настройка экрана' : 'Настройки экрана'
  const submitLabel = isInitialSetup ? 'Сохранить' : 'Применить'

  return (
    <div className={`token-screen ${isInitialSetup ? 'token-screen-initial' : 'token-screen-edit'}`}>
      <TokenSurface className="promo-card token-panel">
        <div className="token-toolbar">
          <div className="token-title-block">
            <p className="eyebrow">НАЛИВ ТВ</p>
            <h1>{title}</h1>
          </div>
          {metrics ? (
            <div className="token-device-meta" aria-label="Параметры экрана и браузера">
              <div className="token-device-pill">
                <span className="token-device-label">Браузер</span>
                <strong className="token-device-value">{metrics.viewportWidth}x{metrics.viewportHeight}</strong>
              </div>
              <div className="token-device-pill">
                <span className="token-device-label">Панель</span>
                <strong className="token-device-value">{metrics.panelWidth}x{metrics.panelHeight}</strong>
              </div>
              <div className="token-device-pill">
                <span className="token-device-label">Доступно</span>
                <strong className="token-device-value">{metrics.availableWidth}x{metrics.availableHeight}</strong>
              </div>
              <div className="token-device-pill">
                <span className="token-device-label">Масштаб</span>
                <strong className="token-device-value">{metrics.devicePixelRatio} · {metrics.density}</strong>
              </div>
            </div>
          ) : null}
        </div>
        <form className="token-form" onSubmit={onSubmit}>
          <TokenInput
            label="Бизнес-токен"
            type="text"
            placeholder="Введите токен"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoFocus={isInitialSetup}
            autoComplete="off"
          />
          <div className="token-config-grid">
            <TokenInput
              label="Количество ТВ"
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              placeholder="1"
              value={screenCountValue}
              onChange={(event) => onScreenCountChange(event.target.value)}
            />
            <TokenInput
              label="Номер этого ТВ"
              type="number"
              inputMode="numeric"
              min={1}
              max={12}
              placeholder="1"
              value={screenNumberValue}
              onChange={(event) => onScreenNumberChange(event.target.value)}
            />
            <TokenInput
              label="Масштаб UI, %"
              type="number"
              inputMode="numeric"
              min={50}
              max={150}
              step={1}
              placeholder="100"
              value={uiScaleValue}
              onChange={(event) => onUiScaleChange(event.target.value)}
            />
            <TokenInput
              label="Безопасная рамка, px"
              type="number"
              inputMode="numeric"
              min={0}
              max={64}
              step={1}
              placeholder="0"
              value={safeAreaValue}
              onChange={(event) => onSafeAreaChange(event.target.value)}
            />
            <label className="glass-input-field token-select-field">
              <span className="token-input-label">Контраст</span>
              <select
                className="glass-input token-select"
                value={panelColorModeValue}
                onChange={(event) => onPanelColorModeChange(event.target.value === 'low' ? 'low' : 'high')}
              >
                <option value="high">Высокий</option>
                <option value="low">Низкий</option>
              </select>
            </label>
          </div>
          {validationMessage ? <p className="token-error" role="alert">{validationMessage}</p> : null}
          <div className="token-actions">
            <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
          </div>
        </form>
      </TokenSurface>
    </div>
  )
}
