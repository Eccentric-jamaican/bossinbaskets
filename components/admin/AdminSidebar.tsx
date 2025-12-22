"use client"

import { useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Store,
  Menu,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const isNavItemActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)

  const handleNavigate = () => {
    setIsMobileNavOpen(false)
  }

  return (
    <>
      {/* Mobile trigger + sheet */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-white">
          <Link href="/admin" className="text-base font-semibold text-brand-heading">
            Bossin Baskets
          </Link>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open navigation menu"
            aria-controls="admin-mobile-nav"
            aria-expanded={isMobileNavOpen}
            onClick={() => setIsMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetContent
            side="left"
            className="w-full max-w-xs p-0"
            id="admin-mobile-nav"
            aria-label="Admin navigation"
          >
            <SheetHeader className="border-b px-4 py-4 text-left">
              <SheetTitle className="text-lg font-semibold text-brand-heading">
                Navigation
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-heading",
                      isActive && "bg-brand-primary/10 text-brand-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <Link
                href="/store"
                onClick={handleNavigate}
                className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-muted transition hover:bg-brand-primary/10 hover:text-brand-heading"
              >
                <Store className="h-4 w-4" />
                <span>View Store</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsible="icon">
          {/* Header / Logo */}
          <SidebarHeader className="px-4 py-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 text-brand-heading transition-opacity hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                Bossin Baskets
              </span>
            </Link>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = isNavItemActive(item.href)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className={cn(
                            "h-11 px-3 text-brand-muted hover:bg-brand-primary/5 hover:text-brand-heading",
                            isActive &&
                            "bg-brand-primary/10 text-brand-primary font-medium hover:bg-brand-primary/15 hover:text-brand-primary"
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="px-3 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="View Store"
                  className="h-11 px-3 text-brand-muted hover:bg-brand-primary/5 hover:text-brand-heading"
                >
                  <Link href="/store">
                    <Store className="h-5 w-5" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  )
}
