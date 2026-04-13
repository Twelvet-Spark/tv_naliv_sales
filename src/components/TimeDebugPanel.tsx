import { DEBUG_TIME_PRESETS, type DebugMessageMode } from '../features/theme/kzTime'

const MESSAGE_MODE_OPTIONS: Array<{ label: string; value: DebugMessageMode }> = [
  { label: 'Авто', value: 'auto' },
  { label: 'Общие', value: 'general' },
  { label: 'Рассвет', value: 'dawn' },
  { label: 'Утро', value: 'morning' },
  { label: 'День', value: 'day' },
  { label: 'Вечер', value: 'evening' },
  { label: 'Ночь', value: 'night' },
]

const ANIMATION_OPTIONS = ['Авто', '1', '2', '3', '4', '5', '6'] as const

type Props = {
  value: number | null
  onChange: (value: number | null) => void
  messageMode: DebugMessageMode
  onMessageModeChange: (value: DebugMessageMode) => void
  isRotationPaused: boolean
  onRotationPausedChange: (value: boolean) => void
  textAnimationMode: number | null
  onTextAnimationModeChange: (value: number | null) => void
  onPrevPage: () => void
  onNextPage: () => void
  onNextMessage: () => void
}

export default function TimeDebugPanel({
  value,
  onChange,
  messageMode,
  onMessageModeChange,
  isRotationPaused,
  onRotationPausedChange,
  textAnimationMode,
  onTextAnimationModeChange,
  onPrevPage,
  onNextPage,
  onNextMessage,
}: Props) {
  return (
    <div className="time-debug-panel" role="group" aria-label="Отладка времени темы">
      <div className="time-debug-group">
        <span className="time-debug-label">Время</span>
        <div className="time-debug-buttons">
          {DEBUG_TIME_PRESETS.map((preset) => {
            const isActive = preset.hour === value
            return (
              <button
                key={preset.label}
                type="button"
                className={`time-debug-button ${isActive ? 'is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() => onChange(preset.hour)}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="time-debug-group">
        <span className="time-debug-label">Тексты</span>
        <div className="time-debug-buttons">
          {MESSAGE_MODE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`time-debug-button ${messageMode === option.value ? 'is-active' : ''}`}
              aria-pressed={messageMode === option.value}
              onClick={() => onMessageModeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="time-debug-group">
        <span className="time-debug-label">Анимация текста</span>
        <div className="time-debug-buttons">
          {ANIMATION_OPTIONS.map((label, index) => {
            const optionValue = index === 0 ? null : index - 1
            const isActive = textAnimationMode === optionValue
            return (
              <button
                key={label}
                type="button"
                className={`time-debug-button ${isActive ? 'is-active' : ''}`}
                aria-pressed={isActive}
                onClick={() => onTextAnimationModeChange(optionValue)}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="time-debug-group">
        <span className="time-debug-label">Ротация</span>
        <div className="time-debug-buttons">
          <button
            type="button"
            className={`time-debug-button ${isRotationPaused ? 'is-active' : ''}`}
            aria-pressed={isRotationPaused}
            onClick={() => onRotationPausedChange(!isRotationPaused)}
          >
            {isRotationPaused ? 'Пауза' : 'Авто'}
          </button>
          <button type="button" className="time-debug-button" onClick={onPrevPage}>Назад</button>
          <button type="button" className="time-debug-button" onClick={onNextPage}>Вперёд</button>
          <button type="button" className="time-debug-button" onClick={onNextMessage}>Следующий текст</button>
        </div>
      </div>
    </div>
  )
}