# Admin Panel

This document describes the Admin Panel scaffolding for product management (create now; list/edit planned), how access control works (Clerk + Convex roles), and the Next.js 16 middleware/proxy constraint.

## Routes

- `/admin`
  - Admin dashboard landing page.
- `/admin/categories`
  - Category management page (create/list/delete).
- `/admin/products`
  - Product management page (currently includes a Create Product form).

## Frontend files

- `app/admin/layout.tsx`
  - Wraps all `/admin/*` pages with `AdminGate` and renders `AdminTopNav`.
- `app/admin/page.tsx`
  - Dashboard landing page.
- `app/admin/categories/page.tsx`
  - Client page that renders a create/list/edit UI for categories and calls `api.categories.create` / `api.categories.update` / `api.categories.remove`.
- `app/admin/products/page.tsx`
  - Client page that renders the product creation form and calls `api.products.create`.

- `components/admin/AdminGate.tsx`
  - Client-side gate that enforces:
    - signed-in user (Clerk)
    - user exists in Convex `users` table
    - `role === "admin"`
  - Also triggers a one-time `api.users.upsert` on sign-in to ensure the Convex `users` record exists.
- `components/admin/AdminTopNav.tsx`
  - Simple admin navigation.

## Access control model

### Summary

Admin access is enforced in two places:

- **UI Gate**: `AdminGate` blocks rendering of admin pages unless the current user is an admin.
- **Backend Enforcement**: Convex mutations such as `products.create` verify the authenticated user has `role === "admin"`.

### Clerk auth identity in Convex

- Convex functions use `ctx.auth.getUserIdentity()`.
- `identity.subject` is used as the Clerk user id (mapped to `users.clerkId`).

### Convex users table and roles

Defined in `convex/schema.ts`:

- Table: `users`
- Fields:
  - `clerkId: string`
  - `email: string`
  - `name?: string`
  - `role: "admin" | "customer"`

Role-related functions in `convex/users.ts`:

- `users.current` (query)
  - Looks up the current authenticated user by `identity.subject`.
- `users.upsert` (mutation)
  - Creates/updates a user record.
  - New users default to `role: "customer"`.
- `users.setRole` (internalMutation)
  - Allows setting `role` for a given `userId`.
  - This is internal and should be called only from trusted server-side flows.

### AdminGate behavior

`components/admin/AdminGate.tsx` uses:

- Clerk: `useUser()` to know if the user is signed in.
- Convex:
  - `useMutation(api.users.upsert)`
  - `useQuery(api.users.current)`
  - `<AuthLoading />`, `<Unauthenticated />`, `<Authenticated />`

Flow:

1. While auth is loading: shows a loading UI.
2. If unauthenticated: shows a "Sign in" CTA.
3. If authenticated:
   - Kicks off a one-time `users.upsert` (using a `useRef` guard).
   - Reads `users.current`.
   - If user is missing (`null`), shows a "Setting up your account…" state.
   - If user exists but not admin, shows "Admin access required".
   - If user is admin, renders children (the admin pages).

## Category management

### Frontend page

Category management lives in:

- `app/admin/categories/page.tsx`

Current capabilities:

- Create a category
  - Name
  - Slug (auto-suggested)
  - Description (optional)
  - Image URL (optional)
  - Sort order (optional)
  - Active toggle
- Edit existing categories
  - Selecting “Edit” on an existing category hydrates the form, lets you update any field, and persists via `api.categories.update`.
- List categories
- Delete categories

### Backend enforcement

Category operations are protected server-side in `convex/categories.ts`:

- `categories.listAll` is admin-only
- `categories.create` is admin-only
- `categories.update` is admin-only
- `categories.remove` is admin-only

Deletion is guarded so a category cannot be deleted while products exist in that category.

## Product creation

### Frontend form

The form lives in:

- `app/admin/products/page.tsx`

Key details:

- It loads categories via `api.categories.listAll` to populate a Category select.
- It calls `api.products.create` to create a product.
- It validates common inputs client-side (name, slug, description, category, price, inventory, images).
- It converts `price` and `compareAtPrice` from dollars to cents.

### Product images (URLs + uploads)

The product create form supports attaching images in two ways:

- **Upload files (preferred)**
  - Drag & drop images or use the file picker.
  - Files upload to Convex Storage.
  - The UI resolves the uploaded file to a URL and adds it to the product’s `images` array.
- **Manual URLs**
  - Paste comma-separated URLs in the Images textarea.

The final `images` payload sent to `api.products.create` is a de-duped merge of:

- uploaded image URLs
- URLs parsed from the textarea

Relevant frontend file:

- `app/admin/products/page.tsx`

Relevant backend functions (admin-only):

- `products.generateUploadUrl` (mutation)
- `products.getUrlForStorageId` (mutation)

### Backend enforcement

`convex/products.ts` `products.create` mutation enforces:

- Request is authenticated (`ctx.auth.getUserIdentity()` must exist).
- User exists in `users` table.
- User role is `admin`.

It also enforces business rules:

- `price > 0`
- `inventory >= 0`
- `compareAtPrice > price` (when provided)
- slug uniqueness
- category must exist

## Next.js 16 middleware / proxy constraint

### What happened

Next.js 16 (Turbopack) does not allow having both a root `middleware.ts` and a root `proxy.ts`.

- Having both files caused the build to fail.

### Current solution

- `proxy.ts` is the only active file at the repo root for Clerk middleware.
- The old `middleware.ts` was renamed to `middleware.disabled.txt` so it does not participate in TypeScript builds.

Current `proxy.ts`:

- Uses `clerkMiddleware()`.
- Includes the standard `matcher` that:
  - skips Next.js internals and static files
  - always runs for `/api` and `/trpc`

- Protects `/admin/*` routes by calling `auth.protect()` when the request matches `/admin(.*)`.

Note:

- Middleware currently enforces **authentication** (signed-in) for `/admin/*`.
- Role-based authorization (must be an admin) is enforced by `AdminGate` + Convex backend role checks, because roles are stored in Convex.

## Environment variables

For a working dev/prod setup you typically need:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

Additionally, this project’s Convex Clerk config may reference:

- `CLERK_FRONTEND_API_URL`

## Common issues

- **Seeing “Admin access required”**
  - Your user is signed in, but your Convex `users` record is not `role: "admin"`.
  - Promote the user via a trusted admin-only flow (e.g., a one-off internal mutation call to `users.setRole`).

- **Seeing “Setting up your account…” indefinitely**
  - `users.upsert` failed or `users.current` is not returning a record.
  - Check Convex logs and confirm Clerk identity is being passed to Convex correctly.
