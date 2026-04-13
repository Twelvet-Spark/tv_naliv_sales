import { type FormEvent } from 'react'
import GlassHeader from './GlassHeader'
import PrimaryButton from './PrimaryButton'
import TokenInput from './TokenInput'
import TokenSurface from './TokenSurface'

type Props = {
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
  value,
  onChange,
  screenCountValue,
  onScreenCountChange,
  screenNumberValue,
  onScreenNumberChange,
  onSubmit,
  validationMessage,
}: Props) {
  return (
    <div className="token-screen">
      <GlassHeader className="token-intro">
        <div className="layout-heading">
          <p className="eyebrow">НАЛИВ ТВ</p>
          <h1>Подключение экрана</h1>
          <p className="lede">Введите бизнес-токен и параметры видеостены. После сохранения экран начнет автоматически обновлять акции магазина и займет свою позицию в общей ротации.</p>
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
            autoComplete="off"
            hint="Токен сохраняется только на устройстве. При кратком сбое сети экран продолжит показывать последние загруженные акции."
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
              hint="Сколько экранов одновременно показывают одну общую ленту акций."
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
              hint="Например, для трех экранов выберите 1, 2 или 3."
            />
          </div>
          {validationMessage ? <p className="token-error" role="alert">{validationMessage}</p> : null}
          <div className="token-actions">
            <PrimaryButton type="submit">Сохранить и перейти к акциям</PrimaryButton>
          </div>
        </form>
      </TokenSurface>
    </div>
  )
}
