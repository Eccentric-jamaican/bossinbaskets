import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Doc } from "@/convex/_generated/dataModel"

interface ProductCardProps {
  product: Doc<"products">
}

export function ProductCard({ product }: ProductCardProps) {
  const images = (product as { images?: unknown }).images
  const firstImage =
    Array.isArray(images) && images.length > 0 ? (images[0] as unknown) : null
  const imageUrl =
    typeof firstImage === "string" && firstImage.trim() !== ""
      ? firstImage
      : "/placeholder.jpg"

  return (
    <Link href={`/store/products/${product.slug}`} className="group block h-full">
      <div className="flex flex-col gap-4 h-full">
        {/* Image Frame */}
        <div className="relative aspect-[4/5] w-full rounded-[2rem] bg-white p-3 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
          {/* Badge */}
          {product.isFeatured && (
            <Badge className="absolute top-5 left-5 z-10 bg-[#fbbf24] text-[#002684] hover:bg-[#fbbf24] border-none font-bold rounded-full px-3 shadow-sm">
              Featured
            </Badge>
          )}

          {/* Image Container */}
          <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-gray-100">
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 px-2 flex-grow">
          <div>
            <h3 className="text-h3 font-medium text-[#002684] leading-tight group-hover:text-[#1d4ed8] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </div>

          <p className="text-sm-fluid text-[#002684]/70 line-clamp-2 leading-relaxed min-h-[2.5em]">
            {product.shortDescription || product.description}
          </p>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col">
              <span className="text-body font-semibold text-[#002684]">
                ${(product.price / 100).toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm-fluid text-[#002684]/40 line-through">
                  ${(product.compareAtPrice / 100).toFixed(2)}
                </span>
              )}
            </div>
            
            <span className="inline-flex items-center justify-center h-12 min-h-[44px] rounded-full border border-[#1d4ed8] px-6 text-sm-fluid font-semibold text-[#1d4ed8] transition-all group-hover:bg-[#1d4ed8] group-hover:text-white">
              View
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
