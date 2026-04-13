import { type FormEvent } from 'react'
import GlassHeader from './GlassHeader'
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
  onSubmit,
  validationMessage,
}: Props) {
  const title = isInitialSetup ? 'Первичная настройка экрана' : 'Подключение экрана'
  const description = isInitialSetup
    ? 'Введите токен и параметры видеостены. После сохранения этот экран сразу начнет показывать свою часть общей ротации.'
    : 'Введите бизнес-токен и параметры видеостены. После сохранения экран начнет автоматически обновлять акции магазина и займет свою позицию в общей ротации.'
  const tokenHint = isInitialSetup
    ? 'Токен сохраняется только на этом устройстве.'
    : 'Токен сохраняется только на устройстве. При кратком сбое сети экран продолжит показывать последние загруженные акции.'
  const screenCountHint = isInitialSetup
    ? 'Сколько экранов участвует в общей ленте.'
    : 'Сколько экранов одновременно показывают одну общую ленту акций.'
  const screenNumberHint = isInitialSetup
    ? 'Позиция текущего экрана в этой связке.'
    : 'Например, для трех экранов выберите 1, 2 или 3.'
  const submitLabel = isInitialSetup ? 'Сохранить и открыть акции' : 'Сохранить и перейти к акциям'

  return (
    <div className={`token-screen ${isInitialSetup ? 'token-screen-initial' : 'token-screen-edit'}`}>
      <GlassHeader className="token-intro">
        <div className="layout-heading">
          <p className="eyebrow">НАЛИВ ТВ</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
        </div>
      </GlassHeader>

      <TokenSurface className="promo-card token-panel">
        <form className="token-form" onSubmit={onSubmit}>
          <TokenInput
            label="Бизнес-токен"
            type="text"
            placeholder="Введите токен"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoFocus={isInitialSetup}
            autoComplete="off"
            hint={tokenHint}
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
              hint={screenCountHint}
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
              hint={screenNumberHint}
            />
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
