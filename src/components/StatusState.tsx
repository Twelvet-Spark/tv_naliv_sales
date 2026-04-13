import StatusSurface from './StatusSurface'

type Props = {
  type: 'loading' | 'error' | 'empty' | 'offline'
  message?: string | null
}

export default function StatusState({ type, message }: Props) {
  if (type === 'loading') {
    return (
      <StatusSurface className="state-panel" aria-live="polite" aria-busy>
        <div className="state-loading-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <p className="state-title">Синхронизируем акции</p>
        <p className="state-text">Экран подключается к серверу и обновляет витрину магазина.</p>
      </StatusSurface>
    )
  }

  if (type === 'error') {
    return (
      <StatusSurface className="state-panel state-error" role="alert" aria-live="assertive">
        <p className="state-title">Не удалось загрузить акции</p>
        <p className="state-text">{message}</p>
        <p className="state-text">Проверьте токен, интернет на smart box и доступность API.</p>
      </StatusSurface>
    )
  }

  if (type === 'offline') {
    return (
      <StatusSurface className="state-panel state-offline" role="alert" aria-live="assertive">
        <p className="state-title">Экран в офлайн-режиме</p>
        <p className="state-text">Последние акции устарели более 12 часов, поэтому отображение приостановлено.</p>
        <p className="state-text">{message ?? 'Проверьте подключение к интернету и доступность API.'}</p>
      </StatusSurface>
    )
  }

  return (
    <StatusSurface className="state-panel state-empty" aria-live="polite">
      <p className="state-title">Нет активных акций для показа</p>
      <p className="state-text">Добавьте или активируйте промо-кампании в системе, чтобы вывести их на ТВ-экран.</p>
    </StatusSurface>
  )
}
