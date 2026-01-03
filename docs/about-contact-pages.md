# About & Contact Pages

## Overview
Two informational routes highlight BossinBaskets’ story and provide a calm outreach channel:

- `/about`: concise mission statement with updated Jamaica-focused copy, border-accented belief sections, and Maya Angelou quote panel.
- `/contact`: hero intro, compact contact form, and a simple list of direct contact details.

Both pages reuse the existing navigation and follow the mobile-first typographic system described in `frontend-rules.md`.

## Implementation
- `app/about/page.tsx`
  - Imports `<Nav />` and flows everything inside a `max-w-5xl` column with generous spacing.
  - Hero section introduces the mission with new headline “Gifting that feels thoughtful, never forced” and Jamaica-focused body copy.
  - Border-separated “Our point of view” strip lists updated beliefs as border-accented columns (no card chrome).
  - Maya Angelou quote panel closes the page, using the provided quote for premium feel.

- `app/contact/page.tsx`
  - Uses `<Nav />` and a single stacked card that hosts the form plus contact list—no additional hero content for a calmer entry point.
  - Pulls in `ContactForm` (below) for submissions.
  - Presents contact details as a simple divider list rather than a sidebar/FAQ grid for a calmer layout.

- `components/site/ContactForm.tsx`
  - Small stateful client component with controlled submit experience.
  - Uses shadcn `<Input>`, `<Textarea>`, and `<Button>` primitives for consistency.
  - Currently logs submissions via `console.info` as a placeholder until a Convex mutation or external integration is ready.
  - Displays optimistic success feedback to the user.

- `components/site/nav.tsx`
  - Centralized `navLinks` array now includes `/about` and `/contact` so both desktop and mobile menus stay in sync.

## Future Enhancements
1. Wire the `ContactForm` to a Convex mutation (e.g., `convex/contact.ts`) or external CRM/webhook.
2. Add analytics events to track form submissions once the backend is finalized.
3. Layer in optional FAQ or press content when additional information is required without cluttering the base layout.
