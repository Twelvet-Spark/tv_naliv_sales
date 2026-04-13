import { useEffect, useState } from 'react'
import { getKzGreeting, resolveKzHour } from './kzTime'

const GREETING_CHECK_INTERVAL_MS = 60_000

export function useKzGreeting(debugHour: number | null = null) {
  const [greeting, setGreeting] = useState(() => getKzGreeting(resolveKzHour(debugHour)))

  useEffect(() => {
    const update = () => setGreeting(getKzGreeting(resolveKzHour(debugHour)))
    const syncId = window.setTimeout(update, 0)
    const id = window.setInterval(update, GREETING_CHECK_INTERVAL_MS)

    return () => {
      window.clearTimeout(syncId)
      window.clearInterval(id)
    }
  }, [debugHour])

  return greeting
}
