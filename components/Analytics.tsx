"use client"

import { useEffect, useRef } from "react"
import Script from "next/script"
import { usePathname } from "next/navigation"
import { useCookieConsent } from "./CookieConsentProvider"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function Analytics() {
  const pathname = usePathname()
  const hasMountedRef = useRef(true)
  const { preferences, hasConsented } = useCookieConsent()

  const isAdminRoute = pathname?.startsWith("/admin")
  const analyticsEnabled = hasConsented && preferences.analytics

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !pathname || isAdminRoute || !analyticsEnabled)
      return

    if (hasMountedRef.current) {
      hasMountedRef.current = false
      return
    }

    window.gtag?.("config", GA_MEASUREMENT_ID, {
      page_path: pathname,
    })
  }, [pathname, isAdminRoute, analyticsEnabled])

  // Don't load GA at all if no consent or admin route
  if (!GA_MEASUREMENT_ID || isAdminRoute || !analyticsEnabled) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Set consent state
          gtag('consent', 'default', {
            'analytics_storage': 'granted',
            'ad_storage': '${preferences.marketing ? "granted" : "denied"}'
          });

          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
