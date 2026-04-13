import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../../components/Layout'
import PromoCard from '../../components/PromoCard'
import StatusState from '../../components/StatusState'
import { featureFlags } from '../../shared/featureFlags'
import { telemetry } from '../../shared/telemetry'
import { useRowsPerPage } from '../layout/useRowsPerPage'
import { getKzDayPeriod, resolveKzHour, type DebugMessageMode } from '../theme/kzTime'
import { useKzGreeting } from '../theme/useKzGreeting'
import { CLIENT_MESSAGE_ROTATION_INTERVAL_MS, DETAIL_ROTATION_INTERVAL_MS, PAGE_ROTATION_INTERVAL_MS, PROGRESS_TICK_INTERVAL_MS } from './constants'
import { computeNewPrice, describeDetail, formatDate, formatPrice, formatStaleAge } from './format'
import { isInvalidTokenMessage, usePromotions } from './usePromotions'

const GENERAL_MESSAGES = [
  'Спасибо, что выбираете нас.',
  'Пусть выбор будет приятным и спокойным.',
  'Хорошего настроения и удачного дня.',
  'Рады видеть вас сегодня.',
  'Пусть покупка пройдёт легко и быстро.',
  'Хорошего отдыха и приятных встреч.',
  'Пусть сегодняшний день будет удачным.',
  'Спасибо, что заглянули к нам.',
  'Пусть вечер пройдёт в хорошей компании.',
  'Надеемся, вы найдёте именно то, что искали.',
  'Пусть выбор сегодня порадует вас.',
  'Желаем хорошего настроения.',
  'Пусть покупки будут только приятными.',
  'Пусть у вас будет хороший день.',
  'Берегите хорошее настроение.',
  'Приятного выбора и лёгкого отдыха.',
  'Пусть каждый визит будет удобным.',
  'Мы рады быть частью вашего вечера.',
  'Пусть всё нужное окажется под рукой.',
  'Спасибо за ваш выбор и доверие.',
  'Желаем спокойного и приятного отдыха.',
  'Пусть сегодняшний ритм будет комфортным.',
  'Пусть вечер будет тёплым и уютным.',
  'Заглядывайте к нам чаще.',
  'Пусть у вас будет хороший повод улыбнуться.',
  'Желаем лёгкого выбора и приятных впечатлений.',
  'Пусть день сложится именно так, как нужно.',
  'Спасибо, что вы с нами.',
  'Пусть хороший настрой останется с вами надолго.',
  'Всегда рады вашему визиту.',
]

const PERIOD_MESSAGES = {
  dawn: [
    'Пусть утро начнётся мягко и спокойно.',
    'Добро пожаловать в новое утро.',
    'Пусть день начнётся с хорошего настроя.',
    'Желаем спокойного старта дня.',
  ],
  morning: [
    'Пусть утро будет бодрым и лёгким.',
    'Хорошего начала дня.',
    'Пусть все планы сегодня складываются удачно.',
    'Желаем доброго и спокойного утра.',
  ],
  day: [
    'Пусть день проходит ровно и приятно.',
    'Желаем продуктивного и лёгкого дня.',
    'Пусть середина дня будет удачной.',
    'Хорошего темпа и хорошего настроения.',
  ],
  evening: [
    'Пусть вечер будет спокойным и приятным.',
    'Желаем уютного и тёплого вечера.',
    'Пусть отдых начнётся с хорошего настроения.',
    'Хорошего вечера и приятной компании.',
  ],
  night: [
    'Пусть ночь будет спокойной.',
    'Желаем тихого и комфортного вечера.',
    'Пусть поздний час будет уютным.',
    'Спасибо, что зашли к нам сегодня.',
  ],
} as const

const MESSAGE_ANIMATION_CLASSES = [
  'promo-message-anim-fade',
  'promo-message-anim-rise',
  'promo-message-anim-slide',
  'promo-message-anim-scale',
  'promo-message-anim-soft',
  'promo-message-anim-sweep',
] as const

function resolveCurrentPageState(pageDurationsMs: number[], elapsedCycleMs: number) {
  if (pageDurationsMs.length === 0) {
    return {
      safePageIndex: 0,
      currentPageOffsetMs: 0,
      currentPageDurationMs: PAGE_ROTATION_INTERVAL_MS,
    }
  }

  let cursor = 0

  for (let index = 0; index < pageDurationsMs.length; index += 1) {
    const nextCursor = cursor + pageDurationsMs[index]
    if (elapsedCycleMs < nextCursor || index === pageDurationsMs.length - 1) {
      return {
        safePageIndex: index,
        currentPageOffsetMs: cursor,
        currentPageDurationMs: pageDurationsMs[index],
      }
    }
    cursor = nextCursor
  }

  return {
    safePageIndex: 0,
    currentPageOffsetMs: 0,
    currentPageDurationMs: pageDurationsMs[0],
  }
}

type Props = {
  token: string
  debugHour?: number | null
  debugMessageMode?: DebugMessageMode
  debugRotationPaused?: boolean
  debugTextAnimationMode?: number | null
  debugPageShift?: { seq: number; delta: number }
  debugMessageShift?: number
  onInvalidToken?: () => void
}

export default function PromotionsPage({
  token,
  debugHour = null,
  debugMessageMode = 'auto',
  debugRotationPaused = false,
  debugTextAnimationMode = null,
  debugPageShift = { seq: 0, delta: 0 },
  debugMessageShift = 0,
  onInvalidToken,
}: Props) {
  const { status, data, businessId, businessName, businessAddress, error, isStale, staleSince, source } = usePromotions(token)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [rotationAnchorMs, setRotationAnchorMs] = useState(() => Date.now())
  const [messageAnchorMs, setMessageAnchorMs] = useState(() => Date.now())
  const [pausedNowMs, setPausedNowMs] = useState<number | null>(null)
  const [isAutoPaused, setIsAutoPaused] = useState(() => typeof document !== 'undefined' ? document.hidden : false)
  const invalidNotified = useRef(false)
  const rotationAnchorMsRef = useRef(nowMs)
  const messageAnchorMsRef = useRef(nowMs)
  const rotationPausedAtMsRef = useRef<number | null>(null)
  const pauseReasonRef = useRef<'hidden' | 'debug' | null>(null)
  const hiddenStartedAtMsRef = useRef<number | null>(null)
  const rowsPerPage = useRowsPerPage()
  const greeting = useKzGreeting(debugHour)
  const dayPeriod = useMemo(() => getKzDayPeriod(resolveKzHour(debugHour)), [debugHour])
  const isRotationPaused = debugRotationPaused || isAutoPaused
  const staleAgeLabel = useMemo(() => {
    if (!staleSince) return null
    return formatStaleAge(staleSince)
  }, [staleSince])
  const shopLabel = useMemo(() => {
    const parts = [businessName, businessAddress].filter((part): part is string => Boolean(part && part.trim()))
    return parts.length > 0 ? parts.join(' · ') : null
  }, [businessAddress, businessName])

  useEffect(() => {
    telemetry.setContext({
      businessId,
      businessName,
      businessAddress,
      source,
      promotionsCount: data.length,
    })
  }, [businessAddress, businessId, businessName, data.length, source])

  useEffect(() => {
    invalidNotified.current = false
  }, [token])

  useEffect(() => {
    if (typeof document !== 'undefined' && document.hidden) {
      hiddenStartedAtMsRef.current = Date.now()
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (isRotationPaused) return
      setNowMs(Date.now())
    }, PROGRESS_TICK_INTERVAL_MS)

    const handleVisibilityChange = () => {
      const currentNow = Date.now()

      if (document.hidden) {
        hiddenStartedAtMsRef.current = currentNow
        setIsAutoPaused(true)
        setNowMs(currentNow)
        telemetry.info('screen.visibility.hidden', {
          source,
          promotionsCount: data.length,
        })
        return
      }

      const hiddenDurationMs = hiddenStartedAtMsRef.current ? Math.max(0, currentNow - hiddenStartedAtMsRef.current) : 0
      hiddenStartedAtMsRef.current = null
      setIsAutoPaused(false)
      setNowMs(currentNow)
      telemetry.info('screen.visibility.resumed', {
        hiddenDurationMs,
        source,
      })
    }

    const handleFocus = () => {
      const currentNow = Date.now()
      if (!document.hidden) {
        hiddenStartedAtMsRef.current = null
        setIsAutoPaused(false)
      }
      setNowMs(currentNow)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [data.length, isRotationPaused, source])

  const rotationSignature = useMemo(() => data.map((promotion) => promotion.marketing_promotion_id).join(':'), [data])

  useEffect(() => {
    rotationAnchorMsRef.current = Date.now()
    const timeoutId = window.setTimeout(() => setRotationAnchorMs(rotationAnchorMsRef.current), 0)

    return () => window.clearTimeout(timeoutId)
  }, [rotationSignature, token])

  useEffect(() => {
    if (status === 'error' && error && !invalidNotified.current) {
      if (isInvalidTokenMessage(error)) {
        invalidNotified.current = true
        onInvalidToken?.()
      }
    }
  }, [status, error, onInvalidToken])

  useEffect(() => {
    if (rotationPausedAtMsRef.current !== null || !isRotationPaused) return
    rotationPausedAtMsRef.current = Date.now()
    pauseReasonRef.current = isAutoPaused ? 'hidden' : 'debug'
    const timeoutId = window.setTimeout(() => setPausedNowMs(rotationPausedAtMsRef.current), 0)

    return () => window.clearTimeout(timeoutId)
  }, [isAutoPaused, isRotationPaused])

  useEffect(() => {
    if (isRotationPaused || rotationPausedAtMsRef.current === null) return

    const pausedDurationMs = Date.now() - rotationPausedAtMsRef.current
    rotationAnchorMsRef.current += pausedDurationMs
    messageAnchorMsRef.current += pausedDurationMs

    if (pauseReasonRef.current === 'hidden') {
      telemetry.info('promotions.rotation.hidden_resumed', {
        pausedDurationMs,
        businessId,
        source,
      })
    }

    rotationPausedAtMsRef.current = null
    pauseReasonRef.current = null
    const timeoutId = window.setTimeout(() => {
      setRotationAnchorMs(rotationAnchorMsRef.current)
      setMessageAnchorMs(messageAnchorMsRef.current)
      setPausedNowMs(null)
      setNowMs(Date.now())
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [businessId, isRotationPaused, source])

  const effectiveNowMs = pausedNowMs ?? nowMs

  const activeMessages = useMemo(() => {
    if (debugMessageMode === 'general') {
      return GENERAL_MESSAGES
    }

    const activePeriod = debugMessageMode === 'auto' ? dayPeriod : debugMessageMode
    return [...PERIOD_MESSAGES[activePeriod], ...GENERAL_MESSAGES]
  }, [dayPeriod, debugMessageMode])

  const messageSignature = useMemo(() => activeMessages.join('|'), [activeMessages])

  useEffect(() => {
    messageAnchorMsRef.current = Date.now()
    const timeoutId = window.setTimeout(() => setMessageAnchorMs(messageAnchorMsRef.current), 0)

    return () => window.clearTimeout(timeoutId)
  }, [messageSignature])

  const pageDurationsMs = useMemo(
    () => data.map((promotion) => Math.max(PAGE_ROTATION_INTERVAL_MS, Math.ceil(promotion.details.length / rowsPerPage) * DETAIL_ROTATION_INTERVAL_MS)),
    [data, rowsPerPage],
  )
  const rotationCycleDurationMs = useMemo(
    () => pageDurationsMs.reduce((total, duration) => total + duration, 0),
    [pageDurationsMs],
  )

  useEffect(() => {
    if (debugMessageShift === 0) return
    messageAnchorMsRef.current -= CLIENT_MESSAGE_ROTATION_INTERVAL_MS
    const timeoutId = window.setTimeout(() => setMessageAnchorMs(messageAnchorMsRef.current), 0)

    return () => window.clearTimeout(timeoutId)
  }, [debugMessageShift])

  const elapsedPageMs = Math.max(0, effectiveNowMs - rotationAnchorMs)
  const elapsedCycleMs = rotationCycleDurationMs > 0 ? elapsedPageMs % rotationCycleDurationMs : 0
  const currentPageState = resolveCurrentPageState(pageDurationsMs, elapsedCycleMs)

  const { safePageIndex, currentPageOffsetMs, currentPageDurationMs } = currentPageState

  useEffect(() => {
    if (debugPageShift.seq === 0) return
    rotationAnchorMsRef.current -= debugPageShift.delta * currentPageDurationMs
    const timeoutId = window.setTimeout(() => setRotationAnchorMs(rotationAnchorMsRef.current), 0)

    return () => window.clearTimeout(timeoutId)
  }, [currentPageDurationMs, debugPageShift])

  const currentPromotion = data[safePageIndex] ?? null
  const detailPageCount = currentPromotion ? Math.max(1, Math.ceil(currentPromotion.details.length / rowsPerPage)) : 1
  const completedCycles = rotationCycleDurationMs > 0 ? Math.floor(elapsedPageMs / rotationCycleDurationMs) : 0
  const pageStartMs = rotationAnchorMs + completedCycles * rotationCycleDurationMs + currentPageOffsetMs
  const detailPageElapsedMs = detailPageCount > 1 ? Math.max(0, effectiveNowMs - pageStartMs) % DETAIL_ROTATION_INTERVAL_MS : 0
  const elapsedMessageMs = Math.max(0, effectiveNowMs - messageAnchorMs)
  const footerMessageIndex = activeMessages.length > 0 ? Math.floor(elapsedMessageMs / CLIENT_MESSAGE_ROTATION_INTERVAL_MS) % activeMessages.length : 0
  const footerMessageAnimation = MESSAGE_ANIMATION_CLASSES[debugTextAnimationMode ?? (footerMessageIndex % MESSAGE_ANIMATION_CLASSES.length)]

  useEffect(() => {
    if (!currentPromotion || detailPageCount <= 1) return

    telemetry.info('promotions.render.multi_page', {
      promotionId: currentPromotion.marketing_promotion_id,
      detailCount: currentPromotion.details.length,
      detailPageCount,
      rowsPerPage,
    })
  }, [currentPromotion, detailPageCount, rowsPerPage])

  return (
    <Layout hideHeader>
      <div className="screen-grid no-sidebar promo-display">
        <div className="screen-main">
          {status === 'loading' && <StatusState type="loading" />}
          {status === 'error' && <StatusState type="error" message={error} />}
          {status === 'offline' && <StatusState type="offline" message={error} />}
          {status === 'success' && data.length === 0 && <StatusState type="empty" />}

          {status === 'success' && data.length > 0 && currentPromotion && (
            <PromoCard
              key={`${currentPromotion.marketing_promotion_id}-${rowsPerPage}`}
              promotion={currentPromotion}
              rowsPerPage={rowsPerPage}
              detailDurationMs={DETAIL_ROTATION_INTERVAL_MS}
              detailPageCount={detailPageCount}
              promoIndex={safePageIndex}
              promoCount={data.length}
              ringDurationMs={detailPageCount > 1 ? DETAIL_ROTATION_INTERVAL_MS : currentPageDurationMs}
              ringElapsedMs={detailPageCount > 1 ? detailPageElapsedMs : Math.max(0, elapsedCycleMs - currentPageOffsetMs)}
              isRotationPaused={isRotationPaused}
              pageStartedAtMs={pageStartMs}
              nowMs={effectiveNowMs}
              describeDetail={describeDetail}
              formatPrice={formatPrice}
              computeNewPrice={computeNewPrice}
              formatDate={formatDate}
            />
          )}

          {status === 'success' && data.length > 0 && (
            <div className="promo-footer">
              <div className="promo-footer-copy">
                <span className="promo-greeting">{greeting}</span>
                <span className={`promo-message ${footerMessageAnimation}`} key={`${dayPeriod}-${footerMessageIndex}-${debugTextAnimationMode ?? 'auto'}`}>
                  {activeMessages[footerMessageIndex]}
                </span>
              </div>
            </div>
          )}
        </div>

        {(status === 'success' || status === 'offline') && featureFlags.richUi && (
          <div className="tech-overlay" aria-hidden>
            <span className={`tech-dot ${source === 'live' ? 'tech-dot-live' : ''}`} />
            <span>{source === 'live' ? 'онлайн' : 'кэш'}</span>
            {shopLabel && <span className="tech-divider">·</span>}
            {shopLabel && <span className="tech-location">{shopLabel}</span>}
            {isStale && staleAgeLabel && <span>· {staleAgeLabel}</span>}
          </div>
        )}
      </div>
    </Layout>
  )
}
