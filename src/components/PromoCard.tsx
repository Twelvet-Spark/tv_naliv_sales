import { useMemo } from 'react'
import PromoTable from './PromoTable'
import { getPromotionPresentation } from '../features/promotions/format'
import type { Promotion, PromotionDetail } from '../features/promotions/types'

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 19
const DETAIL_EXIT_WINDOW_MS = 1300

type Props = {
  promotion: Promotion
  rowsPerPage: number
  detailDurationMs: number
  detailPageCount: number
  promoIndex: number
  promoCount: number
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
  promoIndex,
  promoCount,
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
    if (detailPageCount <= 1) return 0
    return Math.floor(Math.max(0, nowMs - pageStartedAtMs) / detailDurationMs) % detailPageCount
  }, [detailDurationMs, detailPageCount, nowMs, pageStartedAtMs])

  const detailPageElapsedMs = useMemo(() => {
    if (detailPageCount <= 1) return 0
    return Math.max(0, nowMs - pageStartedAtMs) % detailDurationMs
  }, [detailDurationMs, detailPageCount, nowMs, pageStartedAtMs])

  const animationPhase = detailPageCount > 1 && detailPageElapsedMs >= detailDurationMs - DETAIL_EXIT_WINDOW_MS ? 'exit' : 'enter'

  const visibleDetails = useMemo(() => {
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
  }, [detailPageIndex, detailPageCount, promotion.details, rowsPerPage])

  const presentation = useMemo(() => getPromotionPresentation(promotion), [promotion])

  const detailTableKey = `${promotion.marketing_promotion_id}-${detailPageIndex}`
  const progressLabel = detailPageCount > 1 ? `${detailPageIndex + 1}` : `${promoIndex + 1}`
  const progressTotal = detailPageCount > 1 ? detailPageCount : Math.max(1, promoCount)
  const normalizedRingElapsedMs = ringDurationMs > 0 ? ringElapsedMs % ringDurationMs : 0

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
                  strokeDashoffset: PROGRESS_CIRCUMFERENCE,
                  animationDuration: `${Math.max(1, ringDurationMs)}ms`,
                  animationDelay: `-${Math.max(0, normalizedRingElapsedMs)}ms`,
                  animationPlayState: isRotationPaused ? 'paused' : 'running',
                }}
              />
            </svg>
            <span className="promo-progress-number">{progressLabel}/{progressTotal}</span>
          </div>
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
