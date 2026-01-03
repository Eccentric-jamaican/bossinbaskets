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
 * Uses setTimeout to re-sync with fresh closure if data changed during sync.
 */
export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const upsertUser = useMutation(api.users.upsert)
  const isSyncingRef = useRef(false)
  const lastSyncedRef = useRef<string | null>(null)
  const pendingSnapshotRef = useRef<string | null>(null)
  const syncFnRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const doSync = async () => {
      if (!isLoaded || !isSignedIn || !user) return
      if (isSyncingRef.current) return

      const email = user.primaryEmailAddress?.emailAddress
      if (!email) return

      const name = user.fullName ?? user.username ?? ""
      const snapshot = `${user.id}|${email}|${name}`

      if (snapshot === lastSyncedRef.current) return

      isSyncingRef.current = true
      pendingSnapshotRef.current = null

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

        if (pendingSnapshotRef.current !== null && pendingSnapshotRef.current !== snapshot) {
          pendingSnapshotRef.current = null
          setTimeout(() => syncFnRef.current?.(), 0)
        }
      }
    }

    syncFnRef.current = doSync

    if (!isLoaded || !isSignedIn || !user) return

    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return

    const name = user.fullName ?? user.username ?? ""
    const snapshot = `${user.id}|${email}|${name}`

    if (snapshot === lastSyncedRef.current) return

    if (isSyncingRef.current) {
      pendingSnapshotRef.current = snapshot
      return
    }

    void doSync()
  }, [isLoaded, isSignedIn, user, upsertUser])

  return null
}
