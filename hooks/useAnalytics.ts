"use client"

import { useCallback } from "react"
import {
  trackViewItem,
  trackViewItemList,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackSelectCategory,
  trackSelectItem,
} from "@/lib/analytics"

export function useAnalytics() {
  const viewItem = useCallback(
    (product: {
      id: string
      name: string
      price: number
      category?: string
    }) => {
      trackViewItem(product)
    },
    []
  )

  const viewItemList = useCallback(
    (
      products: Array<{
        id: string
        name: string
        price: number
        category?: string
      }>,
      listName: string
    ) => {
      trackViewItemList(products, listName)
    },
    []
  )

  const addToCart = useCallback(
    (item: {
      id: string
      name: string
      price: number
      quantity: number
      category?: string
    }) => {
      trackAddToCart(item)
    },
    []
  )

  const removeFromCart = useCallback(
    (item: { id: string; name: string; price: number; quantity: number }) => {
      trackRemoveFromCart(item)
    },
    []
  )

  const beginCheckout = useCallback(
    (
      items: Array<{
        id: string
        name: string
        price: number
        quantity: number
      }>
    ) => {
      trackBeginCheckout(items)
    },
    []
  )

  const addShippingInfo = useCallback(
    (
      items: Array<{
        id: string
        name: string
        price: number
        quantity: number
      }>,
      shippingTier?: string
    ) => {
      trackAddShippingInfo(items, shippingTier)
    },
    []
  )

  const addPaymentInfo = useCallback(
    (
      items: Array<{
        id: string
        name: string
        price: number
        quantity: number
      }>,
      paymentType: string
    ) => {
      trackAddPaymentInfo(items, paymentType)
    },
    []
  )

  const purchase = useCallback(
    (order: {
      transactionId: string
      value: number
      tax: number
      shipping: number
      items: Array<{ id: string; name: string; price: number; quantity: number }>
    }) => {
      trackPurchase(order)
    },
    []
  )

  const search = useCallback((searchTerm: string) => {
    trackSearch(searchTerm)
  }, [])

  const selectCategory = useCallback(
    (categoryName: string, categorySlug: string) => {
      trackSelectCategory(categoryName, categorySlug)
    },
    []
  )

  const selectItem = useCallback(
    (
      product: {
        id: string
        name: string
        price: number
        category?: string
      },
      listName: string
    ) => {
      trackSelectItem(product, listName)
    },
    []
  )

  return {
    viewItem,
    viewItemList,
    addToCart,
    removeFromCart,
    beginCheckout,
    addShippingInfo,
    addPaymentInfo,
    purchase,
    search,
    selectCategory,
    selectItem,
  }
}
