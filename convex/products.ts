import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel";

// Product validator for return types
const productValidator = v.object({
  _id: v.id("products"),
  _creationTime: v.number(),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  shortDescription: v.optional(v.string()),
  price: v.number(),
  compareAtPrice: v.optional(v.number()),
  categoryId: v.id("categories"),
  images: v.array(v.string()),
  isFeatured: v.boolean(),
  isActive: v.boolean(),
  inventory: v.number(),
  tags: v.array(v.string()),
  allowCustomNote: v.boolean(),
  metaTitle: v.optional(v.string()),
  metaDescription: v.optional(v.string()),
});

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
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
}

// List featured products
export const listFeatured = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(productValidator),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 8;
    const products = await ctx.db
      .query("products")
      .withIndex("by_isFeatured", (q) => q.eq("isFeatured", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(limit);
    return products;
  },
});

// List products by category with pagination
export const listByCategory = query({
  args: {
    categoryId: v.id("categories"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(productValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("products")
      .withIndex("by_categoryId_and_isActive", (q) =>
        q.eq("categoryId", args.categoryId).eq("isActive", true)
      )
      .paginate(args.paginationOpts);
    return result;
  },
});

// List all active products with pagination
export const listActive = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(productValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc")
      .paginate(args.paginationOpts);
    return result;
  },
});

export const getActivePriceBounds = query({
  args: {},
  returns: v.union(
    v.object({
      minPrice: v.number(),
      maxPrice: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const minProduct = await ctx.db
      .query("products")
      .withIndex("by_isActive_and_price", (q) => q.eq("isActive", true))
      .first();

    if (!minProduct) {
      return null;
    }

    const maxProduct = await ctx.db
      .query("products")
      .withIndex("by_isActive_and_price", (q) => q.eq("isActive", true))
      .order("desc")
      .first();

    return {
      minPrice: minProduct.price,
      maxPrice: maxProduct?.price ?? minProduct.price,
    };
  },
});

export const listActiveFiltered = query({
  args: {
    paginationOpts: paginationOptsValidator,
    filters: v.optional(
      v.object({
        sort: v.optional(
          v.union(v.literal("newest"), v.literal("priceAsc"), v.literal("priceDesc"))
        ),
        featuredOnly: v.optional(v.boolean()),
        inStockOnly: v.optional(v.boolean()),
        minPrice: v.optional(v.union(v.number(), v.null())),
        maxPrice: v.optional(v.union(v.number(), v.null())),
      })
    ),
  },
  returns: v.object({
    page: v.array(productValidator),
    isDone: v.boolean(),
    continueCursor: v.string(),
    pageStatus: v.optional(v.union(v.literal("SplitRecommended"), v.literal("SplitRequired"), v.null())),
    splitCursor: v.optional(v.union(v.string(), v.null())),
  }),
  handler: async (ctx, args) => {
    const sort = args.filters?.sort ?? "newest";
    const featuredOnly = args.filters?.featuredOnly ?? false;
    const inStockOnly = args.filters?.inStockOnly ?? false;
    const minPrice = args.filters?.minPrice ?? null;
    const maxPrice = args.filters?.maxPrice ?? null;

    if (sort === "priceAsc" || sort === "priceDesc") {
      let query = ctx.db
        .query("products")
        .withIndex("by_isActive_and_price", (q) => {
          if (minPrice !== null && maxPrice !== null) {
            return q
              .eq("isActive", true)
              .gte("price", minPrice)
              .lte("price", maxPrice);
          }

          if (minPrice !== null) {
            return q.eq("isActive", true).gte("price", minPrice);
          }

          if (maxPrice !== null) {
            return q.eq("isActive", true).lte("price", maxPrice);
          }

          return q.eq("isActive", true);
        })
        .order(sort === "priceDesc" ? "desc" : "asc");

      if (featuredOnly || inStockOnly) {
        query = query.filter((q) => {
          const clauses = [];
          if (featuredOnly) clauses.push(q.eq(q.field("isFeatured"), true));
          if (inStockOnly) clauses.push(q.gt(q.field("inventory"), 0));
          return q.and(...clauses);
        });
      }

      return await query.paginate(args.paginationOpts);
    }

    let query = ctx.db
      .query("products")
      .withIndex("by_isActive", (q) => q.eq("isActive", true))
      .order("desc");

    if (featuredOnly || inStockOnly || minPrice !== null || maxPrice !== null) {
      query = query.filter((q) => {
        const clauses = [];

        if (featuredOnly) clauses.push(q.eq(q.field("isFeatured"), true));
        if (inStockOnly) clauses.push(q.gt(q.field("inventory"), 0));
        if (minPrice !== null) clauses.push(q.gte(q.field("price"), minPrice));
        if (maxPrice !== null) clauses.push(q.lte(q.field("price"), maxPrice));

        return q.and(...clauses);
      });
    }

    return await query.paginate(args.paginationOpts);
  },
});

// Get product by slug
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(productValidator, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return product;
  },
});

// Get product by ID
export const getById = query({
  args: { id: v.id("products") },
  returns: v.union(productValidator, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    return product;
  },
});

export const listAllAdmin = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(productValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const limit = Math.min(args.limit ?? 100, 500);
    const products = await ctx.db.query("products").order("desc").take(limit);
    return products;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrlForStorageId = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Create product (admin)
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    shortDescription: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.id("categories"),
    images: v.array(v.string()),
    isFeatured: v.boolean(),
    isActive: v.boolean(),
    inventory: v.number(),
    tags: v.array(v.string()),
    allowCustomNote: v.boolean(),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
  },
  returns: v.id("products"),
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

    if (args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    if (args.inventory < 0) {
      throw new Error("Inventory must be greater than or equal to 0");
    }

    if (args.compareAtPrice !== undefined && args.compareAtPrice <= args.price) {
      throw new Error("Compare-at price must be greater than price");
    }

    // Check for duplicate slug
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error("Product with this slug already exists");
    }

    // Verify category exists
    const category = await ctx.db.get(args.categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const productId = await ctx.db.insert("products", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      shortDescription: args.shortDescription,
      price: args.price,
      compareAtPrice: args.compareAtPrice,
      categoryId: args.categoryId,
      images: args.images,
      isFeatured: args.isFeatured,
      isActive: args.isActive,
      inventory: args.inventory,
      tags: args.tags,
      allowCustomNote: args.allowCustomNote,
      metaTitle: args.metaTitle,
      metaDescription: args.metaDescription,
    });
    return productId;
  },
});

// Update product (admin)
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    shortDescription: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    images: v.optional(v.array(v.string())),
    isFeatured: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    inventory: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    allowCustomNote: v.optional(v.boolean()),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
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

    const { id, ...updates } = args;

    const existingProduct = await ctx.db.get(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    if (updates.inventory !== undefined && updates.inventory < 0) {
      throw new Error("Inventory must be greater than or equal to 0");
    }

    const effectivePrice = updates.price ?? existingProduct.price;
    const effectiveCompareAtPrice =
      updates.compareAtPrice ?? existingProduct.compareAtPrice;
    if (
      effectiveCompareAtPrice !== undefined &&
      effectiveCompareAtPrice <= effectivePrice
    ) {
      throw new Error("Compare-at price must be greater than price");
    }

    // If updating slug, check for duplicates
    if (updates.slug) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .unique();
      if (existing && existing._id !== id) {
        throw new Error("Product with this slug already exists");
      }
    }

    // If updating category, verify it exists
    if (updates.categoryId) {
      const category = await ctx.db.get(updates.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
    }

    const patch: Partial<Doc<"products">> = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.slug !== undefined) patch.slug = updates.slug;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.shortDescription !== undefined)
      patch.shortDescription = updates.shortDescription;
    if (updates.price !== undefined) patch.price = updates.price;
    if (updates.compareAtPrice !== undefined)
      patch.compareAtPrice = updates.compareAtPrice;
    if (updates.categoryId !== undefined) patch.categoryId = updates.categoryId;
    if (updates.images !== undefined) patch.images = updates.images;
    if (updates.isFeatured !== undefined) patch.isFeatured = updates.isFeatured;
    if (updates.isActive !== undefined) patch.isActive = updates.isActive;
    if (updates.inventory !== undefined) patch.inventory = updates.inventory;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.allowCustomNote !== undefined)
      patch.allowCustomNote = updates.allowCustomNote;
    if (updates.metaTitle !== undefined) patch.metaTitle = updates.metaTitle;
    if (updates.metaDescription !== undefined)
      patch.metaDescription = updates.metaDescription;

    await ctx.db.patch(id, patch);
    return null;
  },
});

// Update inventory (admin)
export const updateInventory = mutation({
  args: {
    id: v.id("products"),
    inventory: v.number(),
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

    if (args.inventory < 0) {
      throw new Error("Inventory must be greater than or equal to 0");
    }

    await ctx.db.patch(args.id, { inventory: args.inventory });
    return null;
  },
});

// Delete product (admin)
export const remove = mutation({
  args: { id: v.id("products") },
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

    const cartItems = await ctx.db
      .query("cartItems")
      .withIndex("by_productId", (q) => q.eq("productId", args.id))
      .collect();

    for (const item of cartItems) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.id);
    return null;
  },
});

// Search products by name or tags
export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  returns: v.array(productValidator),
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 100);
    const searchTerm = args.query.trim();
    if (!searchTerm) {
      return [];
    }

    const rawProducts = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", searchTerm)
      )
      .take(Math.min(limit * 3, 100));

    return rawProducts.filter((p) => p.isActive).slice(0, limit);
  },
});
