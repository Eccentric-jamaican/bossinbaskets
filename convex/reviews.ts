import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Review validator
const reviewValidator = v.object({
  _id: v.id("reviews"),
  _creationTime: v.number(),
  productId: v.id("products"),
  userId: v.id("users"),
  rating: v.number(),
  title: v.optional(v.string()),
  content: v.optional(v.string()),
  isVerifiedPurchase: v.boolean(),
  isApproved: v.boolean(),
});

// Review with user info for display
const reviewWithUserValidator = v.object({
  _id: v.id("reviews"),
  _creationTime: v.number(),
  productId: v.id("products"),
  userId: v.id("users"),
  rating: v.number(),
  title: v.optional(v.string()),
  content: v.optional(v.string()),
  isVerifiedPurchase: v.boolean(),
  isApproved: v.boolean(),
  userName: v.optional(v.string()),
});

// Get approved reviews for a product
export const listByProduct = query({
  args: { productId: v.id("products") },
  returns: v.array(reviewWithUserValidator),
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_productId_and_isApproved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .collect();

    // Fetch user names
    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const user = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: user?.name ?? "Anonymous",
        };
      })
    );

    return reviewsWithUsers;
  },
});

// Get product rating summary
export const getProductRating = query({
  args: { productId: v.id("products") },
  returns: v.object({
    averageRating: v.number(),
    totalReviews: v.number(),
    ratingDistribution: v.object({
      star1: v.number(),
      star2: v.number(),
      star3: v.number(),
      star4: v.number(),
      star5: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_productId_and_isApproved", (q) =>
        q.eq("productId", args.productId).eq("isApproved", true)
      )
      .collect();

    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 },
      };
    }

    const distribution = { star1: 0, star2: 0, star3: 0, star4: 0, star5: 0 };
    let totalRating = 0;

    for (const review of reviews) {
      totalRating += review.rating;
      if (review.rating === 1) distribution.star1++;
      else if (review.rating === 2) distribution.star2++;
      else if (review.rating === 3) distribution.star3++;
      else if (review.rating === 4) distribution.star4++;
      else if (review.rating === 5) distribution.star5++;
    }

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution: distribution,
    };
  },
});

// Create a review
export const create = mutation({
  args: {
    productId: v.id("products"),
    rating: v.number(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  returns: v.id("reviews"),
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

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Check if user already reviewed this product
    const existingReview = await ctx.db
      .query("reviews")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .first();

    if (existingReview) {
      throw new Error("You have already reviewed this product");
    }

    // Check if user has purchased this product (verified purchase)
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "delivered"),
          q.eq(q.field("paymentStatus"), "paid")
        )
      )
      .collect();

    const isVerifiedPurchase = orders.some((order) =>
      order.items.some((item) => item.productId === args.productId)
    );

    const reviewId = await ctx.db.insert("reviews", {
      productId: args.productId,
      userId: user._id,
      rating: args.rating,
      title: args.title,
      content: args.content,
      isVerifiedPurchase,
      isApproved: false, // Requires admin approval
    });

    return reviewId;
  },
});

// Update a review (user can update their own)
export const update = mutation({
  args: {
    reviewId: v.id("reviews"),
    rating: v.optional(v.number()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
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

    const review = await ctx.db.get(args.reviewId);
    if (!review || review.userId !== user._id) {
      throw new Error("Review not found");
    }

    // Validate rating if provided
    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const updates: Record<string, unknown> = { isApproved: false }; // Re-require approval
    if (args.rating !== undefined) updates.rating = args.rating;
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;

    await ctx.db.patch(args.reviewId, updates);
    return null;
  },
});

// Delete a review (user can delete their own)
export const remove = mutation({
  args: { reviewId: v.id("reviews") },
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

    const review = await ctx.db.get(args.reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // User can delete their own, admin can delete any
    if (review.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.reviewId);
    return null;
  },
});

// Approve review (admin)
export const approve = mutation({
  args: {
    reviewId: v.id("reviews"),
    isApproved: v.boolean(),
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

    await ctx.db.patch(args.reviewId, { isApproved: args.isApproved });
    return null;
  },
});

// List pending reviews (admin)
export const listPending = query({
  args: {},
  returns: v.array(reviewWithUserValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return [];
    }

    const reviews = await ctx.db
      .query("reviews")
      .filter((q) => q.eq(q.field("isApproved"), false))
      .collect();

    const reviewsWithUsers = await Promise.all(
      reviews.map(async (review) => {
        const reviewUser = await ctx.db.get(review.userId);
        return {
          ...review,
          userName: reviewUser?.name ?? "Anonymous",
        };
      })
    );

    return reviewsWithUsers;
  },
});
