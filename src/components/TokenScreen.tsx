import { type FormEvent } from 'react'
import GlassHeader from './GlassHeader'
import PrimaryButton from './PrimaryButton'
import TokenInput from './TokenInput'
import TokenSurface from './TokenSurface'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  validationMessage?: string | null
}

export default function TokenScreen({ value, onChange, onSubmit, validationMessage }: Props) {
  return (
    <div className="token-screen">
      <GlassHeader>
        <div className="layout-heading">
          <p className="eyebrow">НАЛИВ ТВ</p>
          <h1>Подключение экрана</h1>
          <p className="lede">Введите бизнес-токен. После сохранения экран начнет автоматически обновлять акции магазина.</p>
        </div>
      </GlassHeader>

      <TokenSurface className="promo-card">
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
          {validationMessage ? <p className="token-error" role="alert">{validationMessage}</p> : null}
          <div className="token-actions">
            <PrimaryButton type="submit">Сохранить и перейти к акциям</PrimaryButton>
          </div>
        </form>
      </TokenSurface>
    </div>
  )
}
