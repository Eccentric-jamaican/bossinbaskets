"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  type ConsentPreferences,
  DEFAULT_PREFERENCES,
  getConsentPreferences,
  setConsentPreferences,
  hasValidConsent,
} from "@/lib/consent"

type ConsentContextType = {
  preferences: ConsentPreferences
  hasConsented: boolean
  showBanner: boolean
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (prefs: Partial<ConsentPreferences>) => void
  openSettings: () => void
  closeBanner: () => void
}

const ConsentContext = createContext<ConsentContextType | null>(null)

export function useCookieConsent() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider")
  }
  return context
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(DEFAULT_PREFERENCES)
  const [hasConsented, setHasConsented] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const validConsent = hasValidConsent()
    setHasConsented(validConsent)

    if (validConsent) {
      setPreferences(getConsentPreferences())
      setShowBanner(false)
    } else {
      setShowBanner(true)
    }

    setIsInitialized(true)
  }, [])

  const acceptAll = useCallback(() => {
    const newPrefs = { analytics: true, marketing: true }
    setConsentPreferences(newPrefs)
    setPreferences({ ...DEFAULT_PREFERENCES, ...newPrefs, timestamp: Date.now() })
    setHasConsented(true)
    setShowBanner(false)
  }, [])

  const rejectAll = useCallback(() => {
    const newPrefs = { analytics: false, marketing: false }
    setConsentPreferences(newPrefs)
    setPreferences({ ...DEFAULT_PREFERENCES, ...newPrefs, timestamp: Date.now() })
    setHasConsented(true)
    setShowBanner(false)
  }, [])

  const savePreferences = useCallback((prefs: Partial<ConsentPreferences>) => {
    const newPrefs = {
      analytics: prefs.analytics ?? false,
      marketing: prefs.marketing ?? false,
    }
    setConsentPreferences(newPrefs)
    setPreferences({ ...DEFAULT_PREFERENCES, ...newPrefs, timestamp: Date.now() })
    setHasConsented(true)
    setShowBanner(false)
  }, [])

  const openSettings = useCallback(() => {
    setShowBanner(true)
  }, [])

  const closeBanner = useCallback(() => {
    setShowBanner(false)
  }, [])

  return (
    <ConsentContext.Provider
      value={{
        preferences,
        hasConsented,
        showBanner: isInitialized ? showBanner : false,
        acceptAll,
        rejectAll,
        savePreferences,
        openSettings,
        closeBanner,
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}
