"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

/**
 * Syncs the Clerk user to the Convex users table.
 * This component should be rendered inside ConvexClientProvider
 * so that all authenticated users get created in Convex.
 */
export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const upsertUser = useMutation(api.users.upsert)
  const upsertStartedRef = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      upsertStartedRef.current = false
      return
    }

    if (upsertStartedRef.current) return

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return

    upsertStartedRef.current = true

    void upsertUser({
      clerkId: user.id,
      email,
      name: user.fullName ?? user.username ?? undefined,
    }).catch((err) => {
      console.error("Failed to sync user to Convex:", err)
      upsertStartedRef.current = false
    })
  }, [isLoaded, isSignedIn, user, upsertUser])

  return null
}
