type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogMeta = Record<string, unknown>

type RuntimeContext = {
  token: string | null
  tokenHash: string | null
  businessId: number | null
  businessName: string | null
  businessAddress: string | null
  source: 'live' | 'cache' | null
  promotionsCount: number | null
}

import { captureMonitoringEvent, captureMonitoringException, setMonitoringContext } from './monitoring.ts'

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function resolveLevel(): LogLevel {
  const raw = import.meta.env.VITE_TV_LOG_LEVEL

  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw
  }

  return import.meta.env.DEV ? 'debug' : 'warn'
}

const currentLevel = resolveLevel()

const runtimeContext: RuntimeContext = {
  token: null,
  tokenHash: null,
  businessId: null,
  businessName: null,
  businessAddress: null,
  source: null,
  promotionsCount: null,
}

function shouldLog(level: LogLevel) {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel]
}

function getTimestamp() {
  return new Date().toISOString()
}

function toPayload(event: string, meta?: LogMeta) {
  return {
    ts: getTimestamp(),
    event,
    context: runtimeContext,
    ...(meta ?? {}),
  }
}

function emit(level: LogLevel, event: string, meta?: LogMeta) {
  if (!shouldLog(level)) return

  const payload = toPayload(event, meta)
  captureMonitoringEvent(level, event, payload)

  if (level === 'error') {
    console.error('[tv-app]', payload)
    return
  }

  if (level === 'warn') {
    console.warn('[tv-app]', payload)
    return
  }

  if (level === 'info') {
    console.info('[tv-app]', payload)
    return
  }

  console.debug('[tv-app]', payload)
}

export const telemetry = {
  setContext(nextContext: Partial<RuntimeContext>) {
    Object.assign(runtimeContext, nextContext)
    setMonitoringContext(runtimeContext)
  },
  debug(event: string, meta?: LogMeta) {
    emit('debug', event, meta)
  },
  info(event: string, meta?: LogMeta) {
    emit('info', event, meta)
  },
  warn(event: string, meta?: LogMeta) {
    emit('warn', event, meta)
  },
  error(event: string, meta?: LogMeta) {
    emit('error', event, meta)
  },
  exception(event: string, error: Error, meta?: LogMeta) {
    const payload = toPayload(event, {
      ...(meta ?? {}),
      message: error.message,
      stack: error.stack,
    })

    if (shouldLog('error')) {
      console.error('[tv-app]', payload)
    }

    captureMonitoringException(error, event, payload)
  },
}
