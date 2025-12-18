"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/products", label: "Products" },
]

export function AdminTopNav() {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 min-h-[44px] rounded-full px-4 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open admin navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <SheetHeader className="p-4">
                  <SheetTitle className="text-h3 font-medium text-[#002684]">Menu</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 px-4 pb-4">
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
                        <Link href={item.href} onClick={() => setMobileNavOpen(false)}>
                          {item.label}
                        </Link>
                      </Button>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <nav className="hidden flex-col gap-2 lg:flex lg:flex-row lg:items-center">
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
