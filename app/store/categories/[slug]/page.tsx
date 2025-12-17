"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProductCard } from "@/components/store/ProductCard"
import { CategoryPills } from "@/components/store/CategoryPills"
import { Skeleton } from "@/components/ui/skeleton"
import { useParams } from "next/navigation"

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  // Fetch category first to get ID
  const category = useQuery(api.categories.getBySlug, { slug })
  
  // Fetch products by category ID once we have it
  const productsResult = useQuery(
    api.products.listByCategory,
    category 
      ? { categoryId: category._id, paginationOpts: { numItems: 20, cursor: null } }
      : "skip"
  )
  const allCategories = useQuery(api.categories.listActive)

  const products = productsResult?.page || []
  const isLoading = !category || !productsResult || !allCategories

  if (category === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-[#002684] mb-2">Category Not Found</h1>
        <p className="text-[#002684]/70">The category you are looking for does not exist.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-12">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-64 mb-3" />
            <Skeleton className="h-6 w-96" />
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-[#002684] mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-[#002684]/70 max-w-2xl">
                {category.description}
              </p>
            )}
          </>
        )}
      </div>

      {/* Category Tabs */}
      {isLoading ? (
        <div className="flex justify-center gap-2 mb-8 md:mb-12">
          <Skeleton className="h-10 w-20 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      ) : (
        <CategoryPills categories={allCategories || []} className="mb-8 md:mb-12" />
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 h-full">
                <Skeleton className="aspect-[4/5] w-full rounded-[2rem]" />
                <div className="px-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center mt-auto">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-9 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))
          : products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>

      {!isLoading && products.length === 0 && (
        <div className="text-center py-20 text-[#002684]/50">
          <p className="text-lg">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
