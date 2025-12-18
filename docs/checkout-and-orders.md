# Checkout and Order Management

This document describes the checkout flow and order management functionality for BossinBaskets.

## Overview

- **No payment gateway integration** - Orders use bank transfer or cash on delivery
- **Inventory management** - Stock decreases on order placement, restores on cancellation
- **Order lifecycle** - Pending → Confirmed → Processing → Shipped → Delivered (or Cancelled)

## Checkout Flow

### Customer Journey

1. **Cart Review** - Customer reviews items in cart drawer
2. **Checkout Page** (`/checkout`) - Multi-step form:
   - **Step 1: Shipping** - Recipient name, address, phone, gift options
   - **Step 2: Payment** - Choose bank transfer or cash on delivery
3. **Order Confirmation** - Shows order number and payment instructions

### Payment Methods

#### Cash on Delivery
- Order is placed immediately with `paymentStatus: "pending"`
- Payment collected by delivery person
- Admin marks as paid after delivery

#### Bank Transfer
- Order placed with `paymentStatus: "pending"`
- Customer shown bank account details
- Admin marks as paid once transfer confirmed

## Convex Backend

### Schema (`convex/schema.ts`)

```typescript
orders: defineTable({
  userId: v.id("users"),
  orderNumber: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("processing"),
    v.literal("shipped"),
    v.literal("delivered"),
    v.literal("cancelled")
  ),
  items: v.array(v.object({
    productId: v.id("products"),
    productName: v.string(),
    productImage: v.string(),
    price: v.number(),
    quantity: v.number(),
    customNote: v.optional(v.string()),
  })),
  subtotal: v.number(),
  shippingCost: v.number(),
  tax: v.number(),
  total: v.number(),
  shippingAddress: v.object({...}),
  isGift: v.boolean(),
  giftMessage: v.optional(v.string()),
  paymentMethod: v.union(
    v.literal("bank_transfer"),
    v.literal("cash_on_delivery")
  ),
  paymentStatus: v.union(
    v.literal("pending"),
    v.literal("paid"),
    v.literal("failed"),
    v.literal("refunded")
  ),
  bankTransferRef: v.optional(v.string()),
  trackingNumber: v.optional(v.string()),
  shippedAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
})
```

### Mutations (`convex/orders.ts`)

| Mutation | Description | Access |
|----------|-------------|--------|
| `createFromCart` | Creates order from cart, decrements inventory, clears cart | Customer |
| `cancel` | Cancels order, restores inventory | Customer (pending/confirmed) or Admin |
| `updateStatus` | Changes order status | Admin |
| `updateTracking` | Adds tracking number | Admin |
| `markPaymentReceived` | Marks order as paid, adds bank ref | Admin |

### Queries (`convex/orders.ts`)

| Query | Description | Access |
|-------|-------------|--------|
| `listByUser` | Paginated list of user's orders | Customer |
| `getById` | Single order by ID | Owner or Admin |
| `getByOrderNumber` | Single order by order number | Owner or Admin |
| `listAll` | Paginated list of all orders (optional status filter) | Admin |
| `listAllGrouped` | All orders grouped by status for Kanban view | Admin |
| `getStatusCounts` | Count of orders by status | Admin |

## Admin Order Management

### Location
`/admin/orders`

### Features

#### View Modes
- **Kanban Board** - Drag-and-drop style columns by status
- **Table View** - Traditional list with sorting

Toggle between views using the Kanban/Table buttons in the header.

#### Status Summary
Shows count of orders in each status at a glance.

#### Order Actions (via Order Details Dialog)
- **Change Status** - Move order through workflow
- **Mark as Paid** - For bank transfer orders, add reference number
- **Add Tracking** - Add shipping tracking number
- **Cancel Order** - Returns inventory to stock

### Order Lifecycle

```
[Pending] → [Confirmed] → [Processing] → [Shipped] → [Delivered]
     ↓           ↓
[Cancelled] ← ← ←
```

- **Pending** - Order placed, awaiting payment confirmation (bank transfer) or processing
- **Confirmed** - Payment received or COD order acknowledged
- **Processing** - Order being prepared
- **Shipped** - Order dispatched, tracking number added
- **Delivered** - Order received by customer
- **Cancelled** - Order cancelled, inventory restored

## Files

### Frontend
- `app/checkout/page.tsx` - Checkout flow UI
- `app/admin/orders/page.tsx` - Admin orders management (Kanban + Table)

### Backend
- `convex/orders.ts` - All order-related queries and mutations
- `convex/schema.ts` - Orders table schema

### Navigation
- `components/site/nav.tsx` - Cart drawer with checkout button
- `components/admin/AdminTopNav.tsx` - Admin nav with Orders link

## Inventory Management

When an order is **placed**:
```typescript
await ctx.db.patch(product._id, {
  inventory: product.inventory - cartItem.quantity,
});
```

When an order is **cancelled**:
```typescript
await ctx.db.patch(product._id, {
  inventory: product.inventory + item.quantity,
});
```

## Pricing Logic

- **Subtotal** - Sum of (item.price × item.quantity)
- **Shipping** - Free if subtotal ≥ $100, otherwise $9.99
- **Tax** - 8% of subtotal
- **Total** - Subtotal + Shipping + Tax

## Order Number Format

Generated using timestamp + random string:
```
BB-{timestamp}-{random}-{orderId}
```

Example: `BB-M5X2K-A7B9-orders:12345`
