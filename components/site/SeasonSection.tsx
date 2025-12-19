"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function SeasonSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    const text = textRef.current

    if (!container || !text) return

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      gsap.set(text, { opacity: 1, y: 0, clearProps: "transform" })
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(text, { y: 100, opacity: 0 })
      gsap.to(text, {
        y: -50,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom",
          end: "center center",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, container)

    ScrollTrigger.refresh()

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-[#002684] py-20 md:py-32"
    >
      {/* Decorative background elements - CSS Pattern instead of image */}
      <div 
        className="absolute inset-0 opacity-10 mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 10%), 
                            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.5) 0%, transparent 5%)`
        }}
      ></div>
      
      {/* Centered Text */}
      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-8 text-center">
        <h2 
          ref={textRef}
          className="text-h1 font-serif font-bold leading-tight text-white"
        >
          Because you have enough on your plate.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-body leading-relaxed text-white/80">
          We take the stress out of saying "Thank You." Simply choose a basket, and we’ll do the rest.
        </p>
      </div>
    </section>
  )
}
