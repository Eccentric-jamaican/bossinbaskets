"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Truck, ShieldCheck, Gift } from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = useQuery(api.products.getBySlug, { slug })

  if (product === undefined) {
    return <ProductSkeleton />
  }

  if (product === null) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-[#002684] mb-2">Product Not Found</h1>
        <p className="text-[#002684]/70">The product you are looking for does not exist.</p>
      </div>
    )
  }

  const imageUrl = product.images[0] || "/placeholder.jpg"

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      {/* Left: Images */}
      <div className="w-full lg:w-1/2">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-gray-100 shadow-sm">
          {product.isFeatured && (
            <Badge className="absolute top-6 left-6 z-10 bg-[#fbbf24] text-[#002684] hover:bg-[#fbbf24] border-none font-bold rounded-full px-4 py-1 shadow-sm text-sm">
              Featured
            </Badge>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover object-center"
          />
        </div>
        
        {/* Thumbnails would go here */}
        {product.images.length > 1 && (
          <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button 
                key={i}
                className="relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 border-transparent hover:border-[#1d4ed8] transition-all"
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Details */}
      <div className="w-full lg:w-1/2 flex flex-col pt-4">
        {/* Breadcrumb / Category link could go here */}
        
        <h1 className="text-h2 font-serif font-bold text-[#002684] mb-4 leading-tight">
          {product.name}
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-[#1d4ed8]/5 px-3 py-1 rounded-full">
            <span className="text-2xl font-bold text-[#002684]">
              ${(product.price / 100).toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-[#002684]/40 line-through decoration-2">
                ${(product.compareAtPrice / 100).toFixed(2)}
              </span>
            )}
          </div>
          
          {/* Mock Rating */}
          <div className="flex items-center gap-1">
            <div className="flex text-[#fbbf24]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium text-[#002684]/70 ml-1">(4.9)</span>
          </div>
        </div>

        <p className="text-body text-[#002684]/80 leading-relaxed mb-8">
          {product.description}
        </p>

        {/* Features / Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#002684]/10">
            <div className="p-2 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8]">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-[#002684]">Free shipping over $100</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#002684]/10">
            <div className="p-2 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-[#002684]">Quality Guarantee</span>
          </div>
          {product.allowCustomNote && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#002684]/10 sm:col-span-2">
              <div className="p-2 rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8]">
                <Gift className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium text-[#002684]">Includes handwritten gift note</span>
            </div>
          )}
        </div>

        <Separator className="bg-[#002684]/10 mb-8" />

        {/* Action Area */}
        <div className="flex flex-col gap-4 mt-auto">
          {product.inventory > 0 ? (
            <div className="flex gap-4">
               {/* Quantity Selector Placeholder */}
               <div className="h-14 w-24 rounded-full border border-[#002684]/20 flex items-center justify-center text-lg font-medium text-[#002684]">
                 1
               </div>
               
               <Button className="flex-1 h-14 rounded-full text-lg font-bold bg-[#1d4ed8] hover:bg-[#1d4ed8]/90 text-white shadow-lg shadow-[#1d4ed8]/20">
                 Add to Cart - ${(product.price / 100).toFixed(2)}
               </Button>
            </div>
          ) : (
             <Button disabled className="w-full h-14 rounded-full text-lg font-bold bg-gray-200 text-gray-500">
               Out of Stock
             </Button>
          )}
          
          <p className="text-center text-xs text-[#002684]/50 mt-2">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
      <Skeleton className="w-full lg:w-1/2 aspect-[4/5] rounded-[2.5rem]" />
      <div className="w-full lg:w-1/2 flex flex-col pt-4 gap-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
        <Skeleton className="h-px w-full my-4" />
        <div className="flex gap-4 mt-auto">
          <Skeleton className="h-14 w-24 rounded-full" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  )
}
