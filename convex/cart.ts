import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Cart item with product details for display
const cartItemWithProductValidator = v.object({
  _id: v.id("cartItems"),
  _creationTime: v.number(),
  userId: v.id("users"),
  productId: v.id("products"),
  quantity: v.number(),
  customNote: v.optional(v.string()),
  product: v.union(
    v.object({
      _id: v.id("products"),
      name: v.string(),
      slug: v.string(),
      price: v.number(),
      images: v.array(v.string()),
      inventory: v.number(),
      allowCustomNote: v.boolean(),
    }),
    v.null()
  ),
});

// Get current user's cart
export const get = query({
  args: {},
  returns: v.array(cartItemWithProductValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    // Fetch product details for each cart item
    const itemsWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        return {
          ...item,
          product: product
            ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                images: product.images,
                inventory: product.inventory,
                allowCustomNote: product.allowCustomNote,
              }
            : null,
        };
      })
    );

    return itemsWithProducts;
  },
});

// Get cart count
export const getCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  },
});

// Add item to cart
export const add = mutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
    customNote: v.optional(v.string()),
  },
  returns: v.id("cartItems"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (!Number.isInteger(args.quantity) || args.quantity < 1) {
      throw new Error("Quantity must be an integer greater than or equal to 1");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify product exists and is active
    const product = await ctx.db.get(args.productId);
    if (!product || !product.isActive) {
      throw new Error("Product not available");
    }

    // Check inventory
    if (product.inventory < args.quantity) {
      throw new Error("Insufficient inventory");
    }

    // Check if item already in cart
    const existingItem = await ctx.db
      .query("cartItems")
      .withIndex("by_userId_and_productId", (q) =>
        q.eq("userId", user._id).eq("productId", args.productId)
      )
      .unique();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + args.quantity;
      if (product.inventory < newQuantity) {
        throw new Error("Insufficient inventory");
      }
      await ctx.db.patch(existingItem._id, {
        quantity: newQuantity,
        customNote: args.customNote ?? existingItem.customNote,
      });
      return existingItem._id;
    }

    // Add new cart item
    const cartItemId = await ctx.db.insert("cartItems", {
      userId: user._id,
      productId: args.productId,
      quantity: args.quantity,
      customNote: args.customNote,
    });

    return cartItemId;
  },
});

// Update cart item quantity
export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    quantity: v.number(),
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

    if (!user) {
      throw new Error("User not found");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== user._id) {
      throw new Error("Cart item not found");
    }

    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
      return null;
    }

    if (!Number.isInteger(args.quantity)) {
      throw new Error("Quantity must be an integer");
    }

    // Check inventory
    const product = await ctx.db.get(cartItem.productId);
    if (!product || product.inventory < args.quantity) {
      throw new Error("Insufficient inventory");
    }

    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    return null;
  },
});

// Update custom note
export const updateNote = mutation({
  args: {
    cartItemId: v.id("cartItems"),
    customNote: v.optional(v.string()),
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

    if (!user) {
      throw new Error("User not found");
    }

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== user._id) {
      throw new Error("Cart item not found");
    }

    await ctx.db.patch(args.cartItemId, { customNote: args.customNote });
    return null;
  },
});

// Remove item from cart
export const remove = mutation({
  args: { cartItemId: v.id("cartItems") },
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

    const cartItem = await ctx.db.get(args.cartItemId);
    if (!cartItem || cartItem.userId !== user._id) {
      throw new Error("Cart item not found");
    }

    await ctx.db.delete(args.cartItemId);
    return null;
  },
});

// Clear entire cart
export const clear = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
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

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));
    return null;
  },
});
