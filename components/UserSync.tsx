"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

/**
 * Syncs the Clerk user to the Convex users table.
 * This component should be rendered inside ConvexClientProvider
 * so that all authenticated users get created in Convex.
 *
 * Uses a snapshot hash to detect changes and avoid duplicate syncs.
 * Only updates lastSyncedRef after a successful upsert.
 */
export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const upsertUser = useMutation(api.users.upsert)
  const isSyncingRef = useRef(false)
  const lastSyncedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return
    }

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return

    const name = user.fullName ?? user.username ?? ""
    const snapshot = `${user.id}|${email}|${name}`

    if (snapshot === lastSyncedRef.current) return
    if (isSyncingRef.current) return

    const doSync = async () => {
      isSyncingRef.current = true
      try {
        await upsertUser({
          clerkId: user.id,
          email,
          name: name || undefined,
        })
        lastSyncedRef.current = snapshot
      } catch (err) {
        console.error("Failed to sync user to Convex:", err)
      } finally {
        isSyncingRef.current = false
      }
    }

    void doSync()
  }, [isLoaded, isSignedIn, user, upsertUser])

  return null
}
