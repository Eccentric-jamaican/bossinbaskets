import type { ReactNode } from "react"

import AdminGate from "@/components/admin/AdminGate"
import { AdminTopNav } from "@/components/admin/AdminTopNav"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <div className="flex flex-col w-full">
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6 md:py-10">
          <div className="flex flex-col gap-6">
            <AdminTopNav />
            {children}
          </div>
        </div>
      </div>
    </AdminGate>
  )
}
