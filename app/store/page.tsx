"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { usePaginatedQuery, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ProductCard } from "@/components/store/ProductCardClient"
import { CategoryPills } from "@/components/store/CategoryPillsClient"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal, X } from "lucide-react"
import { useAnalytics } from "@/hooks/useAnalytics"

type SortOption = "newest" | "priceAsc" | "priceDesc"

type StoreFilters = {
  sort: SortOption
  featuredOnly: boolean
  inStockOnly: boolean
  minPrice: number | null
  maxPrice: number | null
}

const defaultFilters: StoreFilters = {
  sort: "newest",
  featuredOnly: false,
  inStockOnly: false,
  minPrice: null,
  maxPrice: null,
}

function normalizeFilters(
  filters: StoreFilters,
  bounds: { minPrice: number; maxPrice: number } | null | undefined
): StoreFilters {
  let minPrice = filters.minPrice
  let maxPrice = filters.maxPrice

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    ;[minPrice, maxPrice] = [maxPrice, minPrice]
  }

  if (bounds) {
    if (minPrice !== null) {
      minPrice = Math.max(bounds.minPrice, minPrice)
      if (minPrice <= bounds.minPrice) minPrice = null
    }

    if (maxPrice !== null) {
      maxPrice = Math.min(bounds.maxPrice, maxPrice)
      if (maxPrice >= bounds.maxPrice) maxPrice = null
    }
  }

  return {
    ...filters,
    minPrice,
    maxPrice,
  }
}

type PriceInputsProps = {
  minPrice: number | null
  maxPrice: number | null
  onChange: (minPrice: number | null, maxPrice: number | null) => void
  className?: string
}

function PriceInputs({ minPrice, maxPrice, onChange, className }: PriceInputsProps) {
  const parsePriceInput = (raw: string, prevCents: number | null) => {
    const trimmed = raw.trim()
    if (trimmed === "") return null

    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) return prevCents

    const dollars = Math.max(0, Math.round(parsed))
    return dollars * 100
  }

  return (
    <div className={className}>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={minPrice !== null ? (minPrice / 100).toFixed(0) : ""}
        onChange={(e) => {
          const nextMin = parsePriceInput(e.target.value, minPrice)
          onChange(nextMin, maxPrice)
        }}
        placeholder="Min ($)"
        className="h-12 min-h-[44px] w-full rounded-full border-[#002684]/20 bg-white/60 px-4 text-[#002684] placeholder:text-[#002684]/40"
      />
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={maxPrice !== null ? (maxPrice / 100).toFixed(0) : ""}
        onChange={(e) => {
          const nextMax = parsePriceInput(e.target.value, maxPrice)
          onChange(minPrice, nextMax)
        }}
        placeholder="Max ($)"
        className="h-12 min-h-[44px] w-full rounded-full border-[#002684]/20 bg-white/60 px-4 text-[#002684] placeholder:text-[#002684]/40"
      />
    </div>
  )
}

export default function StorePage() {
  const priceBounds = useQuery(api.products.getActivePriceBounds)
  const [draftFilters, setDraftFilters] = useState<StoreFilters>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<StoreFilters>(defaultFilters)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const { viewItemList } = useAnalytics()
  const hasTrackedRef = useRef(false)

  const normalizedAppliedFilters = useMemo(
    () => normalizeFilters(appliedFilters, priceBounds),
    [appliedFilters, priceBounds]
  )

  const filtersForQuery = useMemo(() => {
    const f = normalizedAppliedFilters
    const isDefault =
      f.sort === "newest" &&
      !f.featuredOnly &&
      !f.inStockOnly &&
      f.minPrice === null &&
      f.maxPrice === null
    return isDefault ? null : f
  }, [normalizedAppliedFilters])

  const paginationArgs = useMemo(() => {
    return filtersForQuery ? { filters: filtersForQuery } : {}
  }, [filtersForQuery])

  const {
    results: products,
    status: productsStatus,
    loadMore,
  } = usePaginatedQuery(
    api.products.listActiveFiltered,
    paginationArgs,
    { initialNumItems: 20 }
  )

  const categories = useQuery(api.categories.listActive)

  const isProductsLoading = productsStatus === "LoadingFirstPage"
  const canLoadMoreProducts = productsStatus === "CanLoadMore"
  const isLoadingMoreProducts = productsStatus === "LoadingMore"
  const isCategoriesLoading = !categories

  // Track product list view
  useEffect(() => {
    if (!isProductsLoading && products.length > 0 && !hasTrackedRef.current) {
      hasTrackedRef.current = true
      viewItemList(
        products.map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
        })),
        "Store - All Products"
      )
    }
  }, [isProductsLoading, products, viewItemList])

  const activeChips = useMemo(() => {
    const f = filtersForQuery
    if (!f) return [] as Array<{ key: string; label: string }>

    const chips: Array<{ key: string; label: string }> = []

    if (f.sort === "priceAsc") chips.push({ key: "sort", label: "Price: Low to High" })
    if (f.sort === "priceDesc") chips.push({ key: "sort", label: "Price: High to Low" })
    if (f.featuredOnly) chips.push({ key: "featuredOnly", label: "Featured" })
    if (f.inStockOnly) chips.push({ key: "inStockOnly", label: "In Stock" })

    if (f.minPrice !== null || f.maxPrice !== null) {
      const min = f.minPrice !== null ? (f.minPrice / 100).toFixed(0) : "0"
      const max = f.maxPrice !== null ? (f.maxPrice / 100).toFixed(0) : "∞"
      chips.push({ key: "price", label: `Price: $${min}–$${max}` })
    }

    return chips
  }, [filtersForQuery])

  const activeCount = activeChips.length

  const applyFilters = (next: StoreFilters) => {
    const normalized = normalizeFilters(next, priceBounds)
    setAppliedFilters(normalized)
    setDraftFilters(normalized)
  }

  const clearFilters = () => {
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  return (
    <div className="flex flex-col w-full">
      {/* Promotional Banner */}
      <div className="relative mb-12 w-full overflow-hidden rounded-[2rem] bg-[#002684] px-6 py-12 text-center text-white shadow-sm md:px-12 md:py-20">
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="mb-4 font-serif text-h1 font-bold leading-tight">
            Curated with Care
          </h2>
          <p className="text-body leading-relaxed opacity-90">
            Find the perfect gift for every occasion from our premium selection.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-12">
        <h1 className="text-h1 font-serif font-bold leading-tight text-[#002684] mb-3">
          Our Collection
        </h1>
        <p className="text-body leading-relaxed text-[#002684]/70 max-w-2xl">
          Hand-curated gift baskets for every occasion.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-col gap-4 mb-8 md:mb-12 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:flex-1">
          {isCategoriesLoading ? (
            <div className="flex justify-center gap-2">
              <Skeleton className="h-10 w-20 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-20 rounded-full" />
            </div>
          ) : (
            <CategoryPills categories={categories || []} />
          )}
        </div>

        <Sheet
          open={isFilterSheetOpen}
          onOpenChange={(open) => {
            setIsFilterSheetOpen(open)
            if (open) {
              setDraftFilters(appliedFilters)
            }
          }}
        >
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-6 text-[#002684] hover:bg-white"
            >
              <SlidersHorizontal className="size-4" />
              Filter
              {activeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[#1d4ed8] px-2 py-1 text-sm-fluid font-semibold leading-none text-white">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-[#f7f4ee] rounded-l-2xl flex h-full flex-col overflow-hidden"
          >
            <SheetHeader className="px-4 pt-4">
              <SheetTitle className="font-serif text-h3 font-semibold leading-tight text-[#002684]">
                Filters
              </SheetTitle>
              <SheetDescription className="text-body leading-relaxed text-[#002684]/70">
                Narrow down your search.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="flex flex-col gap-4 px-4 pb-4">
                <Separator className="bg-[#002684]/10" />

                <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
                  <p className="text-sm-fluid text-[#002684]/70">Sort</p>
                  <Select
                    value={draftFilters.sort}
                    onValueChange={(value) =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        sort: value as SortOption,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 min-h-[44px] w-full rounded-full border-[#002684]/20 bg-white/60 px-4 text-[#002684]">
                      <SelectValue placeholder="Newest" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#f7f4ee] border-[#002684]/10">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                      <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
                  <p className="text-sm-fluid text-[#002684]/70">Quick filters</p>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          featuredOnly: !prev.featuredOnly,
                        }))
                      }
                      className={
                        draftFilters.featuredOnly
                          ? "h-12 min-h-[44px] justify-between rounded-full border-[#1d4ed8] bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
                          : "h-12 min-h-[44px] justify-between rounded-full border-[#002684]/20 bg-white/60 px-6 text-[#002684] hover:bg-white"
                      }
                    >
                      Featured only
                      <span className="text-sm-fluid font-semibold">
                        {draftFilters.featuredOnly ? "On" : "Off"}
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          inStockOnly: !prev.inStockOnly,
                        }))
                      }
                      className={
                        draftFilters.inStockOnly
                          ? "h-12 min-h-[44px] justify-between rounded-full border-[#1d4ed8] bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
                          : "h-12 min-h-[44px] justify-between rounded-full border-[#002684]/20 bg-white/60 px-6 text-[#002684] hover:bg-white"
                      }
                    >
                      In stock only
                      <span className="text-sm-fluid font-semibold">
                        {draftFilters.inStockOnly ? "On" : "Off"}
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl bg-white/60 p-3">
                  <p className="text-sm-fluid text-[#002684]/70">Price range</p>
                  {priceBounds ? (
                    <div className="flex flex-col gap-4">
                      <Slider
                        min={Math.floor(priceBounds.minPrice / 100)}
                        max={Math.ceil(priceBounds.maxPrice / 100)}
                        value={[
                          draftFilters.minPrice !== null
                            ? Math.round(draftFilters.minPrice / 100)
                            : Math.floor(priceBounds.minPrice / 100),
                          draftFilters.maxPrice !== null
                            ? Math.round(draftFilters.maxPrice / 100)
                            : Math.ceil(priceBounds.maxPrice / 100),
                        ]}
                        onValueChange={(value) => {
                          setDraftFilters((prev) => ({
                            ...prev,
                            minPrice: value[0] * 100,
                            maxPrice: value[1] * 100,
                          }))
                        }}
                        className="h-12"
                      />

                      <PriceInputs
                        minPrice={draftFilters.minPrice}
                        maxPrice={draftFilters.maxPrice}
                        onChange={(minPrice, maxPrice) => {
                          setDraftFilters((prev) => ({
                            ...prev,
                            minPrice,
                            maxPrice,
                          }))
                        }}
                        className="flex flex-col gap-3 md:flex-row"
                      />
                    </div>
                  ) : (
                    <PriceInputs
                      minPrice={draftFilters.minPrice}
                      maxPrice={draftFilters.maxPrice}
                      onChange={(minPrice, maxPrice) => {
                        setDraftFilters((prev) => ({
                          ...prev,
                          minPrice,
                          maxPrice,
                        }))
                      }}
                      className="flex flex-col gap-3"
                    />
                  )}
                </div>
              </div>
            </div>

            <SheetFooter className="px-4 pb-4">
              <SheetClose asChild>
                <Button
                  type="button"
                  onClick={() => applyFilters(draftFilters)}
                  className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] text-white hover:bg-[#1d4ed8]/90"
                >
                  Apply
                </Button>
              </SheetClose>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 text-[#002684] hover:bg-white"
              >
                Clear
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-col gap-3 mb-8 md:mb-12">
          <div className="flex flex-wrap gap-3">
            {activeChips.map((chip) => (
              <Button
                key={chip.key}
                type="button"
                variant="outline"
                onClick={() => {
                  if (chip.key === "sort") {
                    applyFilters({ ...appliedFilters, sort: "newest" })
                    return
                  }
                  if (chip.key === "featuredOnly") {
                    applyFilters({ ...appliedFilters, featuredOnly: false })
                    return
                  }
                  if (chip.key === "inStockOnly") {
                    applyFilters({ ...appliedFilters, inStockOnly: false })
                    return
                  }
                  if (chip.key === "price") {
                    applyFilters({ ...appliedFilters, minPrice: null, maxPrice: null })
                    return
                  }
                }}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-5 text-[#002684] hover:bg-white"
              >
                {chip.label}
                <X className="size-4 opacity-60" />
              </Button>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-5 text-[#002684] hover:bg-white"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {isProductsLoading
          ? [...Array(8)].map((_, i) => (
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

      {!isProductsLoading && canLoadMoreProducts && (
        <div className="flex flex-col items-center justify-center pt-10">
          <Button
            type="button"
            onClick={() => loadMore(20)}
            disabled={isLoadingMoreProducts}
            className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-8 text-white hover:bg-[#1d4ed8]/90 disabled:opacity-60"
          >
            {isLoadingMoreProducts ? (
              <span className="inline-flex items-center gap-2">
                <Spinner className="size-4" />
                Loading
              </span>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}

      {!isProductsLoading && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 md:py-20">
          <div className="w-full max-w-2xl rounded-2xl bg-white/60 p-6 md:p-8 text-center">
            <h2 className="font-serif text-h3 font-semibold leading-tight text-[#002684]">
              {activeChips.length > 0 ? "No products match your filters" : "No products available yet"}
            </h2>
            <p className="mt-2 text-body leading-relaxed text-[#002684]/70">
              {activeChips.length > 0
                ? "Try clearing your filters or adjusting the price range."
                : "We’re curating the collection right now. Check back soon."}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {activeChips.length > 0 && (
                <Button
                  type="button"
                  onClick={clearFilters}
                  className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-8 text-white hover:bg-[#1d4ed8]/90"
                >
                  Clear filters
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFilterSheetOpen(true)}
                className="h-12 min-h-[44px] rounded-full border-[#002684]/20 bg-white/60 px-8 text-[#002684] hover:bg-white"
              >
                Adjust filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
