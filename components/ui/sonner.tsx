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
            "rounded-2xl border border-border bg-[var(--brand-surface)] text-[var(--brand-foreground)] shadow-xl shadow-brand-primary/5 font-sans px-5 py-4 transition-colors dark:bg-[var(--brand-surface-dark)] dark:text-[var(--brand-foreground-dark)]",
          title: "text-body font-semibold text-[var(--brand-heading)] dark:text-[var(--brand-heading-dark)]",
          description: "text-sm text-[var(--brand-muted)] dark:text-[var(--brand-muted-dark)]",
          actionButton:
            "rounded-full bg-brand-primary text-white font-medium px-4 py-1 hover:bg-brand-primary/90 transition-colors",
          cancelButton:
            "rounded-full border border-brand-primary/20 text-brand-heading px-4 py-1 hover:bg-brand-primary/5 transition-colors dark:text-brand-heading-dark dark:border-brand-primary/40 dark:hover:bg-brand-primary/10",
        },
        style: {
          fontFamily: "var(--font-geist-sans)",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-brand-success" />,
        info: <InfoIcon className="size-4 text-brand-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-brand-warning" />,
        error: <OctagonXIcon className="size-4 text-brand-error" />,
        loading: <Loader2Icon className="size-4 animate-spin text-brand-primary" />,
      }}
      style={
        {
          "--normal-bg": "var(--brand-surface)",
          "--normal-text": "var(--brand-foreground)",
          "--normal-border": "color-mix(in srgb, var(--brand-heading) 10%, transparent)",
          "--border-radius": "1.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
