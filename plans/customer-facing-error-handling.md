# Plan: Customer-facing error notifications

## 0. Metadata
- Status: draft
- Owner: Cascade AI assistant
- Created: 2025-12-21
- Last updated: 2025-12-21
- Related: storefront checkout UX polishing

## 1. Goal
Give shoppers soft, brand-aligned error notifications (primarily toasts) across key storefront flows, with special attention to checkout.

## 2. Non-goals (out of scope)
- Admin dashboard error UX
- Server-side logging/observability
- Payment gateway retry logic

## 3. Requirements
### Functional
- Provide a reusable toast/notification component for client-visible errors.
- Surface inline guidance for checkout form validation while also triggering a toast for blocking failures.
- Ensure add-to-cart, cart updates, and checkout submission all trigger consistent messaging.

### Non-functional
- Performance: lightweight client bundle impact; avoid blocking renders.
- Security/Privacy: never leak stack traces or sensitive payment info in messages.
- Reliability: toast system should degrade gracefully if JS errors occur (fallback text still visible).
- Compatibility: works on mobile + desktop, accessible (aria-live).

## 4. Assumptions & Open Questions
### Assumptions
- We can use shadcn/ui Toast primitives already in the repo (or install if missing).
- Checkout form lives at `app/checkout/page.tsx` and uses client components.

### Open questions (blocking vs non-blocking)
- [BLOCKER] Do we already have a toast provider mounted globally? Need to confirm before implementation.
- [NON-BLOCKER] Should success notifications share the same styling refresh?

## 5. Proposed Approach
### Architecture / design sketch
- Introduce a `components/ui/toast-provider` (if not present) using shadcn Sonner or Radix.
- Create an `useErrorNotice` hook wrapping toast invocation with default copy + icons.
- Update checkout/cart components to call `useErrorNotice` inside `try/catch` blocks.
- Provide inline field-level hints for validation while leaving systemic errors to toasts.

### Interfaces & contracts
- APIs: none new; hook signature `showError(message: string, options?)`.
- DB schema: no change.
- Events/queues: n/a.
- Errors: map Convex/network failures to friendly copy, optionally include retry CTA.

## 6. Work Breakdown (ordered)
1. Audit current storefront components (cart drawer, checkout page, product add-to-cart) for error handling and note gaps.
2. Add toast provider + styles at the app root (or confirm existing provider) and build `useErrorNotice` helper.
3. Wire helper into checkout submission + validation (soft copy, retry button when possible).
4. Extend to add-to-cart/cart actions for consistency.
5. QA on mobile + desktop; ensure aria-live + focus management.

## 7. Testing & Validation
- Unit: basic tests for helper (if feasible) verifying default copy.
- Integration: Playwright/cypress happy + error paths for checkout (future TODO if framework ready).
- E2E: manual checkout error simulation (e.g., force network failure).
- Manual QA checklist: trigger validation errors, offline mode, Convex mutation failure.
- Success metrics: reduced support tickets, consistent UX.

## 8. Rollout / Migration / Rollback
- No data migrations.
- Feature flags: optional `NEXT_PUBLIC_SHOW_TOASTS` for debugging (not required initially).
- Monitoring: rely on existing console/logs; future enhancement could send to Sentry.
- Rollback steps: revert toast provider + helper usage (stateless change).

## 9. Risks & Mitigations
- Risk: Duplicate toasts spam during rapid retries -> Mitigation: debounce or dedupe by key.
- Risk: Toast provider missing on some routes -> Mitigation: define in `app/layout.tsx` so all pages inherit.
- Risk: Accessibility regressions -> Mitigation: use aria-live polite + ensure focus remains on form.

## 10. Change Log
- 2025-12-21: Created draft plan.
