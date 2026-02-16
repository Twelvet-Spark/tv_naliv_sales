import StatusSurface from './StatusSurface'

type Props = {
  type: 'loading' | 'error' | 'empty'
  message?: string | null
}

export default function StatusState({ type, message }: Props) {
  if (type === 'loading') {
    return (
      <StatusSurface className="state-panel" aria-busy>
        <div className="state-loading-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <p className="state-title">Загрузка акций…</p>
      </StatusSurface>
    )
  }

  if (type === 'error') {
    return (
      <StatusSurface className="state-panel state-error" role="alert">
        <p className="state-title">Не удалось загрузить акции</p>
        <p className="state-text">{message}</p>
        <p className="state-text">Проверьте токен или обновите экран.</p>
      </StatusSurface>
    )
  }

  return (
    <StatusSurface className="state-panel state-empty">
      <p className="state-title">Нет активных акций</p>
      <p className="state-text">Добавьте акции в системе, чтобы отобразить их на ТВ-экране.</p>
    </StatusSurface>
  )
}
