import Link from "next/link"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"

interface CategoryPillsProps {
  categories: Doc<"categories">[]
  className?: string
  activeSlug?: string | null
}

export function CategoryPills({
  categories,
  className,
  activeSlug = null,
}: CategoryPillsProps) {
  const isAllActive = !activeSlug

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
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
          const isActive = activeSlug === category.slug
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
    </div>
  )
}
