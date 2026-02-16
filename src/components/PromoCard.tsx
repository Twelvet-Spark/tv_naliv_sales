import PromoDetailsSurface from './PromoDetailsSurface'
import PromoTable from './PromoTable'

type PromotionDetail = {
  detail_id: number
  item_id: number | null
  item_name: string | null
  item_img: string | null
  item_code: string | null
  price: number | null
  type: string
  name: string
  discount: number | null
  base_amount: number | null
  add_amount: number | null
}

type Promotion = {
  marketing_promotion_id: number
  name: string
  internal_name: string
  start_promotion_date: string
  end_promotion_date: string
}

type Props = {
  promotion: Promotion
  details: PromotionDetail[]
  hasDiscountType: boolean
  pageProgressKey: string
  pageDurationMs: number
  detailProgressKey: string
  detailDurationMs: number
  detailPageCount: number
  detailPageIndex: number
  onDetailPageChange: (next: number) => void
  describeDetail: (detail: PromotionDetail) => string
  formatPrice: (value: number | null) => string
  computeNewPrice: (detail: PromotionDetail) => number | null
  formatDate: (value: string) => string
}

export default function PromoCard({
  promotion,
  details,
  hasDiscountType,
  pageProgressKey,
  pageDurationMs,
  detailProgressKey,
  detailDurationMs,
  detailPageCount,
  detailPageIndex,
  onDetailPageChange,
  describeDetail,
  formatPrice,
  computeNewPrice,
  formatDate,
}: Props) {
  return (
    <PromoDetailsSurface className="promo-card" key={promotion.marketing_promotion_id}>
      <div className="promo-head">
        <div>
          <p className="promo-sub">{promotion.internal_name}</p>
          <h2 className="promo-title">{promotion.name}</h2>
        </div>
        <span className="promo-date">
          {formatDate(promotion.start_promotion_date)} — {formatDate(promotion.end_promotion_date)}
        </span>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          key={pageProgressKey}
          style={{ animationDuration: `${pageDurationMs}ms` }}
          aria-hidden
        />
      </div>

      <PromoTable
        details={details}
        hasDiscountType={hasDiscountType}
        describeDetail={describeDetail}
        formatPrice={formatPrice}
        computeNewPrice={computeNewPrice}
      />

      {detailPageCount > 1 && (
        <div className="progress-track progress-track-subtle">
          <div
            className="progress-fill"
            key={detailProgressKey}
            style={{ animationDuration: `${detailDurationMs}ms` }}
            aria-hidden
          />
        </div>
      )}

      {detailPageCount > 1 && (
        <div className="carousel-dots" aria-label="Навигация по строкам акции">
          {Array.from({ length: detailPageCount }).map((_, idx) => (
            <button
              key={idx}
              className={idx === detailPageIndex ? 'dot active' : 'dot'}
              onClick={() => onDetailPageChange(idx)}
              aria-label={`Страница деталей ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </PromoDetailsSurface>
  )
}
