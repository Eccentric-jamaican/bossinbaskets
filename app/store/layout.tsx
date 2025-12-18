import { ReactNode } from "react"
import type { Metadata } from "next"
import Nav from "@/components/site/nav"

export const metadata: Metadata = {
  title: "Store | BossinBaskets",
  description: "Shop curated gift baskets for every occasion. Filter by featured items, in-stock availability, and price.",
  alternates: {
    canonical: "/store",
  },
  openGraph: {
    title: "Store | BossinBaskets",
    description:
      "Shop curated gift baskets for every occasion. Filter by featured items, in-stock availability, and price.",
    type: "website",
  },
}

export default function StoreLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col font-sans bg-[#f7f4ee]">
      <Nav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  )
}
