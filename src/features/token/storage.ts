export const STORAGE_KEY = 'tv_business_token'

export function getInitialToken(envToken: string) {
  if (typeof window === 'undefined') return envToken

  const savedToken = window.localStorage.getItem(STORAGE_KEY)
  if (savedToken) {
    return savedToken
  }

  if (envToken) {
    window.localStorage.setItem(STORAGE_KEY, envToken)
  }

  return envToken
}

export function persistToken(token: string) {
  if (typeof window === 'undefined') return

  if (token) {
    window.localStorage.setItem(STORAGE_KEY, token)
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
}
