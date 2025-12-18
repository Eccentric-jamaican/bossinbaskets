"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: number
  title: string
  description: string
  price: number
  unit: string
  image: string
  category: string
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "The Executive",
    description: "Best for showing appreciation to clients, with premium snacks.",
    price: 129.00,
    unit: "Kdo/box",
    image: "/placeholder-basket-1.jpg", 
    category: "Gourmet"
  },
  {
    id: 2,
    title: "Deluxe Celebration",
    description: "Feast sharing bag of treats perfect for team winnings.",
    price: 149.00,
    unit: "Kdo/bskt",
    image: "/placeholder-basket-2.jpg",
    category: "Gourmet"
  },
  {
    id: 3,
    title: "Taste of Tuscany",
    description: "Celebration of Italian flavors with wine and aromatics.",
    price: 175.00,
    unit: "Kdo/box",
    image: "/placeholder-basket-3.jpg",
    category: "Wine"
  },
  {
    id: 4,
    title: "Spa Indulgence",
    description: "Best spa calming kit with scents, wild berries and tea.",
    price: 179.00,
    unit: "Kdo/set",
    image: "/placeholder-basket-4.jpg",
    category: "Spa"
  }
]

export default function BossPicks() {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px bg-[#002684]/20 w-12 md:w-32" />
          <h2 className="text-h2 font-serif font-bold text-[#002684]">Boss Picks</h2>
          <div className="h-px bg-[#002684]/20 w-12 md:w-32" />
        </div>

        {/* Tabs Filter */}
        <Tabs defaultValue="all" className="flex flex-col items-center w-full">
          <TabsList className="bg-transparent h-auto flex-wrap justify-center gap-2 md:gap-6 mb-10">
            <TabsTrigger 
              value="all" 
              className="rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="gourmet" 
              className="rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              Gourmet
            </TabsTrigger>
            <TabsTrigger 
              value="spa" 
              className="rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              Spa
            </TabsTrigger>
            <TabsTrigger 
              value="chocolate" 
              className="rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              Chocolate
            </TabsTrigger>
            <TabsTrigger 
              value="wine" 
              className="rounded-full px-6 py-3 min-h-[44px] text-body font-medium data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white text-[#002684] hover:bg-[#1d4ed8]/10"
            >
              Wine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="w-full mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PRODUCTS.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </TabsContent>
           {/* Duplicate content for other tabs for mockup purposes */}
           <TabsContent value="gourmet" className="w-full mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PRODUCTS.filter(p => p.category === "Gourmet").map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </TabsContent>
          <TabsContent value="spa" className="w-full mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PRODUCTS.filter(p => p.category === "Spa").map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </TabsContent>
          <TabsContent value="chocolate" className="w-full mt-0">
             <div className="text-center text-muted-foreground py-10">No chocolate products yet.</div>
          </TabsContent>
          <TabsContent value="wine" className="w-full mt-0">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_PRODUCTS.filter(p => p.category === "Wine").map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </TabsContent>
        </Tabs>

      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image.trim() ? product.image : undefined

  return (
    <div className="group flex flex-col gap-5 h-full">
      {/* Image Frame */}
      <div className="relative aspect-[4/5] w-full rounded-[2.5rem] bg-white p-4 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
        
        {/* Badge */}
        {product.id === 1 && (
          <Badge className="absolute top-6 left-6 z-10 bg-[#fbbf24] text-[#002684] hover:bg-[#fbbf24] border-none font-bold rounded-full px-3 shadow-sm">
            Best Seller
          </Badge>
        )}
        
        {/* Image Container */}
        <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              loading="lazy"
              decoding="async"
              width={800}
              height={1000}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-t from-gray-200 to-gray-50 transition-transform duration-700 group-hover:scale-105">
              <span className="text-sm font-medium">Image: {product.title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 px-2">
        <div>
           <div className="text-sm-fluid font-bold uppercase tracking-wider text-[#fbbf24] mb-1">
             {product.category}
           </div>
           <h3 className="text-h3 font-bold font-serif text-[#002684] leading-tight group-hover:text-[#1d4ed8] transition-colors">
             {product.title}
           </h3>
        </div>
        
        <p className="text-body text-[#002684]/70 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-1">
           <span className="text-body font-bold text-[#002684]">${product.price.toFixed(2)}</span>
           <span className="text-sm-fluid text-[#002684]/40 font-medium">{product.unit}</span>
        </div>

        <Button 
          variant="outline" 
          className="mt-2 w-full rounded-full border-[#1d4ed8] text-[#1d4ed8] hover:bg-[#1d4ed8] hover:text-white h-11 font-semibold transition-all"
        >
          Shop {product.title}
        </Button>
      </div>
    </div>
  )
}
