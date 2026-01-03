# Storefront SSR Components + Filters Refactor

## Overview
This document describes the changes made to improve SEO/SSR compatibility for category pages, while keeping the main `/store` index page fully interactive, and to harden/filter price input parsing.

The work includes:
- Converting the `/store/categories/[slug]` page to a Server Component (SSR) using `ConvexHttpClient`.
- Splitting shared UI components into:
  - SSR-safe Server Components for use in Server Components.
  - Client-only wrappers for use in Client Components.
- Preventing `NaN` from being written into filter state on the `/store` page.
- Removing duplicated min/max price input JSX via a reusable `PriceInputs` component.
- Making `ProductCard` image selection defensive against missing/malformed `product.images`.

## Goals
- Ensure category pages render meaningful HTML server-side for SEO.
- Avoid forcing Server Components to become Client Components due to importing client-only UI.
- Preserve the existing interactive UX on `/store` (filter drawer state, pagination, etc.).
- Harden user input handling so invalid values never poison state.

## Key Design Decision: Server + Client Component Split
Next.js App Router rules:
- A Server Component cannot import a Client Component.
- If a component includes client-only hooks (e.g. `usePathname`), it must be a Client Component.

To support both SSR pages and interactive client pages, the store UI components were split:

### Server Components (SSR-safe)
- `components/store/ProductCard.tsx`
- `components/store/CategoryPills.tsx`

These components:
- Do not use client-only hooks.
- Do not include `"use client"`.
- Can be imported from Server Components (e.g. the category SSR page).

### Client wrappers (interactive)
- `components/store/ProductCardClient.tsx`
- `components/store/CategoryPillsClient.tsx`

These components:
- Include `"use client"`.
- Can use hooks like `usePathname`.
- Are safe to import in Client Components like `app/store/page.tsx`.

## Category Page SSR
### File
- `app/store/categories/[slug]/page.tsx`

### How it works
- The page is an async Server Component.
- It fetches data server-side using `ConvexHttpClient` and `NEXT_PUBLIC_CONVEX_URL`.
- It renders:
  - Category title/description.
  - `CategoryPills` (SSR) with `activeSlug={slug}`.
  - Product grid using `ProductCard` (SSR).

### Data fetching
Uses existing Convex APIs:
- `api.categories.getBySlug`
- `api.categories.listActive`
- `api.products.listByCategory` with `paginationOpts` (initial 20)

## Store Index Page (Client)
### File
- `app/store/page.tsx`

### Imports
This page remains a Client Component (`"use client"`) and imports:
- `ProductCard` from `@/components/store/ProductCardClient`
- `CategoryPills` from `@/components/store/CategoryPillsClient`

This preserves existing interactivity.

## Price Input Parsing (NaN-safe)
### File
- `app/store/page.tsx`

### Problem
`Number(raw)` can produce `NaN`, which could then be written into `draftFilters.minPrice` / `draftFilters.maxPrice`.

### Fix
- Introduced a reusable `PriceInputs` component within `app/store/page.tsx`.
- Parsing rules:
  - Empty input (`""`) => `null`.
  - Non-finite parse (`NaN`, `Infinity`) => keep the previous value (never write `NaN`).
  - Valid number => clamp to `>= 0`, round to whole dollars, convert to cents (`* 100`).

### DRY improvement
The duplicated min/max input JSX was replaced with `PriceInputs` in both UI branches:
- `priceBounds` branch (slider + inputs)
- no-bounds branch (inputs only)

## ProductCard Image URL Safety
### File
- `components/store/ProductCard.tsx`

### Problem
Accessing `product.images[0]` can throw if `images` is missing or malformed.

### Fix
- Treat `images` as `unknown`.
- Only use the first image if:
  - `Array.isArray(images)`
  - `images.length > 0`
  - `images[0]` is a non-empty string
- Otherwise fall back to `"/placeholder.jpg"`.

## Files Changed / Added
### Changed
- `app/store/categories/[slug]/page.tsx`
- `app/store/page.tsx`
- `components/store/ProductCard.tsx`
- `components/store/CategoryPills.tsx`

### Added
- `components/store/ProductCardClient.tsx`
- `components/store/CategoryPillsClient.tsx`
- `docs/store-ssr-components-and-filters.md`

## Future Work
- Optional: Convert `/store` index into a hybrid SSR + client-islands approach (SSR first page + client-side filters/pagination).
- Pending build fix: ensure Clerk env vars exist (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).
