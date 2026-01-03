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
      quote: "I needed 15 baskets for my top policyholders before the Christmas rush. BossinBaskets handled everything—from the handwritten cards to the delivery. One client called me the same afternoon to say it was the nicest gift he'd received in years. Worth every cent for the peace of mind.",
      author: "Ricardo M.",
      role: "Insurance Executive",
      rating: 5
    },
    {
      quote: "Finding something that actually looks premium for our staff appreciation day is usually a headache. We ordered the 'Signature' tier and the quality was consistent across all 40 baskets. No generic fillers—just good stuff. Our team felt truly appreciated.",
      author: "Simone V.",
      role: "HR Operations",
      rating: 5
    },
    {
      quote: "Sent a basket to my daughter’s principal for Teacher’s Day. The way it was wrapped was so beautiful she didn't even want to open it! You can tell it wasn't just thrown together in a store. Definitely my new go-to for gifting.",
      author: "Karen T.",
      role: "Verified Buyer",
      rating: 5
    },
    {
      quote: "Delivery to New Kingston was so fast, and the local treats inside were a hit. The handwritten note made it feel like I personally picked every item. My client still talks about it months later.",
      author: "Daneisha P.",
      role: "Marketing Manager",
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
