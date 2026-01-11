"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Star, Truck, ShieldCheck, Gift } from "lucide-react"
import { toast } from "sonner"
import { useErrorNotice } from "@/hooks/useErrorNotice"
import { useAnalytics } from "@/hooks/useAnalytics"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isSignedIn } = useUser()
  const slug = params.slug as string
  const product = useQuery(api.products.getBySlug, { slug })
  const addToCart = useMutation(api.cart.add)
  const { showError } = useErrorNotice({
    title: "We couldn't add that to your cart",
    fallbackDescription: "Please refresh or try again shortly.",
  })
  const { viewItem, addToCart: trackAddToCart } = useAnalytics()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addToCartError, setAddToCartError] = useState<string | null>(null)
  const [addToCartSuccess, setAddToCartSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!product || product.images.length === 0) return
    if (selectedImageIndex < 0 || selectedImageIndex >= product.images.length) {
      setSelectedImageIndex(0)
    }
  }, [product, selectedImageIndex])

  // Track product view
  useEffect(() => {
    if (product) {
      viewItem({
        id: product._id,
        name: product.name,
        price: product.price,
      })
    }
  }, [product, viewItem])

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

  const imageUrl =
    product.images?.[selectedImageIndex] ?? product.images?.[0] ?? "/placeholder.jpg"

  const maxQuantity = Math.max(1, product.inventory)
  const isDecrementDisabled = isAddingToCart || quantity <= 1
  const isIncrementDisabled = isAddingToCart || quantity >= maxQuantity

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const handleIncrement = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1))
  }

  const totalPriceLabel = ((product.price * quantity) / 100).toFixed(2)

  const handleAddToCart = async () => {
    const query = searchParams?.toString()
    const currentUrl = query ? `${pathname}?${query}` : pathname

    if (!isSignedIn) {
      const message = "Please sign in to add baskets to your cart."
      setAddToCartError(message)
      showError(message, {
        title: "Sign in required",
        actionLabel: "Sign in",
        onAction: () => {
          router.push(`/sign-in?returnUrl=${encodeURIComponent(currentUrl ?? "/store")}`)
        },
      })
      return
    }

    setAddToCartError(null)
    setAddToCartSuccess(null)
    setIsAddingToCart(true)

    try {
      await addToCart({
        productId: product._id,
        quantity,
      })
      setAddToCartSuccess("Added to cart")
      toast.success("Basket added", {
        description: "It's waiting for you in the cart when you're ready.",
      })
      // Track add to cart
      trackAddToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        quantity,
      })
    } catch (error) {
      const friendlyMessage = showError(error, {
        context: "Cart action",
      })
      setAddToCartError(friendlyMessage)
    } finally {
      setIsAddingToCart(false)
    }
  }

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
                type="button"
                onClick={() => setSelectedImageIndex(i)}
                className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  i === selectedImageIndex
                    ? "border-[#1d4ed8]"
                    : "border-transparent hover:border-[#1d4ed8]"
                }`}
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
              <div className="h-14 w-32 rounded-full border border-[#002684]/20 bg-white/60 flex items-center justify-between px-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDecrement}
                  disabled={isDecrementDisabled}
                  aria-label="Decrease quantity"
                  className="h-12 min-h-[44px] w-12 min-w-[44px] rounded-full text-[#002684] hover:bg-white"
                >
                  -
                </Button>
                <span className="text-body font-medium text-[#002684]">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleIncrement}
                  disabled={isIncrementDisabled}
                  aria-label="Increase quantity"
                  className="h-12 min-h-[44px] w-12 min-w-[44px] rounded-full text-[#002684] hover:bg-white"
                >
                  +
                </Button>
              </div>

              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="flex-1 h-14 min-h-[44px] rounded-full font-semibold bg-[#1d4ed8] hover:bg-[#1d4ed8]/90 text-white shadow-lg shadow-[#1d4ed8]/20 disabled:opacity-60"
              >
                {isAddingToCart ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner className="size-4" />
                    Adding
                  </span>
                ) : (
                  `Add to Cart - $${totalPriceLabel}`
                )}
              </Button>
            </div>
          ) : (
             <Button disabled className="w-full h-14 min-h-[44px] rounded-full font-semibold bg-gray-200 text-gray-500">
               Out of Stock
             </Button>
          )}

          {addToCartError && (
            <p className="text-sm-fluid text-red-600">{addToCartError}</p>
          )}

          {!addToCartError && addToCartSuccess && (
            <p className="text-sm-fluid text-[#1d4ed8] text-left">{addToCartSuccess}</p>
          )}
          
          {/* <p className="text-center text-xs text-[#002684]/50 mt-2">
           secure checkout powered by Stripe
          </p> */}
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
