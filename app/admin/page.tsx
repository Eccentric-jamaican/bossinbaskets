"use client"

import { useQuery } from "convex/react"
import {
  DollarSign,
  ShoppingCart,
  Clock,
  Package,
  Users,
} from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function AdminDashboardPage() {
  // Use proper pagination for orders
  const ordersResult = useQuery(api.orders.listAll, {
    paginationOpts: { cursor: null, numItems: 5 },
  })
  const orders = ordersResult?.page as Doc<"orders">[] | undefined

  // Get counts from dedicated query
  const statusCounts = useQuery(api.orders.getStatusCounts)
  const products = useQuery(api.products.listAllAdmin, { limit: 100 })

  // Calculate metrics
  const totalOrders = statusCounts?.total ?? 0
  const pendingOrders = (statusCounts?.pending ?? 0) + (statusCounts?.processing ?? 0)
  const recentOrdersRevenue = orders?.reduce((sum: number, order: Doc<"orders">) => sum + (order.total ?? 0), 0) ?? 0

  const isLoading = orders === undefined || statusCounts === undefined

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-h2 font-semibold leading-tight text-gray-900">
          Dashboard
        </h1>
        <p className="text-body text-muted-foreground">
          Overview of your store performance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Recent Orders Revenue */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Recent Orders Revenue</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(recentOrdersRevenue)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Pending Orders</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
            )}
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">Products</p>
            {products === undefined ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {products?.length ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Section */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead className="min-w-[150px]">Customer</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.slice(0, 5).map((order: Doc<"orders">) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        #{String(order._id).slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                            <Users className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="truncate font-medium text-gray-900">
                            {order.shippingAddress?.recipientName ?? "Guest"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "rounded-full px-2.5 py-0.5 font-medium",
                            order.status === "confirmed" &&
                            "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/90",
                            order.status === "shipped" &&
                            "bg-blue-100 text-blue-700 hover:bg-blue-100/90",
                            order.status === "delivered" &&
                            "bg-green-100 text-green-700 hover:bg-green-100/90",
                            order.status === "pending" &&
                            "bg-amber-100 text-amber-700 hover:bg-amber-100/90",
                            order.status === "processing" &&
                            "bg-violet-100 text-violet-700 hover:bg-violet-100/90",
                            order.status === "cancelled" &&
                            "bg-red-100 text-red-700 hover:bg-red-100/90"
                          )}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order._creationTime)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.total ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground/70">
                Orders will appear here once customers start purchasing.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

