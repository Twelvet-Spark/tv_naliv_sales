import { useEffect, useState } from 'react'

type Density = 'comfortable' | 'medium' | 'compact'

type ViewportMetrics = {
  viewportWidth: number
  viewportHeight: number
  panelWidth: number
  panelHeight: number
  availableWidth: number
  availableHeight: number
  devicePixelRatio: number
  density: Density
}

function resolveViewportSize() {
  const visualViewport = window.visualViewport

  return {
    width: Math.max(visualViewport?.width ?? 0, window.innerWidth, 320),
    height: Math.max(visualViewport?.height ?? 0, window.innerHeight, 320),
  }
}

function resolveDensity(width: number, height: number): Density {
  if (height <= 760 || width <= 1280) {
    return 'compact'
  }

  if (height <= 920 || width <= 1600) {
    return 'medium'
  }

  return 'comfortable'
}

function getMetrics(): ViewportMetrics {
  const { width, height } = resolveViewportSize()
  const screenInfo = window.screen

  return {
    viewportWidth: Math.round(width),
    viewportHeight: Math.round(height),
    panelWidth: Math.round(screenInfo?.width ?? width),
    panelHeight: Math.round(screenInfo?.height ?? height),
    availableWidth: Math.round(screenInfo?.availWidth ?? width),
    availableHeight: Math.round(screenInfo?.availHeight ?? height),
    devicePixelRatio: Number((window.devicePixelRatio || 1).toFixed(2)),
    density: resolveDensity(width, height),
  }
}

export function useViewportMetrics() {
  const [metrics, setMetrics] = useState<ViewportMetrics | null>(() => {
    if (typeof window === 'undefined') return null
    return getMetrics()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const visualViewport = window.visualViewport

    const updateMetrics = () => {
      setMetrics(getMetrics())
    }

    updateMetrics()

    window.addEventListener('resize', updateMetrics)
    visualViewport?.addEventListener('resize', updateMetrics)

    return () => {
      window.removeEventListener('resize', updateMetrics)
      visualViewport?.removeEventListener('resize', updateMetrics)
    }
  }, [])

  return metrics
}