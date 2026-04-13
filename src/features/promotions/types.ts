export type PromotionDetail = {
  detail_id: number
  item_id: number | null
  item_name: string | null
  item_img: string | null
  item_code: string | null
  price: number | null
  type: 'PERCENT' | 'AMOUNT' | 'DISCOUNT' | string
  name: string
  discount: number | null
  base_amount: number | null
  add_amount: number | null
}

export type Promotion = {
  marketing_promotion_id: number
  name: string
  internal_name: string
  cover: string | null
  start_promotion_date: string
  end_promotion_date: string
  details: PromotionDetail[]
}

export type UsePromotionsStatus = 'idle' | 'loading' | 'success' | 'error' | 'offline'

export type UsePromotionsState = {
  status: UsePromotionsStatus
  data: Promotion[]
  businessId: number | null
  businessName: string | null
  businessAddress: string | null
  count: number
  error: string | null
  updatedAt: Date | null
  isRefreshing: boolean
  isStale: boolean
  staleSince: Date | null
  source: 'live' | 'cache' | null
}

export type CachedPromotionsState = {
  version?: 1
  businessId?: number | null
  businessName: string | null
  businessAddress?: string | null
  count: number
  updatedAt: string | null
  data: Promotion[]
}
