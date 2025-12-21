"use client"

import { useCallback } from "react"
import { toast } from "sonner"

const DEFAULT_HEADLINE = "We couldn't complete that request"
const DEFAULT_DESCRIPTION = "Please try again in a moment."

type ErrorNoticeOptions = {
  title?: string
  context?: string
  fallbackDescription?: string
  actionLabel?: string
  onAction?: () => void
}

function describeError(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim()) {
    return error
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "")
    if (message.trim()) {
      return message
    }
  }

  return fallback
}

export function useErrorNotice(defaults?: { title?: string; context?: string; fallbackDescription?: string }) {
  const showError = useCallback(
    (error: unknown, options?: ErrorNoticeOptions) => {
      const title = options?.title ?? defaults?.title ?? DEFAULT_HEADLINE
      const description = describeError(
        error,
        options?.fallbackDescription ?? defaults?.fallbackDescription ?? DEFAULT_DESCRIPTION
      )

      const context = options?.context ?? defaults?.context
      const contextualDescription = context ? `${context}. ${description}` : description

      toast.error(title, {
        description: contextualDescription,
        action:
          options?.actionLabel && options?.onAction
            ? {
                label: options.actionLabel,
                onClick: options.onAction,
              }
            : undefined,
      })

      return contextualDescription
    },
    [defaults?.context, defaults?.fallbackDescription, defaults?.title]
  )

  return { showError }
}
