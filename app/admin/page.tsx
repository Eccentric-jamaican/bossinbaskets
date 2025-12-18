import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 font-serif font-semibold leading-tight text-[#002684]">
          Admin Dashboard
        </h1>
        <p className="text-body leading-relaxed text-[#002684]/70">
          Manage products and storefront content.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-h3 font-medium text-[#002684]">
              Orders
            </CardTitle>
            <p className="text-body leading-relaxed text-[#002684]/70">
              View and manage customer orders.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
            >
              <Link href="/admin/orders">Manage orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-h3 font-medium text-[#002684]">
              Categories
            </CardTitle>
            <p className="text-body leading-relaxed text-[#002684]/70">
              Create and organize product categories.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
            >
              <Link href="/admin/categories">Manage categories</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-h3 font-medium text-[#002684]">
              Products
            </CardTitle>
            <p className="text-body leading-relaxed text-[#002684]/70">
              Create, edit, and publish gift baskets.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              asChild
              className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
            >
              <Link href="/admin/products">Manage products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
