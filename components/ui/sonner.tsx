"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const BRAND_BG = "#f7f4ee"
const BRAND_TEXT = "#002684"
const BRAND_PRIMARY = "#1d4ed8"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      richColors
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-[#002684]/10 bg-[var(--toast-bg)] text-[var(--toast-fg)] shadow-xl shadow-[#002684]/5 font-sans px-5 py-4",
          title: "text-body font-semibold text-[#002684]",
          description: "text-sm text-[#002684]/80",
          actionButton:
            "rounded-full bg-[#1d4ed8] text-white font-medium px-4 py-1 hover:bg-[#1d4ed8]/90 transition-colors",
          cancelButton:
            "rounded-full border border-[#002684]/20 text-[#002684] px-4 py-1 hover:bg-[#002684]/5 transition-colors",
        },
        style: {
          fontFamily: "var(--font-geist-sans)",
          backgroundColor: BRAND_BG,
          color: BRAND_TEXT,
          ["--toast-bg" as keyof React.CSSProperties]: BRAND_BG,
          ["--toast-fg" as keyof React.CSSProperties]: BRAND_TEXT,
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-[#0f9d58]" />,
        info: <InfoIcon className="size-4 text-[#1d4ed8]" />,
        warning: <TriangleAlertIcon className="size-4 text-[#f59e0b]" />,
        error: <OctagonXIcon className="size-4 text-[#dc2626]" />,
        loading: <Loader2Icon className="size-4 animate-spin text-[#1d4ed8]" />,
      }}
      style={
        {
          "--normal-bg": BRAND_BG,
          "--normal-text": BRAND_TEXT,
          "--normal-border": "#0026841a",
          "--border-radius": "1.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
