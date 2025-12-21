# Customer-Facing Error Handling

This document captures how storefront errors are surfaced to shoppers, with an emphasis on checkout flows.

## Overview
- Soft, brand-aligned messaging via Sonner toasts.
- Inline hints remain for field validation, but blocking failures also trigger a toast.
- All toasts run through a shared helper (`useErrorNotice`) to keep tone and format consistent.

## Toast infrastructure
- The global Sonner `<Toaster />` is mounted in `app/layout.tsx` under `ClerkProvider` / `ConvexClientProvider` so every page can trigger notifications.
- Visual defaults: top-center position, rich colors, close button, custom icons defined in `components/ui/sonner.tsx`.

## `useErrorNotice` helper
- File: `hooks/useErrorNotice.ts`
- Responsibilities:
  - Derive a friendly description from thrown errors (Error.message, string, or fallback copy).
  - Prefix messages with optional context (e.g., "Checkout" or "Cart action").
  - Provide a consistent headline ("We couldn't complete that request") unless overridden.
  - Optional action buttons (label + handler) for retries.
- Returns `{ showError }` which can be called from any component that handles async failures.

## Storefront usage
- **Product detail** (`app/store/products/[slug]/page.tsx`)
  - Add-to-cart success emits `toast.success` with calm reassurance.
  - Failures call `showError(error, { context: "Cart action" })` and also set a short inline message under the CTA.
- **Checkout** (`app/checkout/page.tsx`)
  - `useErrorNotice` warns if shipping info is incomplete before submission.
  - Failed `placeOrder` mutations show a toast with the friendly digest and keep an inline banner visible.
  - Success state remains unchanged, but the toast infrastructure is available for future positive confirmations.

## Copy & tone
- Avoid technical jargon ("network error") unless actionable.
- Lead with empathy (“We couldn’t add that basket…”) and provide next steps (“Please try again shortly.”).
- Keep inline banners short; defer detailed explanations to toast descriptions.

## Testing & validation
- Manual QA checklist:
  1. Simulate add-to-cart failure (e.g., temporarily throw inside mutation) and confirm toast + inline copy.
  2. Attempt checkout with missing address fields: toast should explain missing info, inline banner persists.
  3. Force Convex/network error during checkout to verify fallback description appears.
  4. Confirm toasts are accessible (aria-live) and dismissible on mobile.

## Future improvements
- Add success toasts for checkout completion (optional once payment integrations are live).
- Hook Sonner events into analytics (e.g., log checkout failures).
- Extend `useErrorNotice` to accept structured error codes when backend begins returning them.
