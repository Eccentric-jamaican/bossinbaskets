export type ConsentCategory = "necessary" | "analytics" | "marketing"

export type ConsentPreferences = {
  necessary: true // Always true, cannot be disabled
  analytics: boolean
  marketing: boolean
  timestamp: number
}

export const CONSENT_STORAGE_KEY = "bb_cookie_consent"

export const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  timestamp: 0,
}

export function hasValidConsent(): boolean {
  if (typeof window === "undefined") return false

  const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!stored) return false

  try {
    const prefs = JSON.parse(stored) as ConsentPreferences
    // Consent is valid for 365 days
    const maxAge = 365 * 24 * 60 * 60 * 1000
    return Date.now() - prefs.timestamp < maxAge
  } catch {
    return false
  }
}

export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES

  const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!stored) return DEFAULT_PREFERENCES

  try {
    return JSON.parse(stored) as ConsentPreferences
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function setConsentPreferences(
  prefs: Omit<ConsentPreferences, "necessary" | "timestamp">
): void {
  const fullPrefs: ConsentPreferences = {
    necessary: true,
    ...prefs,
    timestamp: Date.now(),
  }
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullPrefs))
}

export function clearConsentPreferences(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CONSENT_STORAGE_KEY)
}
