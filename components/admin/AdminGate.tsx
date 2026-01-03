"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function AdminGate({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser()
  const upsertUser = useMutation(api.users.upsert)
  const currentUser = useQuery(api.users.current)

  const upsertStartedRef = useRef(false)
  const [upsertError, setUpsertError] = useState<string | null>(null)

  useEffect(() => {
    if (!isClerkLoaded || !isSignedIn || !user) return
    if (upsertStartedRef.current) return

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return

    upsertStartedRef.current = true

    void upsertUser({
      clerkId: user.id,
      email,
      name: user.fullName ?? user.username ?? undefined,
    }).catch((err) => {
      setUpsertError(err instanceof Error ? err.message : String(err))
    })
  }, [isClerkLoaded, isSignedIn, upsertUser, user])

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f4ee]">
      <AuthLoading>
        <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 py-16 text-center gap-4">
          <Spinner className="h-8 w-8 text-[#1d4ed8]" />
          <p className="text-body leading-relaxed text-[#002684]/70">Loading…</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 py-16 text-center gap-6">
          <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
            Admin Sign In Required
          </h1>
          <p className="text-body leading-relaxed text-[#002684]/70 max-w-xl">
            Please sign in to access the admin dashboard.
          </p>
          <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentUser === undefined ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 py-16 text-center gap-4">
            <Spinner className="h-8 w-8 text-[#1d4ed8]" />
            <p className="text-body leading-relaxed text-[#002684]/70">Checking access…</p>
          </div>
        ) : currentUser === null ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 py-16 text-center gap-4">
            <Spinner className="h-8 w-8 text-[#1d4ed8]" />
            <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
              Setting up your account…
            </h1>
            <p className="text-body leading-relaxed text-[#002684]/70 max-w-xl">
              {upsertError
                ? upsertError
                : "This should only take a moment. If it doesn’t resolve, refresh the page."}
            </p>
          </div>
        ) : currentUser.role !== "admin" ? (
          <div className="flex flex-col items-center justify-center flex-1 px-4 md:px-8 py-16 text-center gap-6">
            <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
              Admin access required
            </h1>
            <p className="text-body leading-relaxed text-[#002684]/70 max-w-xl">
              Your account is signed in, but it doesn’t have admin permissions yet.
            </p>
            <Button asChild variant="outline" className="h-12 min-h-[44px] rounded-full px-6">
              <Link href="/">Back to site</Link>
            </Button>
          </div>
        ) : (
          children
        )}
      </Authenticated>
    </div>
  )
}
