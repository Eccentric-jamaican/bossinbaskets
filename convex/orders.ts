import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

// Shared validators
const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("processing"),
  v.literal("shipped"),
  v.literal("delivered"),
  v.literal("cancelled")
);

const paymentStatusValidator = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded")
);

const shippingAddressValidator = v.object({
  recipientName: v.string(),
  street: v.string(),
  city: v.string(),
  state: v.string(),
  zipCode: v.string(),
  country: v.string(),
  phone: v.optional(v.string()),
});

const orderItemValidator = v.object({
  productId: v.id("products"),
  productName: v.string(),
  productImage: v.string(),
  price: v.number(),
  quantity: v.number(),
  customNote: v.optional(v.string()),
});

const orderValidator = v.object({
  _id: v.id("orders"),
  _creationTime: v.number(),
  userId: v.id("users"),
  orderNumber: v.string(),
  status: orderStatusValidator,
  items: v.array(orderItemValidator),
  subtotal: v.number(),
  shippingCost: v.number(),
  tax: v.number(),
  total: v.number(),
  shippingAddress: shippingAddressValidator,
  isGift: v.boolean(),
  giftMessage: v.optional(v.string()),
  paymentIntentId: v.optional(v.string()),
  paymentStatus: paymentStatusValidator,
  trackingNumber: v.optional(v.string()),
  shippedAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
});

// Generate unique order number
function generateOrderNumber(orderId?: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const base = `BB-${timestamp}-${random}`;
  return orderId ? `${base}-${orderId}` : base;
}

// Get user's orders with pagination
export const listByUser = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(orderValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .paginate(args.paginationOpts);

    return result;
  },
});

// Get single order by ID
export const getById = query({
  args: { orderId: v.id("orders") },
  returns: v.union(orderValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const order = await ctx.db.get(args.orderId);
    if (!order || (order.userId !== user._id && user.role !== "admin")) {
      return null;
    }

    return order;
  },
});

// Get order by order number
export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  returns: v.union(orderValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const order = await ctx.db
      .query("orders")
      .withIndex("by_orderNumber", (q) => q.eq("orderNumber", args.orderNumber))
      .unique();

    if (!order || (order.userId !== user._id && user.role !== "admin")) {
      return null;
    }

    return order;
  },
});

// Create order from cart
export const createFromCart = mutation({
  args: {
    shippingAddress: shippingAddressValidator,
    isGift: v.boolean(),
    giftMessage: v.optional(v.string()),
  },
  returns: v.id("orders"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get cart items
    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Build order items and calculate totals
    const orderItems: Array<{
      productId: typeof cartItems[0]["productId"];
      productName: string;
      productImage: string;
      price: number;
      quantity: number;
      customNote?: string;
    }> = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
      const product = await ctx.db.get(cartItem.productId);
      if (!product || !product.isActive) {
        throw new Error(`Product ${cartItem.productId} is no longer available`);
      }
      if (product.inventory < cartItem.quantity) {
        throw new Error(`Insufficient inventory for ${product.name}`);
      }

      orderItems.push({
        productId: cartItem.productId,
        productName: product.name,
        productImage: product.images[0] ?? "",
        price: product.price,
        quantity: cartItem.quantity,
        customNote: cartItem.customNote,
      });

      subtotal += product.price * cartItem.quantity;

      // Reduce inventory
      await ctx.db.patch(product._id, {
        inventory: product.inventory - cartItem.quantity,
      });
    }

    // Calculate shipping and tax (simplified)
    const shippingCost = subtotal >= 10000 ? 0 : 999; // Free shipping over $100
    const tax = Math.round(subtotal * 0.08); // 8% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const orderId = await ctx.db.insert("orders", {
      userId: user._id,
      orderNumber: "PENDING",
      status: "pending",
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress: args.shippingAddress,
      isGift: args.isGift,
      giftMessage: args.giftMessage,
      paymentStatus: "pending",
    });

    await ctx.db.patch(orderId, {
      orderNumber: generateOrderNumber(orderId),
    });

    // Clear cart
    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    return orderId;
  },
});

// Update order status (admin)
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: orderStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "shipped") {
      updates.shippedAt = Date.now();
    } else if (args.status === "delivered") {
      updates.deliveredAt = Date.now();
    }

    await ctx.db.patch(args.orderId, updates);
    return null;
  },
});

// Update tracking number (admin)
export const updateTracking = mutation({
  args: {
    orderId: v.id("orders"),
    trackingNumber: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      throw new Error("Admin access required");
    }

    await ctx.db.patch(args.orderId, { trackingNumber: args.trackingNumber });
    return null;
  },
});

// Update payment status (internal - called from webhook)
export const updatePaymentStatus = internalMutation({
  args: {
    orderId: v.id("orders"),
    paymentStatus: paymentStatusValidator,
    paymentIntentId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = {
      paymentStatus: args.paymentStatus,
    };

    if (args.paymentIntentId) {
      updates.paymentIntentId = args.paymentIntentId;
    }

    if (args.paymentStatus === "paid") {
      updates.status = "confirmed";
    } else if (args.paymentStatus === "failed") {
      updates.status = "cancelled";
    }

    await ctx.db.patch(args.orderId, updates);
    return null;
  },
});

// List all orders (admin) with pagination
export const listAll = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(orderStatusValidator),
  },
  returns: v.object({
    page: v.array(orderValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return { page: [], isDone: true, continueCursor: "" };
    }

    if (args.status) {
      const result = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
      return result;
    }

    const result = await ctx.db
      .query("orders")
      .order("desc")
      .paginate(args.paginationOpts);
    return result;
  },
});

// Cancel order (user can cancel pending orders)
export const cancel = mutation({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Only owner or admin can cancel
    if (order.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // Can only cancel pending or confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      throw new Error("Cannot cancel order in current status");
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(product._id, {
          inventory: product.inventory + item.quantity,
        });
      }
    }

    await ctx.db.patch(args.orderId, { status: "cancelled" });
    return null;
  },
});
