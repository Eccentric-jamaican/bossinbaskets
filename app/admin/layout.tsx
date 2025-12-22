import type { ReactNode } from "react"

import AdminGate from "@/components/admin/AdminGate"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminGate>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className="bg-gray-50">
          {/* Top bar with sidebar trigger */}
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white px-4 md:px-6 lg:px-8">
            <SidebarTrigger className="h-9 w-9" />
            <span className="text-sm font-medium text-muted-foreground">
              Admin Panel
            </span>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminGate>
  )
}
