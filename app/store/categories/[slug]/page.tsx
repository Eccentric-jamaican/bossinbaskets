import { cache } from "react"
import { notFound } from "next/navigation"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { ProductCard } from "@/components/store/ProductCard"
import { CategoryPills } from "@/components/store/CategoryPills"

const getCategoryPageData = cache(async (slug: string) => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file")
  }

  const convex = new ConvexHttpClient(url)

  // Fetch category first to get ID
  const category = await convex.query(api.categories.getBySlug, { slug })
  const allCategories = await convex.query(api.categories.listActive, {})

  if (!category) {
    return { category, allCategories, products: [] }
  }

  // Fetch products by category ID once we have it
  const productsResult = await convex.query(api.products.listByCategory, {
    categoryId: category._id,
    paginationOpts: { numItems: 20, cursor: null },
  })

  return { category, allCategories, products: productsResult.page }
})

export default async function CategoryPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams?.slug

  if (!slug) {
    notFound()
  }

  const { category, allCategories, products } = await getCategoryPageData(slug)

  if (category === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684] mb-2">
          Category Not Found
        </h1>
        <p className="text-body leading-relaxed text-[#002684]/70">
          The category you are looking for does not exist.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-8 md:mb-12">
        <h1 className="text-h1 font-serif font-bold leading-tight text-[#002684] mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-body leading-relaxed text-[#002684]/70 max-w-2xl">
            {category.description}
          </p>
        )}
      </div>

      {/* Category Tabs */}
      <CategoryPills categories={allCategories} activeSlug={slug} className="mb-8 md:mb-12" />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-[#002684]/50">
          <p className="text-body leading-relaxed">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
