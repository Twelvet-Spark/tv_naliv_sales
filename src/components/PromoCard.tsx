import { useEffect, useMemo } from 'react'
import PromoTable from './PromoTable'
import { getPromotionPresentation } from '../features/promotions/format'
import { buildToppedUpPages } from '../features/promotions/pagination'
import type { Promotion, PromotionDetail } from '../features/promotions/types'

const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * 19
const DETAIL_EXIT_WINDOW_MS = 1300
const RING_HIDDEN_HEAD_PROGRESS = 0.05
const RING_FADE_IN_END_PROGRESS = 0.14
const RING_FADE_OUT_START_PROGRESS = 0.86
const RING_HIDDEN_TAIL_PROGRESS = 0.97
const preloadedImageUrls = new Set<string>()

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
  showPresentationChrome?: boolean
  compactCatalogMode?: boolean
  compactPromoHeader?: boolean
  reducedMotion?: boolean
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
  showPresentationChrome = true,
  compactCatalogMode = false,
  compactPromoHeader = false,
  reducedMotion = false,
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

  const animationPhase = reducedMotion ? 'idle' : detailPageCount > 1 && detailPageElapsedMs >= detailDurationMs - DETAIL_EXIT_WINDOW_MS ? 'exit' : 'enter'

  const visibleDetails = useMemo(() => {
    if (visibleDetailsOverride !== null) {
      return visibleDetailsOverride
    }

    const pages = buildToppedUpPages(promotion.details, rowsPerPage)
    return pages[detailPageIndex] ?? pages[0] ?? []
  }, [detailPageIndex, detailPageCount, promotion.details, rowsPerPage, visibleDetailsOverride])

  useEffect(() => {
    const pages = buildToppedUpPages(promotion.details, rowsPerPage)
    const pagesToWarm = [detailPageIndex, detailPageIndex + 1]

    for (const pageIndex of pagesToWarm) {
      const normalizedPageIndex = detailPageCount > 0 ? pageIndex % detailPageCount : 0
      const pageDetails = pages[normalizedPageIndex] ?? []

      for (const detail of pageDetails) {
        const src = detail.item_img?.trim()
        if (!src || preloadedImageUrls.has(src)) continue

        preloadedImageUrls.add(src)
        const image = new Image()
        image.decoding = 'async'
        image.src = src
      }
    }
  }, [detailPageCount, detailPageIndex, promotion.details, rowsPerPage])

  const presentation = useMemo(() => getPromotionPresentation(promotion), [promotion])

  const normalizedRingElapsedMs = ringDurationMs > 0 ? ringElapsedMs % ringDurationMs : 0
  const normalizedRingProgress = ringDurationMs > 0 ? Math.max(0, Math.min(1, normalizedRingElapsedMs / ringDurationMs)) : 0
  const progressOffset = PROGRESS_CIRCUMFERENCE * (1 - normalizedRingProgress)
  const ringOpacity = showProgressIndicator ? resolveRingOpacity(normalizedRingProgress) : 0

  return (
    <div className={`promo-card ${compactPromoHeader ? 'promo-card-compact-header' : ''}`}>
      {showPresentationChrome && (
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
                      transition: isRotationPaused || reducedMotion ? 'none' : 'stroke-dashoffset 120ms linear, opacity 160ms linear',
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
      )}

      <PromoTable
        details={visibleDetails}
        animationPhase={animationPhase}
        describeDetail={describeDetail}
        formatPrice={formatPrice}
        computeNewPrice={computeNewPrice}
        showListHeader={showPresentationChrome}
        compactCatalogMode={compactCatalogMode}
      />
    </div>
  )
}
