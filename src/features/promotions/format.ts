import type { Promotion, PromotionDetail } from './types'

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
})

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const wholeNumberFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0,
})

const BUNDLE_PATTERN = /(\d+)\s*\+\s*(\d+)/

type PromotionPresentation = {
  categoryLabel: string
  kicker: string
  title: string
  subtitle: string
}

function getNormalizedType(detail: PromotionDetail) {
  return detail.type.trim().toUpperCase()
}

function isBundlePromotion(detail: PromotionDetail) {
  const normalizedType = getNormalizedType(detail)

  if (normalizedType === 'SUBTRACT') {
    return true
  }

  if ((detail.base_amount ?? 0) > 0 && (detail.add_amount ?? 0) > 0) {
    return true
  }

  return BUNDLE_PATTERN.test(detail.name)
}

function getBundleLabel(detail: PromotionDetail) {
  if ((detail.base_amount ?? 0) > 0 && (detail.add_amount ?? 0) > 0) {
    return `${detail.base_amount}+${detail.add_amount}`
  }

  const match = detail.name.match(BUNDLE_PATTERN)
  if (match) {
    return `${match[1]}+${match[2]}`
  }

  return detail.name || 'Акция'
}

function getDiscountType(detail: PromotionDetail) {
  const normalizedType = getNormalizedType(detail)

  if (normalizedType === 'PERCENT') {
    return 'PERCENT' as const
  }

  if (normalizedType === 'AMOUNT') {
    return 'AMOUNT' as const
  }

  if (normalizedType === 'DISCOUNT' && /%/.test(detail.name)) {
    return 'PERCENT' as const
  }

  return 'DISCOUNT' as const
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function getPresentationKicker(promotion: Promotion) {
  const kinds = new Set(
    promotion.details.map((detail) => {
      if (isBundlePromotion(detail)) return 'bundle'
      return getDiscountType(detail)
    }),
  )

  return kinds.size > 1 ? 'Акции дня' : 'Акция дня'
}

export function getPromotionCategoryLabel(promotion: Promotion) {
  const names = promotion.details.map((detail) => detail.item_name?.toLowerCase() ?? '').filter(Boolean)

  if (names.length > 0 && names.every((name) => /пиво\s+(?:ро|ра)злив/.test(name))) {
    return 'Пиво розлив'
  }

  if (names.length > 0 && names.every((name) => name.includes('сидр'))) {
    return 'Сидр'
  }

  if (names.length > 0 && names.every((name) => name.includes('лимонад'))) {
    return 'Лимонады'
  }

  return 'Акционные позиции'
}

function joinOfferLabels(labels: string[]) {
  if (labels.length === 0) return 'Специальные предложения'
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return `${labels[0]} и ${labels[1]}`
  return `${labels[0]}, ${labels[1]} и ${labels[2]}`
}

export function getPromotionPresentation(promotion: Promotion): PromotionPresentation {
  const categoryLabel = getPromotionCategoryLabel(promotion)
  const bundleLabels = unique(promotion.details.filter(isBundlePromotion).map(getBundleLabel))
  const kicker = getPresentationKicker(promotion)

  if (bundleLabels.length > 0) {
    return {
      categoryLabel,
      kicker,
      title: joinOfferLabels(bundleLabels),
      subtitle: 'Выбирайте любимые позиции по специальным форматам покупки.',
    }
  }

  const percentDiscounts = promotion.details
    .filter((detail) => !isBundlePromotion(detail) && getDiscountType(detail) === 'PERCENT' && detail.discount !== null)
    .map((detail) => detail.discount ?? 0)

  if (percentDiscounts.length > 0) {
    return {
      categoryLabel,
      kicker,
      title: `Скидки до ${wholeNumberFormatter.format(Math.max(...percentDiscounts))}%`,
      subtitle: 'Самые выгодные предложения на выбранные позиции прямо сейчас.',
    }
  }

  const amountDiscounts = promotion.details
    .filter((detail) => !isBundlePromotion(detail) && detail.discount !== null)
    .map((detail) => detail.discount ?? 0)

  if (amountDiscounts.length > 0) {
    return {
      categoryLabel,
      kicker,
      title: `Выгода до ${wholeNumberFormatter.format(Math.max(...amountDiscounts))} ₸`,
      subtitle: 'Снижение цены на популярные позиции в текущей подборке.',
    }
  }

  return {
    categoryLabel,
    kicker,
    title: 'Специальные предложения',
    subtitle: 'Подборка актуальных позиций для гостей магазина.',
  }
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Срок уточняется'
  return dateFormatter.format(date)
}

export function describeDetail(detail: PromotionDetail) {
  if (isBundlePromotion(detail)) {
    return getBundleLabel(detail)
  }

  if (getDiscountType(detail) === 'PERCENT' && detail.discount !== null) {
    return `-${detail.discount}%`
  }

  if (detail.discount !== null) {
    return `-${wholeNumberFormatter.format(detail.discount)} ₸`
  }

  return detail.name.trim()
}

export function formatPrice(value: number | null) {
  if (value === null) return '—'
  return priceFormatter.format(value)
}

export function computeNewPrice(detail: PromotionDetail) {
  if (detail.price === null) return null
  if (isBundlePromotion(detail)) return detail.price
  if (detail.discount === null) return detail.price

  if (getDiscountType(detail) === 'PERCENT') {
    const next = detail.price * (1 - detail.discount / 100)
    return Math.round(Math.max(0, next))
  }

  if (getDiscountType(detail) === 'AMOUNT' || getDiscountType(detail) === 'DISCOUNT') {
    const next = detail.price - detail.discount
    return Math.round(Math.max(0, next))
  }

  return detail.price
}

export function formatStaleAge(staleSince: Date) {
  const diff = Date.now() - staleSince.getTime()
  const totalMinutes = Math.max(1, Math.floor(diff / 60_000))

  if (totalMinutes < 60) {
    return `${totalMinutes} мин`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours < 24) {
    return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`
  }

  const days = Math.floor(hours / 24)
  const restHours = hours % 24
  return restHours > 0 ? `${days} д ${restHours} ч` : `${days} д`
}

export function formatRemainingUntilOffline(staleSince: Date, gracePeriodMs: number) {
  const remainingMs = Math.max(0, gracePeriodMs - (Date.now() - staleSince.getTime()))
  const totalMinutes = Math.ceil(remainingMs / 60_000)

  if (totalMinutes <= 0) {
    return '0 мин'
  }

  if (totalMinutes < 60) {
    return `${totalMinutes} мин`
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes > 0 ? `${hours} ч ${minutes} мин` : `${hours} ч`
}
