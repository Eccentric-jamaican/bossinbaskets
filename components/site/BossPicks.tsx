"use client"

import { useMemo } from "react"
import { useQuery } from "convex/react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { ProductCard } from "@/components/store/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"

function BulkPricingNote() {
  return (
    <div className="mt-8 rounded-2xl border bg-accent/40 px-4 py-3 text-center">
      <p className="text-sm-fluid leading-relaxed text-muted-foreground">
        Ordering for the whole office?{" "}
        <Link
          href="/contact"
          className="font-medium text-[#1d4ed8] underline underline-offset-4 hover:no-underline"
        >
          Contact us
        </Link>{" "}
        for bulk pricing on orders of 10 or more.
      </p>
    </div>
  )
}

export default function BossPicks() {
  const categories = useQuery(api.categories.listActive)
  const allActiveProducts = useQuery(api.products.listAllActive, { limit: 24 })

  const isCategoriesLoading = categories === undefined
  const isProductsLoading = allActiveProducts === undefined

  const visibleCategories = useMemo(() => {
    return (categories ?? []).slice(0, 4)
  }, [categories])

  const productsByCategoryId = useMemo(() => {
    const map = new Map<string, Doc<"products">[]>()
    for (const product of allActiveProducts ?? []) {
      const key = String(product.categoryId)
      const list = map.get(key)
      if (list) list.push(product)
      else map.set(key, [product])
    }
    return map
  }, [allActiveProducts])

  const allProducts = useMemo(() => {
    return (allActiveProducts ?? []).slice(0, 4)
  }, [allActiveProducts])

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-[#002684]/20 w-12 md:w-32" />
          <h2 className="text-h2 font-serif font-bold text-[#002684]">Best Picks</h2>
          <div className="h-px bg-[#002684]/20 w-12 md:w-32" />
        </div>

        {/* Tabs Filter */}
        <Tabs defaultValue="all" className="flex flex-col items-center w-full">
          <TabsList className="w-full bg-transparent h-auto flex-nowrap justify-start md:justify-center gap-2 md:gap-6 mb-10 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger 
              value="all" 
              className="shrink-0 whitespace-nowrap rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              All
            </TabsTrigger>
            {isCategoriesLoading
              ? [...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 min-h-[44px] w-24 rounded-full" />
                ))
              : visibleCategories.map((category) => (
                  <TabsTrigger
                    key={category._id}
                    value={category.slug}
                    className="shrink-0 whitespace-nowrap rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
          </TabsList>

          <TabsContent value="all" className="w-full mt-0">
            {isProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
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
                ))}
              </div>
            ) : allProducts.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">No products yet.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {allProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            <BulkPricingNote />
          </TabsContent>
           {visibleCategories.map((category) => {
            const products = (productsByCategoryId.get(String(category._id)) ?? []).slice(0, 4)

            return (
              <TabsContent key={category._id} value={category.slug} className="w-full mt-0">
                {products.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">No products yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                )}

                <BulkPricingNote />
              </TabsContent>
            )
          })}
        </Tabs>

      </div>
    </section>
  )
}
