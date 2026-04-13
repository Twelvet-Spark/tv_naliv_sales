import { useEffect, useState } from 'react'
import { getKzThemeMode, resolveKzHour } from './kzTime'

const THEME_CHECK_INTERVAL_MS = 15_000

export function useKzThemeMode(debugHour: number | null = null) {
  const [themeMode, setThemeMode] = useState<'day' | 'night'>(() => getKzThemeMode(resolveKzHour(debugHour)))

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateThemeMode = () => setThemeMode(getKzThemeMode(resolveKzHour(debugHour)))
    let intervalId: number | null = null

    updateThemeMode()

    const now = new Date()
    const msUntilNextCheck = THEME_CHECK_INTERVAL_MS - (now.getTime() % THEME_CHECK_INTERVAL_MS)
    const timeoutId = window.setTimeout(() => {
      updateThemeMode()
      intervalId = window.setInterval(updateThemeMode, THEME_CHECK_INTERVAL_MS)
    }, msUntilNextCheck)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== null) {
        window.clearInterval(intervalId)
      }
    }
  }, [debugHour])

  return themeMode
}
