import { useEffect } from 'react'

type Density = 'comfortable' | 'medium' | 'compact' | 'low-res-tv'

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

export function useViewportDensity() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const visualViewport = window.visualViewport

    const applyDensity = () => {
      const { width, height } = resolveViewportSize()

      root.dataset.viewportDensity = resolveDensity(width, height)
      root.style.setProperty('--tv-viewport-width', String(Math.round(width)))
      root.style.setProperty('--tv-viewport-height', String(Math.round(height)))
    }

    applyDensity()

    window.addEventListener('resize', applyDensity)
    visualViewport?.addEventListener('resize', applyDensity)

    return () => {
      window.removeEventListener('resize', applyDensity)
      visualViewport?.removeEventListener('resize', applyDensity)
    }
  }, [])
}