"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Newsletter() {
  return (
    <section className="w-full bg-[#002684] py-16 md:py-24 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Join the family
            </h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-md mx-auto md:mx-0">
              Sign up for exclusive offers, new basket drops, and gifting tips delivered to your inbox.
            </p>
          </div>

          {/* Form */}
          <div className="flex-1 w-full max-w-md">
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200/70 focus-visible:ring-white/30"
              />
              <Button 
                type="submit" 
                className="h-12 px-8 bg-[#fbbf24] text-[#002684] font-bold hover:bg-[#fbbf24]/90 whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-blue-300 mt-3 text-center md:text-left">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
