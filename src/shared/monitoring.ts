import * as Sentry from '@sentry/react'
import html2canvas from 'html2canvas'

type MonitoringLevel = 'debug' | 'info' | 'warn' | 'error'

type MonitoringMeta = Record<string, unknown>

type MonitoringContext = {
  token: string | null
  tokenHash: string | null
  businessId: number | null
  businessName: string | null
  businessAddress: string | null
  source: string | null
  promotionsCount: number | null
}

const SENTRY_DSN = 'https://96218a1fe3798667625c3b4178251e6d@o4510957798883328.ingest.us.sentry.io/4511213168427008'
const IMPORTANT_INFO_EVENTS = new Set([
  'screen.visibility.hidden',
  'screen.visibility.resumed',
  'promotions.rotation.hidden_resumed',
  'promotion.image.load_failed',
  'promotions.render.multi_page',
  'promotions.fetch.success',
  'promotions.token.invalid',
])
const SCREENSHOT_THROTTLE_MS = 30_000
const SCREENSHOT_MAX_DATA_URL_LENGTH = 140_000

const monitoringContext: MonitoringContext = {
  token: null,
  tokenHash: null,
  businessId: null,
  businessName: null,
  businessAddress: null,
  source: null,
  promotionsCount: null,
}

let monitoringInitialized = false
let lastScreenshotAt = 0

function toSentryLevel(level: MonitoringLevel): Sentry.SeverityLevel {
  if (level === 'warn') return 'warning'
  if (level === 'error') return 'error'
  if (level === 'info') return 'info'
  return 'debug'
}

function sanitizeValue(value: unknown): unknown {
  if (value == null) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    }
  }
  if (Array.isArray(value)) return value.map(sanitizeValue)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, sanitizeValue(nested)]),
    )
  }
  return String(value)
}

function sanitizeMeta(meta?: MonitoringMeta) {
  if (!meta) return undefined
  return Object.fromEntries(Object.entries(meta).map(([key, value]) => [key, sanitizeValue(value)]))
}

function applyScopeContext(scope: Sentry.Scope) {
  if (monitoringContext.businessId !== null) {
    scope.setTag('business_id', String(monitoringContext.businessId))
  }

  if (monitoringContext.businessName) {
    scope.setTag('business_name', monitoringContext.businessName)
  }

  if (monitoringContext.source) {
    scope.setTag('promotions_source', monitoringContext.source)
  }

  if (monitoringContext.businessId !== null || monitoringContext.businessName) {
    scope.setUser({
      id: monitoringContext.businessId !== null ? String(monitoringContext.businessId) : undefined,
      username: monitoringContext.businessName ?? undefined,
    })
  }

  scope.setContext('tv_runtime', {
    token: monitoringContext.token,
    tokenHash: monitoringContext.tokenHash,
    businessId: monitoringContext.businessId,
    businessName: monitoringContext.businessName,
    businessAddress: monitoringContext.businessAddress,
    source: monitoringContext.source,
    promotionsCount: monitoringContext.promotionsCount,
  })
}

function shouldForwardToSentry(level: MonitoringLevel, event: string) {
  if (level === 'warn' || level === 'error') return true
  return IMPORTANT_INFO_EVENTS.has(event)
}

async function captureScreenImage() {
  if (typeof window === 'undefined' || document.hidden) return null
  const now = Date.now()
  if (now - lastScreenshotAt < SCREENSHOT_THROTTLE_MS) return null

  lastScreenshotAt = now

  const target = document.querySelector('.screen-main') as HTMLElement | null
  if (!target) return null

  const canvas = await html2canvas(target, {
    useCORS: true,
    allowTaint: false,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-base').trim() || '#111111',
    imageTimeout: 4_000,
    logging: false,
    scale: 0.32,
    ignoreElements: (element) => element.classList.contains('time-debug-panel') || element.classList.contains('tech-overlay'),
  })

  const dataUrl = canvas.toDataURL('image/webp', 0.48)
  if (dataUrl.length > SCREENSHOT_MAX_DATA_URL_LENGTH) return null
  return dataUrl
}

export function initMonitoring() {
  if (monitoringInitialized || typeof window === 'undefined') return

  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0.03,
    replaysOnErrorSampleRate: 1,
    tracesSampleRate: 0,
    initialScope: {
      tags: {
        app: 'tv_naliv_sales',
      },
    },
  })

  monitoringInitialized = true
}

export function setMonitoringContext(nextContext: Partial<MonitoringContext>) {
  Object.assign(monitoringContext, nextContext)

  if (!monitoringInitialized) return

  applyScopeContext(Sentry.getGlobalScope())
}

export function captureMonitoringEvent(level: MonitoringLevel, event: string, meta?: MonitoringMeta) {
  if (!monitoringInitialized || !shouldForwardToSentry(level, event)) return

  void (async () => {
    const safeMeta = sanitizeMeta(meta)
    let screenshot: string | null = null

    if (level === 'warn' || level === 'error') {
      try {
        screenshot = await captureScreenImage()
      } catch (error) {
        screenshot = null
        if (error instanceof Error) {
          if (safeMeta) {
            Object.assign(safeMeta, {
              screenshotError: error.message,
            })
          }
        }
      }
    }

    Sentry.withScope((scope) => {
      applyScopeContext(scope)
      scope.setLevel(toSentryLevel(level))
      scope.setTag('telemetry_event', event)

      if (safeMeta) {
        scope.setContext('telemetry_meta', safeMeta)
      }

      if (screenshot) {
        scope.setExtra('screen_capture_webp', screenshot)
      }

      Sentry.captureMessage(event)
    })
  })()
}

export function captureMonitoringException(error: Error, event: string, meta?: MonitoringMeta) {
  if (!monitoringInitialized) return

  void (async () => {
    const safeMeta = sanitizeMeta(meta)
    let screenshot: string | null = null

    try {
      screenshot = await captureScreenImage()
    } catch (captureError) {
      if (captureError instanceof Error) {
        if (safeMeta) {
          Object.assign(safeMeta, {
            screenshotError: captureError.message,
          })
        }
      }
    }

    Sentry.withScope((scope) => {
      applyScopeContext(scope)
      scope.setLevel('error')
      scope.setTag('telemetry_event', event)

      if (safeMeta) {
        scope.setContext('telemetry_meta', safeMeta)
      }

      if (screenshot) {
        scope.setExtra('screen_capture_webp', screenshot)
      }

      Sentry.captureException(error)
    })
  })()
}