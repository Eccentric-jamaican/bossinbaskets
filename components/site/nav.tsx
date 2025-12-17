"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function Nav() {
  const { isSignedIn } = useUser()

  return (
    <header className="w-full bg-[#f7f4ee]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex flex-col gap-3 py-3">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-2xl bg-white px-3 py-2 md:px-4">
            <div className="flex items-center justify-start gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:text-[#002684]/80"
                  >
                    Menu
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader className="border-b">
                    <SheetTitle className="text-h3 font-medium">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 p-4">
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                      <Link href="#">Blue Apron+</Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                      <Link href="#">Autoship &amp; Save</Link>
                    </Button>

                    <div className="h-px w-full bg-border" />

                    {!isSignedIn && (
                      <>
                        <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                          <Link href="/sign-in">Login</Link>
                        </Button>
                        <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </>
                    )}

                    <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90">
                      <Link href="#">Shop now</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <nav className="hidden lg:flex items-center gap-1">
                <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                  <Link href="#">Blue Apron+</Link>
                </Button>
                <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                  <Link href="#">Autoship &amp; Save</Link>
                </Button>
              </nav>
            </div>

            <Link href="/" className="justify-self-center text-h3 font-bold leading-tight text-[#002684]">
              BossinBaskets
            </Link>

            <div className="flex items-center justify-end gap-2">
              <div className="hidden lg:flex flex-col gap-2 lg:flex-row lg:items-center">
                {!isSignedIn && (
                  <>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                      <Link href="/sign-in">Login</Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>

              <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90">
                <Link href="#">Shop now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
