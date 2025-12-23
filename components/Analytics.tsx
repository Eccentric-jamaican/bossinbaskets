'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function Analytics() {
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith('/admin')

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !pathname || isAdminRoute) return

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
