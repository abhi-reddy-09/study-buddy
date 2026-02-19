/**
 * Read JWT exp claim (Unix seconds). Does not verify the token.
 */
export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

/** Seconds until expiry; negative if already expired. */
export function getSecondsUntilExpiry(token: string | null): number | null {
  const exp = getTokenExpiry(token)
  if (exp == null) return null
  return Math.floor(exp - Date.now() / 1000)
}

/**
 * Human-readable session time for display.
 * e.g. "59 min left" or "Expires 3:45 PM" or "Expired"
 */
export function formatSessionTime(token: string | null): string {
  const secs = getSecondsUntilExpiry(token)
  if (secs == null) return ''
  if (secs <= 0) return 'Session expired'
  const mins = Math.floor(secs / 60)
  if (mins >= 60) {
    const hours = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${hours}h ${m}m left` : `${hours}h left`
  }
  if (mins < 1) return 'Less than 1 min left'
  return `${mins} min left`
}

/** True if session has less than 5 minutes left (for warning styling). */
export function isSessionExpiringSoon(token: string | null): boolean {
  const secs = getSecondsUntilExpiry(token)
  return secs != null && secs > 0 && secs < 5 * 60
}
