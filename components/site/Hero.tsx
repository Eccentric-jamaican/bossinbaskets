"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const rotatingWords = [
  "clients",      
  "top talent",   
  "key partners", 
  "educators",    
  "VIPs"         
];

const placeholderPoster =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="

const videos = [
  {
    src: "/hero/Image_To_Video_Generation.mp4",
    objectPosition: "50% 20%",
    label: "Gourmet basket being prepared",
    captions: "/hero/captions/image-to-video-generation.vtt",
  },
  {
    src: "/hero/Image_To_Video_Generation (1).mp4",
    objectPosition: "50% 20%",
    label: "Hands tying a ribbon on a gift basket",
    captions: "/hero/captions/image-to-video-generation-1.vtt",
  },
  {
    src: "/hero/Insurance_Agent_Gifts_Client_Basket.mp4",
    objectPosition: "50% 35%",
    label: "Recipient receiving a curated gift basket",
    captions: "/hero/captions/insurance-agent-gifts-client-basket.vtt",
  },
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const [wordIndex, setWordIndex] = useState(0);
  const [wordFlipping, setWordFlipping] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(false);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      activeVideo.currentTime = 0;
      activeVideo.playbackRate = 0.7;
      activeVideo.play().catch(() => {});
    }

    const handleEnded = () => {
      setActiveIndex((i) => (i + 1) % videos.length);
    };

    activeVideo?.addEventListener("ended", handleEnded);

    return () => {
      activeVideo?.removeEventListener("ended", handleEnded);
    };
  }, [activeIndex, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsHeroInView(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.35 },
    );

    obs.observe(el);

    return () => {
      obs.disconnect();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!isHeroInView) return;

    let flipTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setWordFlipping(true);
      if (flipTimeout) window.clearTimeout(flipTimeout);
      flipTimeout = window.setTimeout(() => {
        setWordIndex((i) => (i + 1) % rotatingWords.length);
        setWordFlipping(false);
      }, 220);
    }, 1200);

    return () => {
      window.clearInterval(interval);
      if (flipTimeout) window.clearTimeout(flipTimeout);
      setWordFlipping(false);
    };
  }, [isHeroInView]);

  return (
    <section ref={sectionRef} className="w-full bg-[#f7f4ee]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex flex-col items-center gap-8 py-10 md:py-16">
          <h1 className="text-h1 font-serif font-bold text-center text-[#002684]">
            Show your{" "}
            <span
              className="inline-block italic text-[#fbbf24] transition-[transform,opacity] duration-300 will-change-transform"
              aria-hidden="true"
              style={{
                transform: wordFlipping ? "rotateX(90deg)" : "rotateX(0deg)",
                opacity: wordFlipping ? 0 : 1,
                transformOrigin: "50% 100%",
              }}
            >
              {rotatingWords[wordIndex]}
            </span>{" "}
            how much you appreciate them
            <span
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
              role="status"
            >
              {rotatingWords[wordIndex]}
            </span>
          </h1>

          <p className="text-body text-center text-[#002684]/70 max-w-xl">
             Premium curated gift baskets designed to strengthen client relationships and show appreciation
          </p>

          <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-10 text-body font-semibold text-white hover:bg-[#1d4ed8]/90">
            <Link href="/store">Shop gift baskets</Link>
          </Button>

          <div className="w-full overflow-hidden rounded-2xl bg-black/5 shadow-sm" aria-label="Featured gift basket videos">
            <div className="relative aspect-[16/9] w-full bg-neutral-900">
              {videos.map((video, index) => {
                const isActive = index === activeIndex
                return (
                  <video
                    key={video.src}
                    ref={(el) => {
                      videoRefs.current[index] = el
                    }}
                    src={video.src}
                    aria-label={video.label}
                    aria-roledescription="video"
                    aria-hidden={!isActive}
                    role="group"
                    muted
                    playsInline
                    preload={isActive ? "auto" : "none"}
                    poster={isActive ? undefined : placeholderPoster}
                    style={{ objectPosition: video.objectPosition }}
                    className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-700 ease-in-out ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <track
                      kind="captions"
                      src={video.captions}
                      label={`${video.label} captions`}
                      default={isActive}
                    />
                  </video>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
