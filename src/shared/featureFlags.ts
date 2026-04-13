function toBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback

  const normalized = value.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') {
    return true
  }

  if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') {
    return false
  }

  return fallback
}

export const featureFlags = {
  richUi: toBoolean(import.meta.env.VITE_TV_RICH_UI, true),
  debugClock: toBoolean(import.meta.env.VITE_TV_DEBUG_CLOCK, import.meta.env.DEV),
  allowTokenEdit: toBoolean(import.meta.env.VITE_TV_ALLOW_TOKEN_EDIT, import.meta.env.DEV || !import.meta.env.VITE_TV_BUSINESS_TOKEN),
}
