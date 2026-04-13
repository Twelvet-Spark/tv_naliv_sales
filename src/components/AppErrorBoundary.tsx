import { Component, type ErrorInfo, type ReactNode } from 'react'
import { telemetry } from '../shared/telemetry'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    telemetry.exception('app.crashed', error, {
      componentStack: errorInfo.componentStack,
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <main className="app-fatal" role="alert" aria-live="assertive">
        <div className="app-fatal-card">
          <p className="app-fatal-eyebrow">НАЛИВ ТВ</p>
          <h1 className="app-fatal-title">Ошибка приложения</h1>
          <p className="app-fatal-text">Экран Акций временно недоступен. Обновите страницу или перезапустите устройство.</p>
          <button type="button" className="system-btn system-btn-primary" onClick={this.handleReload}>Перезагрузить экран</button>
        </div>
      </main>
    )
  }
}
