# Convex Backend Documentation

## Overview

This document describes the Convex backend implementation for BossinBaskets, a gift basket e-commerce platform.

## Schema

The database schema is defined in `convex/schema.ts` and includes the following tables:

### Tables

#### `categories`
Organizes gift baskets into browsable categories.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Category display name |
| `slug` | string | URL-friendly identifier |
| `description` | string? | Optional description |
| `imageUrl` | string? | Category image |
| `isActive` | boolean | Whether category is visible |
| `sortOrder` | number | Display order |

**Indexes:** `by_slug`, `by_isActive`

#### `products`
Gift basket products available for purchase.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Product name |
| `slug` | string | URL-friendly identifier |
| `description` | string | Full description |
| `shortDescription` | string? | Brief description |
| `price` | number | Price in cents |
| `compareAtPrice` | number? | Original price for sales |
| `categoryId` | Id<"categories"> | Parent category |
| `images` | string[] | Array of image URLs |
| `isFeatured` | boolean | Show on homepage |
| `isActive` | boolean | Available for purchase |
| `inventory` | number | Stock count |
| `tags` | string[] | Searchable tags |
| `allowCustomNote` | boolean | Allow gift messages |
| `metaTitle` | string? | SEO title |
| `metaDescription` | string? | SEO description |

**Indexes:** `by_slug`, `by_categoryId`, `by_isFeatured`, `by_isActive`, `by_categoryId_and_isActive`

#### `users`
User accounts linked to Clerk authentication.

| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | string | Clerk user ID |
| `email` | string | User email |
| `name` | string? | Display name |
| `role` | "admin" \| "customer" | User role |
| `defaultAddress` | object? | Saved shipping address |

**Indexes:** `by_clerkId`, `by_email`, `by_role`

#### `cartItems`
Shopping cart items for authenticated users.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id<"users"> | Cart owner |
| `productId` | Id<"products"> | Product in cart |
| `quantity` | number | Item quantity |
| `customNote` | string? | Gift message |

**Indexes:** `by_userId`, `by_userId_and_productId`

#### `orders`
Completed and pending orders.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | Id<"users"> | Order owner |
| `orderNumber` | string | Unique order ID (BB-xxx-xxx) |
| `status` | enum | pending/confirmed/processing/shipped/delivered/cancelled |
| `items` | array | Snapshot of ordered products |
| `subtotal` | number | Items total (cents) |
| `shippingCost` | number | Shipping fee (cents) |
| `tax` | number | Tax amount (cents) |
| `total` | number | Grand total (cents) |
| `shippingAddress` | object | Delivery address |
| `isGift` | boolean | Gift order flag |
| `giftMessage` | string? | Gift message |
| `paymentIntentId` | string? | Stripe payment ID |
| `paymentStatus` | enum | pending/paid/failed/refunded |
| `trackingNumber` | string? | Shipping tracking |
| `shippedAt` | number? | Ship timestamp |
| `deliveredAt` | number? | Delivery timestamp |

**Indexes:** `by_userId`, `by_orderNumber`, `by_status`, `by_paymentStatus`

#### `reviews`
Product reviews from customers.

| Field | Type | Description |
|-------|------|-------------|
| `productId` | Id<"products"> | Reviewed product |
| `userId` | Id<"users"> | Review author |
| `rating` | number | 1-5 stars |
| `title` | string? | Review title |
| `content` | string? | Review body |
| `isVerifiedPurchase` | boolean | User bought product |
| `isApproved` | boolean | Admin approved |

**Indexes:** `by_productId`, `by_userId`, `by_productId_and_isApproved`

---

## API Functions

### Users (`convex/users.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `getByClerkId` | query | Get user by Clerk ID |
| `current` | query | Get current authenticated user |
| `upsert` | mutation | Create or update user |
| `updateAddress` | mutation | Update default shipping address |
| `setRole` | internalMutation | Set user role (admin only) |

### Categories (`convex/categories.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listActive` | query | List active categories (sorted) |
| `listAll` | query | List all categories (admin) |
| `getBySlug` | query | Get category by slug |
| `create` | mutation | Create category (admin) |
| `update` | mutation | Update category (admin) |
| `remove` | mutation | Delete category (admin) |

### Products (`convex/products.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listFeatured` | query | List featured products |
| `listByCategory` | query | List products by category (paginated) |
| `listActive` | query | List all active products (paginated) |
| `getBySlug` | query | Get product by slug |
| `getById` | query | Get product by ID |
| `generateUploadUrl` | mutation | Generate a short-lived upload URL for Convex Storage (admin only) |
| `getUrlForStorageId` | mutation | Resolve a Convex Storage file id to a GET URL (admin only) |
| `create` | mutation | Create product (admin) |
| `update` | mutation | Update product (admin) |
| `updateInventory` | mutation | Update stock (admin) |
| `remove` | mutation | Delete product (admin) |
| `search` | query | Search products by name/tags |

### Cart (`convex/cart.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `get` | query | Get current user's cart with product details |
| `getCount` | query | Get total items in cart |
| `add` | mutation | Add item to cart |
| `updateQuantity` | mutation | Update item quantity |
| `updateNote` | mutation | Update custom note |
| `remove` | mutation | Remove item from cart |
| `clear` | mutation | Clear entire cart |

### Orders (`convex/orders.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listByUser` | query | Get user's orders (paginated) |
| `getById` | query | Get order by ID |
| `getByOrderNumber` | query | Get order by order number |
| `createFromCart` | mutation | Create order from cart |
| `updateStatus` | mutation | Update order status (admin) |
| `updateTracking` | mutation | Add tracking number (admin) |
| `updatePaymentStatus` | internalMutation | Update payment (webhook) |
| `listAll` | query | List all orders (admin, paginated) |
| `cancel` | mutation | Cancel pending order |

### Reviews (`convex/reviews.ts`)

| Function | Type | Description |
|----------|------|-------------|
| `listByProduct` | query | Get approved reviews for product |
| `getProductRating` | query | Get rating summary |
| `create` | mutation | Create review |
| `update` | mutation | Update own review |
| `remove` | mutation | Delete review |
| `approve` | mutation | Approve/reject review (admin) |
| `listPending` | query | List pending reviews (admin) |

---

## Usage Examples

### Frontend: Fetching Products

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function FeaturedProducts() {
  const products = useQuery(api.products.listFeatured, { limit: 4 });
  
  if (!products) return <Loading />;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

### Frontend: Adding to Cart

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function AddToCartButton({ productId }: { productId: Id<"products"> }) {
  const addToCart = useMutation(api.cart.add);
  
  const handleAdd = async () => {
    await addToCart({
      productId,
      quantity: 1,
    });
  };
  
  return <Button onClick={handleAdd}>Add to Cart</Button>;
}
```

### Frontend: Creating an Order

```tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function CheckoutForm() {
  const createOrder = useMutation(api.orders.createFromCart);
  
  const handleSubmit = async (formData: FormData) => {
    const orderId = await createOrder({
      shippingAddress: {
        recipientName: formData.get("name") as string,
        street: formData.get("street") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        zipCode: formData.get("zip") as string,
        country: "US",
      },
      isGift: formData.get("isGift") === "true",
      giftMessage: formData.get("giftMessage") as string | undefined,
    });
    
    // Redirect to payment or confirmation
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Files Involved

- `convex/schema.ts` - Database schema definition
- `convex/users.ts` - User management functions
- `convex/categories.ts` - Category CRUD operations
- `convex/products.ts` - Product CRUD and queries
- `convex/cart.ts` - Shopping cart operations
- `convex/orders.ts` - Order management
- `convex/reviews.ts` - Product reviews
- `convex/auth.config.js` - Clerk authentication config
- `components/UserSync.tsx` - Syncs Clerk users to Convex on sign-in
- `components/ConvexClientProvider.tsx` - Convex + Clerk provider wrapper

---

## User Synchronization (Clerk → Convex)

When a user signs in via Clerk, they must also exist in the Convex `users` table for cart, orders, and other authenticated features to work.

### How it works

1. **`components/UserSync.tsx`** — A client component that:
   - Watches Clerk's `useUser()` hook for sign-in state
   - Computes a snapshot string of sync fields (`clerkId|email|name`)
   - Only calls `api.users.upsert` when the snapshot differs from the last successful sync
   - Uses `isSyncingRef` to prevent concurrent duplicate calls (Strict Mode safe)
   - Uses `pendingSnapshotRef` to queue changes that occur during an in-progress sync
   - Uses `setTimeout(() => syncFnRef.current?.(), 0)` to re-sync with fresh closure
   - Updates `lastSyncedRef` only after a successful upsert
   - Renders nothing (logic-only component)

2. **`components/ConvexClientProvider.tsx`** — Includes `<UserSync />` inside the provider so it runs globally on every page.

### Flow

```
User signs in via Clerk
       ↓
UserSync computes snapshot: "clerkId|email|name"
       ↓
If snapshot !== lastSyncedRef:
  - If syncing: store snapshot in pendingSnapshotRef, return
  - If not syncing: start doSync()
       ↓
doSync():
  1. Set isSyncingRef = true, clear pendingSnapshotRef
  2. Compute snapshot from current closure values
  3. If snapshot === lastSyncedRef, return
  4. Call api.users.upsert
  5. On success: set lastSyncedRef = snapshot
  6. On error: log error
  7. Finally: set isSyncingRef = false
  8. If pendingSnapshotRef differs from synced snapshot:
     → setTimeout(() => syncFnRef.current?.(), 0)
       (re-invokes with fresh closure)
       ↓
User record created/updated in Convex users table
       ↓
cart.add, orders.createFromCart, etc. now work
```

### Why this is needed

- `cart.add` and other mutations require the user to exist in Convex
- Previously, `users.upsert` was only called in `AdminGate` (admin routes)
- Regular users visiting the store never triggered the upsert
- Now, `UserSync` ensures all authenticated users are synced globally

### Race condition handling

- **Snapshot-based change detection:** Only syncs when user data actually changes
- **`isSyncingRef` guard:** Prevents concurrent duplicate calls in React Strict Mode
- **`pendingSnapshotRef`:** Queues changes that occur during an in-progress sync
- **`setTimeout` re-invocation:** Schedules a new sync with fresh closure values (avoids stale closure in loops)
- **`syncFnRef`:** Stores reference to latest doSync function for setTimeout callback
- **`lastSyncedRef` updated after success:** Ensures failed syncs can be retried

---

## Notes

- All prices are stored in **cents** to avoid floating-point issues
- Orders snapshot product data at purchase time
- Reviews require admin approval before display
- Cart is tied to authenticated users only
- Free shipping threshold: $100 (10000 cents)
- Tax rate: 8% (configurable)
