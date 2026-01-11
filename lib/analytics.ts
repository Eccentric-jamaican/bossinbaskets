"use client"

import { getConsentPreferences } from "./consent"

type GtagFunction = {
  (command: "event", eventName: string, params?: Record<string, unknown>): void
  (
    command: "config" | "set" | "js",
    targetId?: string | number,
    config?: Record<string, unknown>
  ): void
}

declare global {
  interface Window {
    gtag?: GtagFunction
  }
}

// GA4 Item type
export interface GA4Item {
  item_id: string
  item_name: string
  price: number
  quantity?: number
  item_category?: string
  item_variant?: string
  currency?: string
}

// Convert price from cents to dollars
function centsToNumber(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

// Check if analytics is enabled
function isAnalyticsEnabled(): boolean {
  if (typeof window === "undefined") return false
  const prefs = getConsentPreferences()
  return prefs.analytics && !!window.gtag
}

// Track product view
export function trackViewItem(product: {
  id: string
  name: string
  price: number // in cents
  category?: string
}) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "view_item", {
    currency: "USD",
    value: centsToNumber(product.price),
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: centsToNumber(product.price),
        item_category: product.category,
        quantity: 1,
      },
    ],
  })
}

// Track product list view (store page, category page)
export function trackViewItemList(
  products: Array<{
    id: string
    name: string
    price: number
    category?: string
  }>,
  listName: string
) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "view_item_list", {
    item_list_name: listName,
    items: products.map((product, index) => ({
      item_id: product.id,
      item_name: product.name,
      price: centsToNumber(product.price),
      item_category: product.category,
      index,
    })),
  })
}

// Track add to cart
export function trackAddToCart(item: {
  id: string
  name: string
  price: number // in cents
  quantity: number
  category?: string
}) {
  if (!isAnalyticsEnabled()) return

  const value = centsToNumber(item.price * item.quantity)

  window.gtag?.("event", "add_to_cart", {
    currency: "USD",
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: centsToNumber(item.price),
        quantity: item.quantity,
        item_category: item.category,
      },
    ],
  })
}

// Track remove from cart
export function trackRemoveFromCart(item: {
  id: string
  name: string
  price: number
  quantity: number
}) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "remove_from_cart", {
    currency: "USD",
    value: centsToNumber(item.price * item.quantity),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: centsToNumber(item.price),
        quantity: item.quantity,
      },
    ],
  })
}

// Track begin checkout
export function trackBeginCheckout(
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
) {
  if (!isAnalyticsEnabled()) return

  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  window.gtag?.("event", "begin_checkout", {
    currency: "USD",
    value: centsToNumber(value),
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: centsToNumber(item.price),
      quantity: item.quantity,
    })),
  })
}

// Track shipping info added
export function trackAddShippingInfo(
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>,
  shippingTier: string = "standard"
) {
  if (!isAnalyticsEnabled()) return

  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  window.gtag?.("event", "add_shipping_info", {
    currency: "USD",
    value: centsToNumber(value),
    shipping_tier: shippingTier,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: centsToNumber(item.price),
      quantity: item.quantity,
    })),
  })
}

// Track payment info added
export function trackAddPaymentInfo(
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>,
  paymentType: string
) {
  if (!isAnalyticsEnabled()) return

  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  window.gtag?.("event", "add_payment_info", {
    currency: "USD",
    value: centsToNumber(value),
    payment_type: paymentType,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: centsToNumber(item.price),
      quantity: item.quantity,
    })),
  })
}

// Track purchase
export function trackPurchase(order: {
  transactionId: string
  value: number // total in cents
  tax: number
  shipping: number
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "purchase", {
    transaction_id: order.transactionId,
    currency: "USD",
    value: centsToNumber(order.value),
    tax: centsToNumber(order.tax),
    shipping: centsToNumber(order.shipping),
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: centsToNumber(item.price),
      quantity: item.quantity,
    })),
  })
}

// Track search
export function trackSearch(searchTerm: string) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "search", {
    search_term: searchTerm,
  })
}

// Track filter usage
export function trackSelectContent(contentType: string, itemId: string) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "select_content", {
    content_type: contentType,
    item_id: itemId,
  })
}

// Track category selection
export function trackSelectCategory(categoryName: string, categorySlug: string) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "select_content", {
    content_type: "category",
    item_id: categorySlug,
    item_name: categoryName,
  })
}

// Track product click from list
export function trackSelectItem(
  product: {
    id: string
    name: string
    price: number
    category?: string
  },
  listName: string
) {
  if (!isAnalyticsEnabled()) return

  window.gtag?.("event", "select_item", {
    item_list_name: listName,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: centsToNumber(product.price),
        item_category: product.category,
      },
    ],
  })
}
