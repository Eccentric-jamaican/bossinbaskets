import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Categories for organizing gift baskets
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_isActive", ["isActive"]),

  // Products (gift baskets)
  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(), // in cents
    compareAtPrice: v.optional(v.number()), // original price for sales
    categoryId: v.id("categories"),
    images: v.array(v.string()), // array of image URLs
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    inventory: v.number(),
    tags: v.array(v.string()),
    // Customization options
    allowCustomNote: v.boolean(),
    // SEO
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_categoryId", ["categoryId"])
    .index("by_isFeatured", ["isFeatured"])
    .index("by_isActive", ["isActive"])
    .index("by_categoryId_and_isActive", ["categoryId", "isActive"]),

  // User roles for admin/customer distinction
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("customer")),
    // Shipping defaults
    defaultAddress: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        zipCode: v.string(),
        country: v.string(),
      })
    ),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Shopping cart items
  cartItems: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    quantity: v.number(),
    customNote: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_productId", ["userId", "productId"]),

  // Orders
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
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        productImage: v.string(),
        price: v.number(),
        quantity: v.number(),
        customNote: v.optional(v.string()),
      })
    ),
    subtotal: v.number(),
    shippingCost: v.number(),
    tax: v.number(),
    total: v.number(),
    // Shipping info
    shippingAddress: v.object({
      recipientName: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
      phone: v.optional(v.string()),
    }),
    // Gift options
    isGift: v.boolean(),
    giftMessage: v.optional(v.string()),
    // Payment
    paymentIntentId: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    // Tracking
    trackingNumber: v.optional(v.string()),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_orderNumber", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_paymentStatus", ["paymentStatus"]),

  // Product reviews
  reviews: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    rating: v.number(), // 1-5
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    isVerifiedPurchase: v.boolean(),
    isApproved: v.boolean(),
  })
    .index("by_productId", ["productId"])
    .index("by_userId", ["userId"])
    .index("by_productId_and_isApproved", ["productId", "isApproved"]),
});
