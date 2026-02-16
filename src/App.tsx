import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import PromoCard from './components/PromoCard'
import StatusState from './components/StatusState'
import TokenScreen from './components/TokenScreen'
import './App.css'

type PromotionDetail = {
  detail_id: number
  item_id: number | null
  item_name: string | null
  item_code: string | null
  price: number | null
  type: 'PERCENT' | 'AMOUNT' | string
  name: string
  discount: number | null
  base_amount: number | null
  add_amount: number | null
}

type Promotion = {
  marketing_promotion_id: number
  name: string
  internal_name: string
  cover: string | null
  start_promotion_date: string
  end_promotion_date: string
  details: PromotionDetail[]
}

type ApiResponse = {
  success: boolean
  data?: {
    business?: { business_id: number; name: string; uuid: string }
    promotions?: Promotion[]
    promotions_count?: number
  }
  message?: string
}

type UsePromotionsState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: Promotion[]
  businessName: string | null
  count: number
  error: string | null
  updatedAt: Date | null
}

const API_BASE_URL = import.meta.env.VITE_TV_API_URL ?? 'https://njt25.naliv.kz'
const STORAGE_KEY = 'tv_business_token'

function useRowsPerPage() {
  const [rows, setRows] = useState(6)

  useEffect(() => {
    const compute = () => {
      if (typeof window === 'undefined') return
      const height = window.innerHeight
      // Reserve space for nav, hero, paddings; keep details visible on TV
      const available = Math.max(170, height - 400)
      const rowHeight = 46
      setRows(Math.max(1, Math.floor(available / rowHeight)))
    }

    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [])

  return rows
}

function usePromotions(token: string | null): UsePromotionsState {
  const [state, setState] = useState<UsePromotionsState>({
    status: 'idle',
    data: [],
    businessName: null,
    count: 0,
    error: null,
    updatedAt: null,
  })

  useEffect(() => {
    if (!token) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Токен не задан. Перейдите на страницу «Токен» и сохраните его.',
      }))
      return
    }

    const controller = new AbortController()

    const load = async () => {
      setState((prev) => ({ ...prev, status: 'loading', error: null }))

      try {
        const response = await fetch(`${API_BASE_URL}/api/tv/promotions`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorText = response.status === 401
            ? 'Проверьте бизнес-токен: сервер вернул 401'
            : 'Не удалось получить акции (сервер вернул ошибку)'
          throw new Error(errorText)
        }

        const body = (await response.json()) as ApiResponse

        if (!body.success) {
          throw new Error(body.message ?? 'Не удалось получить акции')
        }

        const promotions = body.data?.promotions ?? []
        setState({
          status: 'success',
          data: promotions,
          businessName: body.data?.business?.name ?? null,
          count: body.data?.promotions_count ?? promotions.length,
          error: null,
          updatedAt: new Date(),
        })
      } catch (error) {
        if ((error as Error).name === 'AbortError') return

        setState((prev) => ({
          ...prev,
          status: 'error',
          error: (error as Error).message,
        }))
      }
    }

    load()

    return () => controller.abort()
  }, [token])

  return state
}

function formatDate(value: string) {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  })
  return formatter.format(new Date(value))
}

function describeDetail(detail: PromotionDetail) {
  if (detail.type === 'PERCENT' && detail.discount !== null) {
    return `-${detail.discount}%`
  }

  if (detail.type === 'AMOUNT' && detail.discount !== null) {
    return `-${detail.discount}`
  }

  return detail.name
}

function formatPrice(value: number | null) {
  if (value === null) return '—'
  const formatter = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  })
  return formatter.format(value)
}

function computeNewPrice(detail: PromotionDetail) {
  if (detail.price === null) return null
  if (detail.discount === null) return detail.price

  if (detail.type === 'PERCENT') {
    const next = detail.price * (1 - detail.discount / 100)
    return Math.round(Math.max(0, next))
  }

  if (detail.type === 'AMOUNT') {
    const next = detail.price - detail.discount
    return Math.round(Math.max(0, next))
  }

  if (detail.type === 'DISCOUNT') {
    // Трактуем discount как сумму скидки
    const next = detail.price - detail.discount
    return Math.round(Math.max(0, next))
  }

  return detail.price
}

function PromotionsPage({ token, onInvalidToken }: { token: string; onInvalidToken?: () => void }) {
  const { status, data, error } = usePromotions(token)
  const pageCount = Math.max(1, data?.length ?? 0)
  const [pageIndex, setPageIndex] = useState(0)
  const rowsPerPage = useRowsPerPage()
  const [detailPageIndex, setDetailPageIndex] = useState(0)
  const [now, setNow] = useState(new Date())
  const pageIntervalMs = 12000
  const detailIntervalMs = 7000
  const invalidNotified = useRef(false)

  useEffect(() => {
    if (status === 'error' && error && !invalidNotified.current) {
      const message = error.toLowerCase()
      if (message.includes('401') || message.includes('токен')) {
        invalidNotified.current = true
        onInvalidToken?.()
      }
    }
  }, [status, error, onInvalidToken])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setPageIndex(0)
  }, [data])

  const visiblePromotions = useMemo(() => {
    if (!data || data.length === 0) return []
    const safeIndex = pageIndex % data.length
    return [data[safeIndex]]
  }, [data, pageIndex])

  const currentPromotion = visiblePromotions[0]
  const hasDiscountType = currentPromotion?.details.some((detail) => detail.type === 'DISCOUNT') ?? false
  const detailPageCount = currentPromotion ? Math.max(1, Math.ceil(currentPromotion.details.length / rowsPerPage)) : 1
  const effectivePageIntervalMs = useMemo(() => {
    if (detailPageCount > 1) {
      return detailPageCount * detailIntervalMs
    }
    return pageIntervalMs
  }, [detailPageCount, detailIntervalMs, pageIntervalMs])

  useEffect(() => {
    setDetailPageIndex(0)
  }, [pageIndex, rowsPerPage])

  useEffect(() => {
    if (detailPageCount > 1) {
      const id = window.setInterval(() => {
        setDetailPageIndex((prev) => {
          const next = (prev + 1) % detailPageCount
          if (next === 0 && pageCount > 1) {
            setPageIndex((prevPage) => (prevPage + 1) % pageCount)
          }
          return next
        })
      }, detailIntervalMs)

      return () => window.clearInterval(id)
    }

    if (pageCount <= 1) return
    const id = window.setInterval(() => {
      setPageIndex((prev) => (prev + 1) % pageCount)
    }, pageIntervalMs)

    return () => window.clearInterval(id)
  }, [detailPageCount, detailIntervalMs, pageCount, pageIntervalMs])

  const visibleDetails = useMemo(() => {
    if (!currentPromotion) return []
    const start = detailPageIndex * rowsPerPage
    return currentPromotion.details.slice(start, start + rowsPerPage)
  }, [currentPromotion, detailPageIndex, rowsPerPage])

  const pageProgressKey = `${pageIndex}-${pageCount}-${effectivePageIntervalMs}`
  const detailProgressKey = `${detailPageIndex}-${detailPageCount}`

  return (
    <Layout hideHeader>
      <div className="screen-grid no-sidebar">
        <div className="screen-main">
          {status === 'loading' && (
            <StatusState type="loading" />
          )}

          {status === 'error' && (
            <StatusState type="error" message={error} />
          )}

          {status === 'success' && data.length === 0 && (
            <StatusState type="empty" />
          )}

          {status === 'success' && data.length > 0 && currentPromotion && (
            <PromoCard
              key={pageIndex}
              promotion={currentPromotion}
              details={visibleDetails}
              hasDiscountType={hasDiscountType}
              pageProgressKey={pageProgressKey}
              pageDurationMs={effectivePageIntervalMs}
              detailProgressKey={detailProgressKey}
              detailDurationMs={detailIntervalMs}
              detailPageCount={detailPageCount}
              detailPageIndex={detailPageIndex}
              onDetailPageChange={setDetailPageIndex}
              describeDetail={describeDetail}
              formatPrice={formatPrice}
              computeNewPrice={computeNewPrice}
              formatDate={formatDate}
            />
          )}

          {status === 'success' && pageCount > 1 && (
            <div className="carousel-dots" aria-label="Навигация по страницам акций">
              {Array.from({ length: pageCount }).map((_, idx) => (
                <button
                  key={idx}
                  className={idx === pageIndex ? 'dot active' : 'dot'}
                  onClick={() => setPageIndex(idx)}
                  aria-label={`Страница ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

function TokenPage({ token, onSave }: { token: string; onSave: (value: string) => void }) {
  const [value, setValue] = useState(token)
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next = value.trim()
    onSave(next)
    navigate('/')
  }

  return (
    <Layout hideHeader>
      <TokenScreen value={value} onChange={setValue} onSubmit={handleSubmit} />
    </Layout>
  )
}

function App() {
  const envToken = import.meta.env.VITE_TV_BUSINESS_TOKEN ?? ''
  const [token, setToken] = useState(envToken)
  const navigate = useNavigate()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setToken(saved)
    } else if (envToken) {
      window.localStorage.setItem(STORAGE_KEY, envToken)
      setToken(envToken)
    }
  }, [envToken])

  const handleSaveToken = (next: string) => {
    setToken(next)
    if (typeof window !== 'undefined') {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, next)
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    }
  }

  const handleInvalidToken = () => {
    handleSaveToken('')
    navigate('/token')
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/token" element={<TokenPage token={token} onSave={handleSaveToken} />} />
        <Route path="/" element={token ? <PromotionsPage token={token} onInvalidToken={handleInvalidToken} /> : <TokenPage token={token} onSave={handleSaveToken} />} />
        <Route path="*" element={token ? <PromotionsPage token={token} onInvalidToken={handleInvalidToken} /> : <TokenPage token={token} onSave={handleSaveToken} />} />
      </Routes>
    </div>
  )
}

export default App
