"use client"

import { Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"

interface Testimonial {
  quote: string
  author: string
  role: string
  rating: number
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      quote: "I sent a basket to my mom for her birthday and she was in tears. The presentation was absolutely stunning and the products were delicious.",
      author: "Sarah Mitchell",
      role: "Verified Buyer",
      rating: 5
    },
    {
      quote: "Finally a gift basket that doesn't feel generic. You can tell real care went into selecting these items. My team loved the holiday baskets!",
      author: "James Wilson",
      role: "Corporate Client",
      rating: 5
    },
    {
      quote: "Super fast shipping and the handwritten note was such a nice touch. It felt like I packed it myself, but without the stress.",
      author: "Emily Chen",
      role: "Verified Buyer",
      rating: 5
    },
    {
      quote: "The 'Spa Indulgence' basket was a hit with my wife. High quality products and beautiful packaging. Will definitely order again.",
      author: "Michael Ross",
      role: "Verified Buyer",
      rating: 5
    }
  ]

  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <h2 className="text-h2 font-serif font-bold text-[#002684] mb-4">
            From our family to yours
          </h2>
          <p className="text-body text-[#002684]/70 max-w-2xl">
            Join thousands of happy gifters spreading joy one basket at a time.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-none bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="flex flex-col justify-between h-full p-6 md:p-8">
                    <div>
                      <div
                        className="flex gap-1 mb-4"
                        role="img"
                        aria-label={`${testimonial.rating} out of 5 stars`}
                      >
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            aria-hidden="true"
                            className="h-5 w-5 fill-[#fbbf24] text-[#fbbf24]"
                          />
                        ))}
                      </div>
                      <blockquote className="text-body text-[#002684]/80 leading-relaxed mb-6 font-medium">
                        "{testimonial.quote}"
                      </blockquote>
                    </div>
                    <div>
                      <div className="font-serif font-bold text-[#002684] text-body">
                        {testimonial.author}
                      </div>
                      <div className="text-sm-fluid text-[#002684]/50 font-medium uppercase tracking-wide">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center gap-4 mt-8">
            <CarouselPrevious className="static translate-y-0 border-[#002684]/20 text-[#002684] hover:bg-[#002684] hover:text-white" />
            <CarouselNext className="static translate-y-0 border-[#002684]/20 text-[#002684] hover:bg-[#002684] hover:text-white" />
          </div>
        </Carousel>

      </div>
    </section>
  )
}
