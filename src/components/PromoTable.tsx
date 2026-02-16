import ListRow from './ListRow'

type PromotionDetail = {
  detail_id: number
  item_id: number | null
  item_name: string | null
  item_code: string | null
  price: number | null
  type: string
  name: string
  discount: number | null
  base_amount: number | null
  add_amount: number | null
}

type Props = {
  details: PromotionDetail[]
  hasDiscountType: boolean
  describeDetail: (detail: PromotionDetail) => string
  formatPrice: (value: number | null) => string
  computeNewPrice: (detail: PromotionDetail) => number | null
}

export default function PromoTable({ details, hasDiscountType, describeDetail, formatPrice, computeNewPrice }: Props) {
  return (
    <div className="promo-table-wrap">
      <div className={`promo-table-header ${hasDiscountType ? 'has-discount' : ''}`}>
        <span>Товар</span>
        {hasDiscountType ? (
          <>
            <span className="price-col">Старая цена</span>
            <span className="price-col">Новая цена</span>
          </>
        ) : (
          <span className="price-col">Цена</span>
        )}
        <span>Условие</span>
      </div>

      <div className="promo-table-list">
        {details.map((detail, index) => (
          <ListRow key={detail.detail_id} active={index === 0} className={hasDiscountType ? 'has-discount' : ''}>
            <div className="detail-cell">
              <div className="detail-title">{detail.item_name ?? 'Товар без названия'}</div>
            </div>

            {hasDiscountType ? (
              <>
                <div className="detail-cell detail-sub price-col">{formatPrice(detail.price)}</div>
                <div className="detail-cell detail-sub price-col">{formatPrice(computeNewPrice(detail))}</div>
              </>
            ) : (
              <div className="detail-cell detail-sub price-col">{formatPrice(detail.price)}</div>
            )}

            <div className="detail-cell">
              {detail.type === 'DISCOUNT' ? (
                <span className="detail-sub">—</span>
              ) : (
                <span className={`chip ${detail.type === 'AMOUNT' || detail.type === 'SUBTRACT' ? 'chip-strong' : ''}`}>
                  {describeDetail(detail)}
                </span>
              )}
            </div>
          </ListRow>
        ))}
      </div>
    </div>
  )
}
