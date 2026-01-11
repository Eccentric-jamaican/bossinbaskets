"use client"

import { useState } from "react"
import { useCookieConsent } from "./CookieConsentProvider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Cookie, Settings, X } from "lucide-react"

export function CookieConsentBanner() {
  const {
    showBanner,
    acceptAll,
    rejectAll,
    savePreferences,
    closeBanner,
    preferences,
    hasConsented,
  } = useCookieConsent()
  const [showSettings, setShowSettings] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(preferences.analytics)
  const [marketingEnabled, setMarketingEnabled] = useState(preferences.marketing)

  if (!showBanner) return null

  const handleSaveSettings = () => {
    savePreferences({ analytics: analyticsEnabled, marketing: marketingEnabled })
    setShowSettings(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-[#002684]/10 bg-[#f7f4ee] shadow-2xl shadow-black/10">
        {!showSettings ? (
          // Main banner
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8]/10">
                <Cookie className="h-6 w-6 text-[#1d4ed8]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#002684]">
                  We value your privacy
                </h3>
                <p className="mt-1 text-sm text-[#002684]/70">
                  We use cookies to enhance your browsing experience and analyze
                  our traffic. By clicking &quot;Accept All&quot;, you consent to our use
                  of cookies.
                </p>
              </div>
              {hasConsented && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeBanner}
                  className="shrink-0 text-[#002684]/50 hover:text-[#002684]"
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-6 text-[#002684] hover:bg-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                onClick={rejectAll}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-6 text-[#002684] hover:bg-white"
              >
                Reject All
              </Button>
              <Button
                onClick={acceptAll}
                className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          // Settings view
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#002684]">
                Cookie Settings
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
                className="text-[#002684]/50 hover:text-[#002684]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Necessary - Always on */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-4">
                <div>
                  <p className="font-medium text-[#002684]">Necessary</p>
                  <p className="text-sm text-[#002684]/70">
                    Required for the website to function
                  </p>
                </div>
                <Switch
                  checked
                  disabled
                  className="data-[state=checked]:bg-[#1d4ed8]"
                />
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-4">
                <div>
                  <p className="font-medium text-[#002684]">Analytics</p>
                  <p className="text-sm text-[#002684]/70">
                    Help us understand how visitors use our site
                  </p>
                </div>
                <Switch
                  checked={analyticsEnabled}
                  onCheckedChange={setAnalyticsEnabled}
                  className="data-[state=checked]:bg-[#1d4ed8]"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between rounded-xl bg-white/60 p-4">
                <div>
                  <p className="font-medium text-[#002684]">Marketing</p>
                  <p className="text-sm text-[#002684]/70">
                    Personalized ads and content
                  </p>
                </div>
                <Switch
                  checked={marketingEnabled}
                  onCheckedChange={setMarketingEnabled}
                  className="data-[state=checked]:bg-[#1d4ed8]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSettings(false)}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 px-6 text-[#002684]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSettings}
                className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
