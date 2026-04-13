import { useEffect, useState } from 'react'

type Density = 'comfortable' | 'medium' | 'compact' | 'low-res-tv'
type PerformanceTier = 'standard' | 'reduced'

function resolveViewportSize() {
  const visualViewport = window.visualViewport

  return {
    width: Math.max(visualViewport?.width ?? 0, window.innerWidth, 320),
    height: Math.max(visualViewport?.height ?? 0, window.innerHeight, 320),
  }
}

function resolveDensity(width: number, height: number): Density {
  if (width <= 1024 && height <= 600) {
    return 'low-res-tv'
  }

  if (height <= 760 || width <= 1280) {
    return 'compact'
  }

  if (height <= 920 || width <= 1600) {
    return 'medium'
  }

  return 'comfortable'
}

function resolvePerformanceTier(width: number, height: number): PerformanceTier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const deviceMemory = typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null
  const hardwareConcurrency = typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null
  const isLowResTv = width <= 1024 && height <= 600
  const isCompactViewport = height <= 760 || width <= 1280
  const isVeryLowPower = (deviceMemory !== null && deviceMemory <= 2) || (hardwareConcurrency !== null && hardwareConcurrency <= 2)
  const isLowPower = (deviceMemory !== null && deviceMemory <= 4) || (hardwareConcurrency !== null && hardwareConcurrency <= 4)

  if (isLowResTv || isVeryLowPower) {
    return 'reduced'
  }

  if (isCompactViewport && isLowPower) {
    return 'reduced'
  }

  return 'standard'
}

export function useViewportDensity() {
  const [performanceTier, setPerformanceTier] = useState<PerformanceTier>(() => {
    if (typeof window === 'undefined') return 'standard'

    const { width, height } = resolveViewportSize()
    return resolvePerformanceTier(width, height)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const visualViewport = window.visualViewport

    const applyDensity = (updateState: boolean) => {
      const { width, height } = resolveViewportSize()
      const nextPerformanceTier = resolvePerformanceTier(width, height)

      root.dataset.viewportDensity = resolveDensity(width, height)
      root.dataset.performanceTier = nextPerformanceTier
      root.style.setProperty('--tv-viewport-width', String(Math.round(width)))
      root.style.setProperty('--tv-viewport-height', String(Math.round(height)))

      if (updateState) {
        setPerformanceTier((current) => current === nextPerformanceTier ? current : nextPerformanceTier)
      }
    }

    applyDensity(false)

    const handleResize = () => applyDensity(true)

    window.addEventListener('resize', handleResize)
    visualViewport?.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  return performanceTier
}