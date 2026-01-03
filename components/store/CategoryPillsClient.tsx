"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface CategoryPillsProps {
  categories: Doc<"categories">[]
  className?: string
}

export function CategoryPills({ categories, className }: CategoryPillsProps) {
  const pathname = usePathname()
  const isAllActive = pathname === "/store"

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <div className="flex w-max gap-2 p-1">
          <Link
            href="/store"
            className={cn(
              "inline-flex items-center justify-center h-12 min-h-[44px] rounded-full px-6 text-sm-fluid font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isAllActive
                ? "bg-[#1d4ed8] text-white"
                : "bg-transparent text-[#002684] hover:bg-[#1d4ed8]/10"
            )}
          >
            All
          </Link>
          {categories.map((category) => {
            const isActive = pathname === `/store/categories/${category.slug}`
            return (
              <Link
                key={category._id}
                href={`/store/categories/${category.slug}`}
                className={cn(
                  "inline-flex items-center justify-center h-12 min-h-[44px] rounded-full px-6 text-sm-fluid font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-[#1d4ed8] text-white"
                    : "bg-transparent text-[#002684] hover:bg-[#1d4ed8]/10"
                )}
              >
                {category.name}
              </Link>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  )
}
