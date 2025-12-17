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

    if (!container || !text) return

    // Parallax text reveal
    // The text will move slower than the scroll and fade in
    gsap.fromTo(
      text,
      {
        y: 100,
        opacity: 0,
      },
      {
        y: -50, // Move up as we scroll
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top bottom", // Start when container top hits bottom of viewport
          end: "center center", // End when container center hits center of viewport
          scrub: 1, // Tie animation to scroll bar with 1s lag for smoothness
        },
      }
    )
  }, [])

  return (
    <section 
      ref={containerRef} 
      className="relative w-full overflow-hidden bg-[#002684] py-32 md:py-48"
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
      <div className="container relative mx-auto px-4 text-center">
        <h2 
          ref={textRef}
          className="font-serif text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl"
        >
          'Tis the season <br className="hidden md:block" />
          <span className="italic text-[#fbbf24]">for giving</span>
        </h2>
      </div>
    </section>
  )
}
