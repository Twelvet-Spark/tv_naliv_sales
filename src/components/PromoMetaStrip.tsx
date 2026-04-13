type Props = {
  businessName: string | null
  totalPromotions: number
  updatedAt: Date | null
  isRefreshing: boolean
  isStale: boolean
  staleAgeLabel: string | null
  staleRemainingLabel: string | null
  source: 'live' | 'cache' | null
}

function formatSyncTime(value: Date | null) {
  if (!value) return 'нет данных'

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value)
}

function getSourceLabel(source: 'live' | 'cache' | null) {
  if (source === 'live') return 'онлайн'
  if (source === 'cache') return 'кэш'
  return 'неизвестно'
}

export default function PromoMetaStrip({
  businessName,
  totalPromotions,
  updatedAt,
  isRefreshing,
  isStale,
  staleAgeLabel,
  staleRemainingLabel,
  source,
}: Props) {
  return (
    <section className="promo-meta-strip" aria-label="Статус экрана акций">
      <article className="promo-meta-card">
        <span className="promo-meta-label">Магазин</span>
        <span className="promo-meta-value promo-meta-store">{businessName ?? '—'}</span>
      </article>

      <article className="promo-meta-card">
        <span className="promo-meta-label">Акций</span>
        <span className="promo-meta-value">{totalPromotions}</span>
      </article>

      <article className="promo-meta-card">
        <span className="promo-meta-label">Последняя синхронизация</span>
        <span className="promo-meta-value">{formatSyncTime(updatedAt)}</span>
      </article>

      <article className="promo-meta-card">
        <span className="promo-meta-label">Источник</span>
        <span className={`promo-meta-pill ${source === 'live' ? 'is-live' : 'is-cache'}`}>{getSourceLabel(source)}</span>
      </article>

      <article className="promo-meta-card">
        <span className="promo-meta-label">Статус</span>
        <span className={`promo-meta-pill ${isStale ? 'is-stale' : isRefreshing ? 'is-refreshing' : 'is-live'}`}>
          {isStale ? `данные устаревают${staleAgeLabel ? ` · ${staleAgeLabel}` : ''}` : isRefreshing ? 'обновляем' : 'актуально'}
        </span>
        {isStale && staleRemainingLabel ? (
          <span className="promo-meta-note">до офлайн-блокировки: {staleRemainingLabel}</span>
        ) : null}
      </article>
    </section>
  )
}
