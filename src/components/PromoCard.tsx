import { useMemo } from 'react'
import PromoTable from './PromoTable'
import { getPromotionPresentation } from '../features/promotions/format'
import type { Promotion, PromotionDetail } from '../features/promotions/types'

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 19
const DETAIL_EXIT_WINDOW_MS = 1300
const RING_HIDDEN_HEAD_PROGRESS = 0.05
const RING_FADE_IN_END_PROGRESS = 0.14
const RING_FADE_OUT_START_PROGRESS = 0.86
const RING_HIDDEN_TAIL_PROGRESS = 0.97

function resolveRingOpacity(progress: number) {
  if (progress <= RING_HIDDEN_HEAD_PROGRESS || progress >= RING_HIDDEN_TAIL_PROGRESS) {
    return 0
  }

  if (progress < RING_FADE_IN_END_PROGRESS) {
    return (progress - RING_HIDDEN_HEAD_PROGRESS) / (RING_FADE_IN_END_PROGRESS - RING_HIDDEN_HEAD_PROGRESS)
  }

  if (progress > RING_FADE_OUT_START_PROGRESS) {
    return (RING_HIDDEN_TAIL_PROGRESS - progress) / (RING_HIDDEN_TAIL_PROGRESS - RING_FADE_OUT_START_PROGRESS)
  }

  return 1
}

type Props = {
  promotion: Promotion
  rowsPerPage: number
  detailDurationMs: number
  detailPageCount: number
  forcedDetailPageIndex?: number | null
  visibleDetailsOverride?: PromotionDetail[] | null
  promoIndex: number
  promoCount: number
  showProgressIndicator: boolean
  progressIndex: number
  progressTotal: number
  ringDurationMs: number
  ringElapsedMs: number
  isRotationPaused: boolean
  pageStartedAtMs: number
  nowMs: number
  describeDetail: (detail: PromotionDetail) => string
  formatPrice: (value: number | null) => string
  computeNewPrice: (detail: PromotionDetail) => number | null
  formatDate: (value: string) => string
}

export default function PromoCard({
  promotion,
  rowsPerPage,
  detailDurationMs,
  detailPageCount,
  forcedDetailPageIndex = null,
  visibleDetailsOverride = null,
  promoIndex,
  promoCount,
  showProgressIndicator,
  progressIndex,
  progressTotal,
  ringDurationMs,
  ringElapsedMs,
  isRotationPaused,
  pageStartedAtMs,
  nowMs,
  describeDetail,
  formatPrice,
  computeNewPrice,
  formatDate,
}: Props) {
  const detailPageIndex = useMemo(() => {
    if (forcedDetailPageIndex !== null) {
      return Math.max(0, Math.min(detailPageCount - 1, forcedDetailPageIndex))
    }

    if (detailPageCount <= 1) return 0
    return Math.floor(Math.max(0, nowMs - pageStartedAtMs) / detailDurationMs) % detailPageCount
  }, [detailDurationMs, detailPageCount, forcedDetailPageIndex, nowMs, pageStartedAtMs])

  const detailPageElapsedMs = useMemo(() => {
    if (detailPageCount <= 1) return 0
    return Math.max(0, nowMs - pageStartedAtMs) % detailDurationMs
  }, [detailDurationMs, detailPageCount, nowMs, pageStartedAtMs])

  const animationPhase = detailPageCount > 1 && detailPageElapsedMs >= detailDurationMs - DETAIL_EXIT_WINDOW_MS ? 'exit' : 'enter'

  const visibleDetails = useMemo(() => {
    if (visibleDetailsOverride !== null) {
      return visibleDetailsOverride
    }

    if (detailPageCount <= 1) return promotion.details.slice(0, rowsPerPage)

    const total = promotion.details.length
    const basePerPage = Math.floor(total / detailPageCount)
    const extra = total % detailPageCount

    let start = 0
    for (let i = 0; i < detailPageIndex; i++) {
      start += basePerPage + (i < extra ? 1 : 0)
    }
    const count = basePerPage + (detailPageIndex < extra ? 1 : 0)
    return promotion.details.slice(start, start + count)
  }, [detailPageIndex, detailPageCount, promotion.details, rowsPerPage, visibleDetailsOverride])

  const presentation = useMemo(() => getPromotionPresentation(promotion), [promotion])

  const detailTableKey = `${promotion.marketing_promotion_id}-${detailPageIndex}`
  const normalizedRingElapsedMs = ringDurationMs > 0 ? ringElapsedMs % ringDurationMs : 0
  const normalizedRingProgress = ringDurationMs > 0 ? Math.max(0, Math.min(1, normalizedRingElapsedMs / ringDurationMs)) : 0
  const progressOffset = PROGRESS_CIRCUMFERENCE * (1 - normalizedRingProgress)
  const ringOpacity = showProgressIndicator ? resolveRingOpacity(normalizedRingProgress) : 0

  return (
    <div className="promo-card">
      <div className="promo-head">
        <div className="promo-head-copy">
          <div className="promo-topline">
            <span className="promo-category-inline">{presentation.categoryLabel}</span>
            <span className="promo-date">
              {formatDate(promotion.start_promotion_date)} — {formatDate(promotion.end_promotion_date)}
            </span>
          </div>
          <span className="promo-kicker">{presentation.kicker}</span>
          <h2 className="promo-title">{presentation.title}</h2>
          <p className="promo-subtitle">{presentation.subtitle}</p>
        </div>
        <div className="promo-head-meta">
          {showProgressIndicator && (
            <div className="promo-progress" aria-label="Индикатор времени показа">
              <svg className="promo-progress-ring" viewBox="0 0 48 48" aria-hidden>
                <circle className="promo-progress-track" cx="24" cy="24" r="19" />
                <circle
                  className="promo-progress-value"
                  cx="24"
                  cy="24"
                  r="19"
                  style={{
                    strokeDasharray: PROGRESS_CIRCUMFERENCE,
                    strokeDashoffset: progressOffset,
                    opacity: ringOpacity,
                    transition: isRotationPaused ? 'none' : 'stroke-dashoffset 120ms linear, opacity 160ms linear',
                  }}
                />
              </svg>
              <span className="promo-progress-number">{progressIndex + 1}/{progressTotal}</span>
            </div>
          )}
          {promoCount > 1 && (
            <span className="promo-page-dots">
              {Array.from({ length: promoCount }, (_, i) => (
                <span key={i} className={`promo-dot ${i === promoIndex ? 'promo-dot-active' : ''}`} />
              ))}
            </span>
          )}
        </div>
      </div>

      <PromoTable
        key={detailTableKey}
        details={visibleDetails}
        animationPhase={animationPhase}
        describeDetail={describeDetail}
        formatPrice={formatPrice}
        computeNewPrice={computeNewPrice}
      />
    </div>
  )
}
