import { type FormEvent } from 'react'
import GlassHeader from './GlassHeader'
import PrimaryButton from './PrimaryButton'
import TokenInput from './TokenInput'
import TokenSurface from './TokenSurface'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function TokenScreen({ value, onChange, onSubmit }: Props) {
  return (
    <div className="token-screen">
      <GlassHeader>
        <div className="layout-heading">
          <p className="eyebrow">TV API · NALIV</p>
          <h1>Токен доступа</h1>
          <p className="lede">Введите бизнес-токен для загрузки акций на экран.</p>
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
            hint="Токен сохраняется в localStorage и не отправляется наружу."
          />
          <div className="token-actions">
            <PrimaryButton type="submit">Сохранить и перейти к акциям</PrimaryButton>
          </div>
        </form>
      </TokenSurface>
    </div>
  )
}
