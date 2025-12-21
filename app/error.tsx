"use client"

import Link from "next/link"
import { RefreshCcw, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4 py-16 text-white">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl bg-white/5 p-10 text-center shadow-2xl ring-1 ring-white/10 backdrop-blur">
        <span className="text-sm-fluid uppercase tracking-[0.4em] text-white/70">Something went wrong</span>
        <div className="space-y-4">
          <h1 className="text-h1 font-serif text-white">We lost the thread on this basket.</h1>
          <p className="text-body leading-relaxed text-white/80">
            {error?.message ?? "An unexpected error occurred. You can try again or head back to the last safe spot."}
          </p>
          {error?.digest ? (
            <p className="text-sm-fluid text-white/50">Error digest: {error.digest}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => reset()}
            className="h-12 min-h-[44px] rounded-full bg-white text-[#0f172a] hover:bg-white/90"
          >
            <span className="inline-flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </span>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-h-[44px] rounded-full border-white/30 text-white hover:bg-white/10"
          >
            <Link href="/">
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go back home
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
