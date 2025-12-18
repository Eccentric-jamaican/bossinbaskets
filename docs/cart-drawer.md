# Cart Drawer (Nav Sheet)

This document describes the cart UI that is accessible from the global site navigation and how it is wired into the existing Convex cart backend.

## UX summary

- The cart is accessible from a **Cart** button in the global navigation.
- The cart opens in a right-side **Sheet** (drawer) using `shadcn/ui`.
- Users can:
  - See item count
  - View cart line items
  - Increment/decrement quantities
  - Remove a line item
  - Clear the cart
  - See subtotal

Note: Checkout is currently a placeholder.

## Where it lives

### Frontend

- `components/site/nav.tsx`
  - Renders the **Cart** button with count badge.
  - Renders the **Sheet** drawer content and actions.

### Backend

Cart operations are implemented in:

- `convex/cart.ts`

## Data flow

### Cart count badge

- The navigation renders a cart count badge derived from:
  - `api.cart.getCount` (query)

### Cart drawer contents

- The cart drawer renders items from:
  - `api.cart.get` (query)

`api.cart.get` returns cart items enriched with minimal product details needed for display:

- `product._id`
- `product.name`
- `product.slug`
- `product.price`
- `product.images`
- `product.inventory`
- `product.allowCustomNote`

## Mutations used by the drawer

### Update quantity

- `api.cart.updateQuantity`
  - Decrement button calls with `quantity - 1`
  - Increment button calls with `quantity + 1`

Behavior:

- If `quantity <= 0`, the backend deletes the cart item.
- The backend validates inventory before increasing.

### Remove line item

- `api.cart.remove`
  - Removes a cart line item entirely.

### Clear cart

- `api.cart.clear`
  - Deletes all cart items for the current user.

## UI components used

- `Sheet`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTrigger`
  - from `components/ui/sheet.tsx`
- `ScrollArea`
  - from `components/ui/scroll-area.tsx`
- `Button`, `Spinner`

## Authentication behavior

- If the user is not signed in:
  - `api.cart.getCount` returns `0`
  - `api.cart.get` returns `[]`

The cart drawer will show an empty state.

## Files involved

- `components/site/nav.tsx`
- `convex/cart.ts`
- `convex/schema.ts` (table `cartItems`)
