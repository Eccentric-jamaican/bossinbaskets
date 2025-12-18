"use client"

import { useEffect, useRef, useCallback } from "react"
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
 * Re-syncs if user data changes during an in-progress sync.
 */
export default function UserSync() {
  const { isLoaded, isSignedIn, user } = useUser()
  const upsertUser = useMutation(api.users.upsert)
  const isSyncingRef = useRef(false)
  const lastSyncedRef = useRef<string | null>(null)
  const pendingSnapshotRef = useRef<string | null>(null)

  const getSnapshot = useCallback(() => {
    if (!user) return null
    const email = user.primaryEmailAddress?.emailAddress
    if (!email) return null
    const name = user.fullName ?? user.username ?? ""
    return { snapshot: `${user.id}|${email}|${name}`, clerkId: user.id, email, name }
  }, [user])

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return
    }

    const data = getSnapshot()
    if (!data) return

    const { snapshot } = data

    if (snapshot === lastSyncedRef.current) return

    if (isSyncingRef.current) {
      pendingSnapshotRef.current = snapshot
      return
    }

    const doSync = async () => {
      isSyncingRef.current = true

      while (true) {
        const currentData = getSnapshot()
        if (!currentData) break

        const { snapshot: currentSnapshot, clerkId, email, name } = currentData

        if (currentSnapshot === lastSyncedRef.current) break

        try {
          await upsertUser({
            clerkId,
            email,
            name: name || undefined,
          })
          lastSyncedRef.current = currentSnapshot
        } catch (err) {
          console.error("Failed to sync user to Convex:", err)
          break
        }

        if (pendingSnapshotRef.current === null || pendingSnapshotRef.current === currentSnapshot) {
          pendingSnapshotRef.current = null
          break
        }

        pendingSnapshotRef.current = null
      }

      isSyncingRef.current = false
    }

    void doSync()
  }, [isLoaded, isSignedIn, user, upsertUser, getSnapshot])

  return null
}
