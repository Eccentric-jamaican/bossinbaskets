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

const STATUS_BADGE_STYLES: Record<Doc<"orders">["status"], string> = {
  confirmed: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100/90",
  shipped: "bg-blue-100 text-blue-700 hover:bg-blue-100/90",
  delivered: "bg-green-100 text-green-700 hover:bg-green-100/90",
  pending: "bg-amber-100 text-amber-700 hover:bg-amber-100/90",
  processing: "bg-violet-100 text-violet-700 hover:bg-violet-100/90",
  cancelled: "bg-red-100 text-red-700 hover:bg-red-100/90",
}

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
  const productCount = useQuery(api.products.getProductCount)

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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            key: "revenue",
            label: "Recent Orders Revenue",
            value: formatCurrency(recentOrdersRevenue),
            icon: DollarSign,
            iconAccent: "bg-emerald-50 text-emerald-600",
            skeletonWidth: "w-24",
            isLoading,
          },
          {
            key: "total-orders",
            label: "Total Orders",
            value: totalOrders.toLocaleString(),
            icon: ShoppingCart,
            iconAccent: "bg-blue-50 text-blue-600",
            skeletonWidth: "w-16",
            isLoading,
          },
          {
            key: "pending-orders",
            label: "Pending Orders",
            value: pendingOrders.toLocaleString(),
            icon: Clock,
            iconAccent: "bg-amber-50 text-amber-600",
            skeletonWidth: "w-14",
            isLoading,
          },
          {
            key: "products",
            label: "Products",
            value: (productCount ?? 0).toLocaleString(),
            icon: Package,
            iconAccent: "bg-purple-50 text-purple-600",
            skeletonWidth: "w-12",
            isLoading: productCount === undefined,
          },
        ].map((metric) => (
          <div
            key={metric.key}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.08)] md:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  metric.iconAccent,
                )}
              >
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-sm-fluid text-muted-foreground">{metric.label}</p>
                {metric.isLoading ? (
                  <Skeleton className={cn("mt-2 h-7", metric.skeletonWidth)} />
                ) : (
                  <p className="text-h3 font-semibold leading-tight text-gray-900">
                    {metric.value}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
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
                  {orders.map((order: Doc<"orders">) => (
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
                            STATUS_BADGE_STYLES[order.status] ?? ""
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

