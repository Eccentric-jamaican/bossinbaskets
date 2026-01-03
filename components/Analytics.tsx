'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag?: GtagFunction
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

type GtagFunction = {
  (
    command: "config" | "set" | "js",
    targetId?: string | number,
    config?: Record<string, unknown>
  ): void
  (command: "event", eventName: string, params?: Record<string, unknown>): void
}

export function Analytics() {
  const pathname = usePathname()
  const hasMountedRef = useRef(true)

  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !pathname || isAdminRoute) return

    if (hasMountedRef.current) {
      hasMountedRef.current = false
      return
    }

    window.gtag?.('config', GA_MEASUREMENT_ID, {
      page_path: pathname,
    })
  }, [pathname, isAdminRoute])

  if (!GA_MEASUREMENT_ID || isAdminRoute) {
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
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  )
}
