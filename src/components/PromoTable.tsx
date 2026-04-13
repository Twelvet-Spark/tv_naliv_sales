import { useMemo, useRef, useState } from 'react'
import { parsePromotionItemName } from '../features/promotions/parseItemName'
import type { PromotionDetail } from '../features/promotions/types'
import { telemetry } from '../shared/telemetry'

type Props = {
  details: PromotionDetail[]
  animationPhase: 'enter' | 'exit' | 'idle'
  describeDetail: (detail: PromotionDetail) => string
  formatPrice: (value: number | null) => string
  computeNewPrice: (detail: PromotionDetail) => number | null
  showListHeader?: boolean
  compactCatalogMode?: boolean
}

function computePricePerLiter(value: number | null, volumeMl: number | null) {
  if (value === null || volumeMl === null || volumeMl <= 0) return null
  return Math.round((value * 1000) / volumeMl)
}

function extractCommonPrefix(names: string[]): string {
  if (names.length < 2) return ''
  const first = names[0]
  let end = first.length
  for (let i = 1; i < names.length; i++) {
    const s = names[i]
    let j = 0
    while (j < end && j < s.length && first[j] === s[j]) j++
    end = j
    if (end === 0) return ''
  }
  const raw = first.slice(0, end)
  const trimmed = raw.replace(/\s+\S*$/, '')
  return trimmed.length >= 6 ? trimmed : ''
}

function stripPrefix(name: string, prefix: string): string {
  if (!prefix) return name
  const stripped = name.slice(prefix.length).replace(/^\s+/, '')
  return stripped || name
}

function getTagTone(tag: string) {
  const normalized = tag.toLowerCase()

  if (normalized === 'светлое' || normalized === 'тёмное' || normalized === 'полутёмное') return 'card-tag-color'
  if (normalized === 'нефильтрованное' || normalized === 'фильтрованное' || normalized === 'непастеризованное' || normalized === 'пастеризованное') return 'card-tag-tech'
  if (normalized === 'банка' || normalized === 'бутылка') return 'card-tag-pack'
  if (normalized === 'мягкое' || normalized === 'крепкое' || normalized === 'живое') return 'card-tag-taste'
  return 'card-tag-style'
}

function ThumbnailPlaceholder() {
  return (
    <div className="card-thumb-placeholder" aria-hidden>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /><line x1="6" x2="6" y1="2" y2="4" /><line x1="10" x2="10" y1="2" y2="4" /><line x1="14" x2="14" y1="2" y2="4" /></svg>
    </div>
  )
}

function DetailThumbnail({ src, alt, detailId }: { src: string | null; alt: string; detailId: number }) {
  const [failed, setFailed] = useState(false)
  const hasLoggedError = useRef(false)

  if (!src || failed) {
    return <ThumbnailPlaceholder />
  }

  return (
    <img
      className="card-thumb"
      src={src}
      alt={alt}
      loading="eager"
      fetchPriority="high"
      onError={() => {
        if (!hasLoggedError.current) {
          hasLoggedError.current = true
          telemetry.warn('promotion.image.load_failed', {
            detailId,
            itemName: alt,
            imageUrl: src,
          })
        }

        setFailed(true)
      }}
    />
  )
}

export default function PromoTable({
  details,
  animationPhase,
  describeDetail,
  formatPrice,
  computeNewPrice,
  showListHeader = true,
  compactCatalogMode = false,
}: Props) {
  const commonPrefix = useMemo(() => {
    const names = details.map((d) => d.item_name).filter((n): n is string => n != null)
    return extractCommonPrefix(names)
  }, [details])

  return (
    <div className="promo-table-wrap">
      {showListHeader && (
        <div className="card-list-header" role="row">
          <span className="card-list-header-price">Цена за 1 л</span>
        </div>
      )}

      <div className={`promo-table-list ${compactCatalogMode ? 'promo-table-list-catalog' : ''} ${compactCatalogMode && details.length === 1 ? 'promo-table-list-single' : ''}`}>
        {details.length === 0 && (
          <div className="promo-table-empty">
            Для этой акции пока нет позиций.
          </div>
        )}

        {details.map((detail, index) => {
          const raw = stripPrefix(detail.item_name ?? 'Товар без названия', commonPrefix)
          const { displayName, specs, volumeMl } = parsePromotionItemName(raw)
          const abvTag = specs.find((tag) => /%/.test(tag)) ?? null
          const secondarySpecs = specs.filter((tag) => !/%/.test(tag))
          const newPrice = computeNewPrice(detail)
          const hasNewPrice = newPrice !== null && newPrice !== detail.price
          const currentPricePerLiter = computePricePerLiter(hasNewPrice ? newPrice : detail.price, volumeMl)
          const oldPricePerLiter = computePricePerLiter(detail.price, volumeMl)
          const displayPrice = currentPricePerLiter ?? (hasNewPrice ? newPrice : detail.price)
          const badgeLabel = describeDetail(detail)
          const badgeClassName = /\d/.test(badgeLabel) ? 'card-badge card-badge-brand' : 'card-badge'
          const rowClassName = [
            'product-card',
            compactCatalogMode ? 'product-card-catalog' : '',
            animationPhase === 'enter' ? 'row-phase-enter' : '',
            animationPhase === 'exit' ? 'row-phase-exit' : '',
          ].filter(Boolean).join(' ')

          return (
            <div key={detail.detail_id} className={rowClassName} style={{ animationDelay: `${index * 200}ms` }}>
              <div className="card-left">
                {detail.item_img ? (
                  <DetailThumbnail src={detail.item_img} alt={displayName} detailId={detail.detail_id} />
                ) : <ThumbnailPlaceholder />}
                <div className="card-info">
                  <span className="card-name">{displayName}</span>
                  {(abvTag || secondarySpecs.length > 0) && (
                    <div className="card-meta-line">
                      <span className={`card-abv ${abvTag ? '' : 'is-empty'}`}>{abvTag ?? '\u00a0'}</span>
                      <div className="card-tags">
                        {secondarySpecs.map((tag, i) => (
                          <span key={i} className={`card-tag ${getTagTone(tag)}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-right">
                {hasNewPrice && oldPricePerLiter !== null && currentPricePerLiter !== null && (
                  <span className="card-old-price">{formatPrice(oldPricePerLiter)} ₸</span>
                )}
                {hasNewPrice && oldPricePerLiter === null && detail.price !== null && (
                  <span className="card-old-price">{formatPrice(detail.price)} ₸</span>
                )}
                <span className={`card-price ${hasNewPrice ? 'card-price-accent' : ''}`}>
                  {displayPrice !== null ? `${formatPrice(displayPrice)} ₸` : '—'}
                </span>
                {badgeLabel && <span className={badgeClassName}>{badgeLabel}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
