"use client"

import { Gift, PenLine, Truck } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Gift,
      title: "Select Your Impact.",
      description: "Browse our collection of hand-picked gifts for every occasion."
    },
    {
      icon: PenLine,
      title: "Personalize",
      description: "Make it personal. We include a beautiful handwritten-style note with every basket, completely free of charge."
    },
    {
      icon: Truck,
      title: "We handle the rest",
      description: "We handle the logistics. Fast, reliable delivery across Jamaica."
    }
  ]

  return (
    <section className="w-full bg-[#f7f4ee] py-16 md:py-24 border-t border-[#002684]/5">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 md:mb-16">
          <h2 className="text-h2 font-serif font-bold text-[#002684] mb-4">
            How we handle making you look good at gifting
          </h2>
          <p className="text-body text-[#002684]/70 max-w-2xl">
            Browse our collections designed for client retention, employee milestones, and celebrations.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#1d4ed8]/10 text-[#1d4ed8] transition-all group-hover:scale-110 group-hover:bg-[#1d4ed8] group-hover:text-white">
                <step.icon className="h-10 w-10" />
              </div>
              <h3 className="text-h3 font-serif font-bold text-[#002684] mb-3">
                {step.title}
              </h3>
              <p className="text-body text-[#002684]/70 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
