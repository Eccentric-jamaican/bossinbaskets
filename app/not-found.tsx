import Link from "next/link"
import { ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f1eb] px-4 py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 rounded-3xl bg-white/90 p-10 text-center shadow-xl shadow-[#002684]/5">
        <span className="rounded-full border border-[#002684]/20 px-4 py-1 text-sm-fluid uppercase tracking-[0.3em] text-[#002684]/70">
          404
        </span>
        <div className="space-y-4">
          <h1 className="text-h1 font-serif text-[#002684]">Lost in the gift aisle?</h1>
          <p className="text-body leading-relaxed text-[#002684]/70">
            The page you were looking for has moved or never existed. Let&apos;s guide you back to the
            baskets that actually exist.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
          >
            <Link href="/">
              <span className="inline-flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go home
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-h-[44px] rounded-full border-[#002684]/20 text-[#002684]"
          >
            <Link href="/store">
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Browse baskets
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
