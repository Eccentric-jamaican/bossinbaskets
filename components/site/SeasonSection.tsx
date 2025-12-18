"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function SeasonSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const text = textRef.current

    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      if (text) {
        text.style.opacity = "1"
        text.style.transform = "translateY(0)"
      }
      return
    }

    const anim =
      container && text
        ? gsap.fromTo(
            text,
            {
              y: 100,
              opacity: 0,
            },
            {
              y: -50,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: container,
                start: "top bottom",
                end: "center center",
                scrub: 1,
              },
            }
          )
        : null

    return () => {
      anim?.scrollTrigger?.kill()
      anim?.kill()
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
          'Tis the season <br className="hidden md:block" />
          <span className="italic text-[#fbbf24]">for giving</span>
        </h2>
      </div>
    </section>
  )
}
