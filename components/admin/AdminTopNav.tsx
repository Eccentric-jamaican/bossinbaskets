"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products" },
]

export function AdminTopNav() {
  const pathname = usePathname()

  return (
    <header className="w-full">
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 md:p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm-fluid text-muted-foreground">Dashboard</p>
            <Link href="/admin" className="text-h3 font-medium text-[#002684]">
              Admin
            </Link>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Button
              asChild
              variant="outline"
              className="h-12 min-h-[44px] rounded-full px-6"
            >
              <Link href="/store">View store</Link>
            </Button>
          </div>
        </div>

        <nav className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                asChild
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "h-12 min-h-[44px] justify-start rounded-full px-6",
                  isActive
                    ? "bg-[#1d4ed8] text-white hover:bg-[#1d4ed8]/90"
                    : "text-[#002684] hover:bg-[#002684]/5"
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
