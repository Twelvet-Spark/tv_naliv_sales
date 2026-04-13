import { useEffect, useState } from 'react'
import { fetchPromotions } from './api'
import { readCachedPromotions, writeCachedPromotions } from './cache'
import { PROMOTIONS_REFRESH_INTERVAL_MS, STALE_GRACE_PERIOD_MS } from './constants'
import { telemetry } from '../../shared/telemetry'
import type { UsePromotionsState } from './types'

function createEmptyState(): UsePromotionsState {
  return {
    status: 'idle',
    data: [],
    businessId: null,
    businessName: null,
    businessAddress: null,
    count: 0,
    error: null,
    updatedAt: null,
    isRefreshing: false,
    isStale: false,
    staleSince: null,
    source: null,
  }
}

export function isInvalidTokenMessage(message: string | null) {
  if (!message) return false
  const normalized = message.toLowerCase()
  return normalized.includes('401') || normalized.includes('токен')
}

export function getRequestErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.name === 'TypeError') {
      return 'Не удалось связаться с сервером акций. Проверьте сеть на smart box.'
    }

    return error.message
  }

  return 'Не удалось получить акции'
}

export function createInitialPromotionsState(token: string): UsePromotionsState {
  const cached = readCachedPromotions(token)

  if (!cached) {
    telemetry.info('promotions.init.empty', { tokenHash: token.slice(0, 6) })
    return createEmptyState()
  }

  const staleSince = cached.updatedAt ?? new Date()
  const isExpired = Date.now() - staleSince.getTime() >= STALE_GRACE_PERIOD_MS

  return {
    status: isExpired ? 'offline' : 'success',
    data: cached.data,
    businessId: cached.businessId,
    businessName: cached.businessName,
    businessAddress: cached.businessAddress,
    count: cached.count,
    error: isExpired ? 'Данные по акциям устарели. Нет синхронизации с сервером более 12 часов.' : null,
    updatedAt: cached.updatedAt,
    isRefreshing: false,
    isStale: isExpired,
    staleSince: isExpired ? staleSince : null,
    source: 'cache',
  }
}

export function usePromotions(token: string): UsePromotionsState {
  const [state, setState] = useState<UsePromotionsState>(() => createInitialPromotionsState(token))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const initialState = createInitialPromotionsState(token)

    let disposed = false
    let activeController: AbortController | null = null

    const load = async (backgroundRefresh: boolean) => {
      if (disposed) return

      activeController?.abort()
      const controller = new AbortController()
      activeController = controller

      setState((prev) => {
        if (backgroundRefresh && prev.data.length > 0) {
          return {
            ...prev,
            isRefreshing: true,
          }
        }

        return {
          ...prev,
          status: 'loading',
          error: null,
          isRefreshing: false,
          isStale: false,
        }
      })

      try {
        const payload = await fetchPromotions(token, controller.signal)

        if (disposed || activeController !== controller) return

        const nextState: UsePromotionsState = {
          status: 'success',
          data: payload.promotions,
          businessId: payload.businessId,
          businessName: payload.businessName,
          businessAddress: payload.businessAddress,
          count: payload.count,
          error: null,
          updatedAt: new Date(),
          isRefreshing: false,
          isStale: false,
          staleSince: null,
          source: 'live',
        }

        setState(nextState)
        writeCachedPromotions(token, nextState)
        telemetry.info('promotions.sync.live', {
          tokenHash: token.slice(0, 6),
          count: nextState.count,
        })
      } catch (error) {
        if (controller.signal.aborted || disposed || activeController !== controller) return

        const message = getRequestErrorMessage(error)
        telemetry.warn('promotions.sync.failed', {
          tokenHash: token.slice(0, 6),
          message,
        })

        setState((prev) => {
          if (!isInvalidTokenMessage(message) && prev.data.length > 0) {
            const staleSince = prev.staleSince ?? prev.updatedAt ?? new Date()
            const shouldFallbackToOffline = Date.now() - staleSince.getTime() >= STALE_GRACE_PERIOD_MS

            if (shouldFallbackToOffline) {
              telemetry.error('promotions.offline.entered', {
                tokenHash: token.slice(0, 6),
                staleSince: staleSince.toISOString(),
              })
              return {
                ...prev,
                status: 'offline',
                error: message,
                isRefreshing: false,
                isStale: true,
                staleSince,
              }
            }

            telemetry.warn('promotions.stale.fallback', {
              tokenHash: token.slice(0, 6),
              staleSince: staleSince.toISOString(),
            })
            return {
              ...prev,
              status: 'success',
              error: message,
              isRefreshing: false,
              isStale: true,
              staleSince,
            }
          }

          if (isInvalidTokenMessage(message)) {
            telemetry.warn('promotions.token.invalid', {
              tokenHash: token.slice(0, 6),
            })
          }

          return {
            ...prev,
            status: 'error',
            error: message,
            isRefreshing: false,
            isStale: false,
            staleSince: null,
          }
        })
      }
    }

    void load(initialState.data.length > 0)

    const intervalId = window.setInterval(() => {
      void load(true)
    }, PROMOTIONS_REFRESH_INTERVAL_MS)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
      activeController?.abort()
    }
  }, [token])

  return state
}
