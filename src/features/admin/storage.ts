const ADMIN_UNLOCK_STORAGE_KEY = 'tv_admin_unlock_until'
const ADMIN_UNLOCK_WINDOW_MS = 10 * 60 * 1000

function getNow() {
  return Date.now()
}

export function hasAdminAccess() {
  if (typeof window === 'undefined') return false

  const raw = window.sessionStorage.getItem(ADMIN_UNLOCK_STORAGE_KEY)
  if (!raw) return false

  const expiresAt = Number(raw)
  if (!Number.isFinite(expiresAt) || expiresAt <= getNow()) {
    window.sessionStorage.removeItem(ADMIN_UNLOCK_STORAGE_KEY)
    return false
  }

  return true
}

export function grantAdminAccess() {
  if (typeof window === 'undefined') return false

  const expiresAt = getNow() + ADMIN_UNLOCK_WINDOW_MS
  window.sessionStorage.setItem(ADMIN_UNLOCK_STORAGE_KEY, String(expiresAt))
  return true
}

export function revokeAdminAccess() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(ADMIN_UNLOCK_STORAGE_KEY)
}