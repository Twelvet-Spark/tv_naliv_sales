import { API_BASE_URL } from './constants'
import { telemetry } from '../../shared/telemetry'
import type { Promotion, PromotionDetail } from './types'

type PromotionsPayload = {
  businessId: number | null
  businessName: string | null
  businessAddress: string | null
  promotions: Promotion[]
  count: number
}

type PromotionItemEntry = {
  detailId: number
  itemId: number | null
  itemName: string
  itemImg: string | null
  itemCode: string | null
  price: number | null
  hasPromotionDetails: boolean
  details: PromotionDetail[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asNumber(value: unknown, fallback: number | null = null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function compactString(value: unknown) {
  if (typeof value !== 'string') return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > 0 ? normalized : null
}

function joinAddressParts(parts: unknown[]) {
  const unique: string[] = []
  const seen = new Set<string>()

  for (const part of parts) {
    const normalized = compactString(part)
    if (!normalized) continue

    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(normalized)
  }

  return unique.length > 0 ? unique.join(', ') : null
}

function parseNestedAddress(value: unknown) {
  if (!isRecord(value)) return null

  return joinAddressParts([
    value.city,
    value.district,
    value.microdistrict,
    value.street,
    value.street_name,
    value.house,
    value.building,
    value.unit,
  ])
}

function parseBusinessAddress(business: Record<string, unknown> | null) {
  if (!business) return null

  return compactString(business.full_address)
    ?? compactString(business.address)
    ?? compactString(business.business_address)
    ?? compactString(business.address_line)
    ?? compactString(business.location)
    ?? joinAddressParts([
      business.city,
      business.district,
      business.microdistrict,
      business.street,
      business.street_name,
      business.house,
      business.building,
      business.unit,
    ])
    ?? parseNestedAddress(business.address)
    ?? parseNestedAddress(business.location)
}

function parsePromotionDetail(raw: unknown, index: number): PromotionDetail | null {
  if (!isRecord(raw)) return null

  const detailId = asNumber(raw.detail_id)
  if (detailId === null) return null

  return {
    detail_id: detailId,
    item_id: asNumber(raw.item_id),
    item_name: asNullableString(raw.item_name),
    item_img: asNullableString(raw.item_img),
    item_code: asNullableString(raw.item_code),
    price: asNumber(raw.price),
    type: asString(raw.type, 'UNKNOWN'),
    name: asString(raw.name, `Условие ${index + 1}`),
    discount: asNumber(raw.discount),
    base_amount: asNumber(raw.base_amount),
    add_amount: asNumber(raw.add_amount),
  }
}

function parsePromotion(raw: unknown, index: number): Promotion | null {
  if (!isRecord(raw)) return null

  const id = asNumber(raw.marketing_promotion_id)
  if (id === null) return null

  const rawDetails = Array.isArray(raw.details) ? raw.details : []
  const details = rawDetails
    .map((detail, detailIndex) => parsePromotionDetail(detail, detailIndex))
    .filter((detail): detail is PromotionDetail => detail !== null)

  return {
    marketing_promotion_id: id,
    sourceKind: 'promotion',
    name: asString(raw.name, `Акция ${index + 1}`),
    internal_name: asString(raw.internal_name),
    cover: asNullableString(raw.cover),
    start_promotion_date: asString(raw.start_promotion_date),
    end_promotion_date: asString(raw.end_promotion_date),
    details,
  }
}

function buildFallbackDetailFromItem(raw: Record<string, unknown>): PromotionDetail | null {
  const detailId = asNumber(raw.detail_id) ?? asNumber(raw.item_id)
  if (detailId === null) return null

  return {
    detail_id: detailId,
    item_id: asNumber(raw.item_id),
    item_name: asNullableString(raw.item_name),
    item_img: asNullableString(raw.item_img),
    item_code: asNullableString(raw.item_code),
    price: asNumber(raw.price),
    type: 'UNKNOWN',
    name: '',
    discount: asNumber(raw.discount),
    base_amount: asNumber(raw.base_amount),
    add_amount: asNumber(raw.add_amount),
  }
}

function parsePromotionItemEntry(raw: unknown, index: number): PromotionItemEntry | null {
  if (!isRecord(raw)) return null

  const detailId = asNumber(raw.detail_id) ?? asNumber(raw.item_id)
  if (detailId === null) return null

  const rawDetails = Array.isArray(raw.details) ? raw.details : []
  const parsedDetails = rawDetails
    .map((detail, detailIndex) => parsePromotionDetail(detail, detailIndex))
    .filter((detail): detail is PromotionDetail => detail !== null)

  const details = parsedDetails.length > 0
    ? parsedDetails
    : (() => {
        const fallbackDetail = buildFallbackDetailFromItem(raw)
        return fallbackDetail ? [fallbackDetail] : []
      })()

  if (details.length === 0) return null

  return {
    detailId,
    itemId: asNumber(raw.item_id),
    itemName: asString(raw.item_name, `Позиция ${index + 1}`),
    itemImg: compactString(raw.item_img),
    itemCode: compactString(raw.item_code),
    price: asNumber(raw.price),
    hasPromotionDetails: parsedDetails.length > 0,
    details,
  }
}

function parseFallbackPromotionList(rawItems: unknown[], businessId: number | null, businessName: string | null): Promotion[] {
  const parsedItems = rawItems
    .map((item, index) => parsePromotionItemEntry(item, index))
    .filter((item): item is PromotionItemEntry => item !== null)

  const promotionItems = parsedItems.filter((item) => item.hasPromotionDetails)
  const catalogItems = parsedItems.filter((item) => !item.hasPromotionDetails)
  const fallbackPromotions: Promotion[] = []

  if (promotionItems.length > 0) {
    const firstPromotionItem = promotionItems[0]
    const promotionName = businessName ? `Промо ${businessName}` : 'Промо позиции'

    fallbackPromotions.push({
      marketing_promotion_id: (businessId ?? firstPromotionItem.itemId ?? firstPromotionItem.detailId ?? 1) * 10 + 1,
      sourceKind: 'promotion',
      name: promotionName,
      internal_name: promotionName,
      cover: firstPromotionItem.itemImg ?? null,
      start_promotion_date: '',
      end_promotion_date: '',
      details: promotionItems.flatMap((item) => item.details),
    })
  }

  if (catalogItems.length > 0) {
    const firstCatalogItem = catalogItems[0]
    const catalogName = businessName ? `Позиции ${businessName}` : 'Позиции категории'

    fallbackPromotions.push({
      marketing_promotion_id: (businessId ?? firstCatalogItem.itemId ?? firstCatalogItem.detailId ?? 1) * 10 + 2,
      sourceKind: 'catalog',
      name: catalogName,
      internal_name: catalogName,
      cover: firstCatalogItem.itemImg ?? null,
      start_promotion_date: '',
      end_promotion_date: '',
      details: catalogItems.flatMap((item) => item.details),
    })
  }

  return fallbackPromotions
}

function parsePayload(raw: unknown): PromotionsPayload {
  if (!isRecord(raw)) {
    throw new Error('Некорректный ответ сервера акций')
  }

  if (raw.success !== true) {
    const message = typeof raw.message === 'string' ? raw.message : 'Не удалось получить акции'
    throw new Error(message)
  }

  const data = isRecord(raw.data) ? raw.data : Array.isArray(raw.data) ? { items: raw.data } : {}
  const business = isRecord(data.business) ? data.business : null
  const businessId = business ? asNumber(business.business_id) : null
  const businessName = business && typeof business.name === 'string' ? business.name : null
  const businessAddress = parseBusinessAddress(business)

  const rawPromotions = Array.isArray(data.promotions) ? data.promotions : []
  const parsedPromotions = rawPromotions
    .map((promotion, index) => parsePromotion(promotion, index))
    .filter((promotion): promotion is Promotion => promotion !== null)

  const rawItems = Array.isArray(data.items) ? data.items : Array.isArray(raw) ? raw : []
  const fallbackPromotions = parseFallbackPromotionList(rawItems, businessId, businessName)

  const promotions = parsedPromotions.length > 0 ? parsedPromotions : fallbackPromotions
  const count = asNumber(data.promotions_count, asNumber(data.items_count, promotions.length)) ?? promotions.length

  return {
    businessId,
    businessName,
    businessAddress,
    promotions,
    count,
  }
}

export async function fetchPromotions(token: string, signal: AbortSignal) {
  telemetry.info('promotions.fetch.start', {
    apiBaseUrl: API_BASE_URL,
    tokenHash: token.slice(0, 6),
  })

  const response = await fetch(`${API_BASE_URL}/api/tv/promotions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    const errorText = response.status === 401
      ? 'Проверьте бизнес-токен: сервер вернул 401'
      : response.status >= 500
        ? 'Сервис акций временно недоступен'
        : `Не удалось получить акции: ошибка ${response.status}`

    telemetry.warn('promotions.fetch.http_error', {
      status: response.status,
      tokenHash: token.slice(0, 6),
    })

    throw new Error(errorText)
  }

  const body = await response.json()
  const payload = parsePayload(body)

  telemetry.info('promotions.fetch.success', {
    businessId: payload.businessId,
    count: payload.count,
    hasBusinessAddress: Boolean(payload.businessAddress),
    hasBusinessName: Boolean(payload.businessName),
    tokenHash: token.slice(0, 6),
  })

  return payload
}
