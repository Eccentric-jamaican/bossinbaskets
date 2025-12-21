"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Eye,
  LayoutGrid,
  List,
  Package,
  Search,
  Truck,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
type ViewMode = "kanban" | "table"

type Order = {
  _id: Id<"orders">
  _creationTime: number
  orderNumber: string
  status: OrderStatus
  items: Array<{
    productId: Id<"products">
    productName: string
    productImage: string
    price: number
    quantity: number
    customNote?: string
  }>
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  shippingAddress: {
    recipientName: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    phone?: string
  }
  isGift: boolean
  giftMessage?: string
  paymentMethod: "bank_transfer" | "cash_on_delivery"
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  bankTransferRef?: string
  trackingNumber?: string
  shippedAt?: number
  deliveredAt?: number
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-purple-100 text-purple-800", icon: Package },
  shipped: { label: "Shipped", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: Ban },
}

const KANBAN_COLUMNS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

// Compact Premium Order Card
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  // Get top 3 product images
  const productImages = order.items.slice(0, 3).map(item => item.productImage)
  const remainingCount = order.items.length > 3 ? order.items.length - 3 : 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className="group flex flex-col gap-2 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-gray-950/5 transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate" title={order.orderNumber}>
          {order.orderNumber.length > 10 ? `#${order.orderNumber.slice(-6)}` : order.orderNumber}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
          {formatDate(order._creationTime).split(",")[0]}
        </span>
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{order.shippingAddress.recipientName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
      </div>

      <div className="flex items-center gap-1 mt-0.5">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="h-5 w-5 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-white shadow-sm ring-1 ring-gray-950/5 relative -ml-1 first:ml-0 z-0 hover:z-10 transition-transform hover:scale-110">
            {item.productImage ? (
              <img src={item.productImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <Package className="h-2.5 w-2.5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="h-5 w-5 rounded bg-gray-50 flex items-center justify-center text-[9px] font-medium text-gray-600 border border-white shadow-sm ring-1 ring-gray-950/5 -ml-1 z-0">
            +{remainingCount}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 mt-0.5">
        <Badge variant="outline" className={`border-0 px-1.5 py-0 h-4 text-[10px] capitalize ${STATUS_CONFIG[order.status].color.replace("text-", "bg-opacity-20 text-").replace("bg-", "bg-")}`}>
          {STATUS_CONFIG[order.status].label}
        </Badge>
        <span className="text-xs font-bold text-gray-900">{formatCents(order.total)}</span>
      </div>
    </div>
  )
}

function OrderDetailsDialog({
  order,
  open,
  onClose,
}: {
  order: Order | null
  open: boolean
  onClose: () => void
}) {
  const updateStatus = useMutation(api.orders.updateStatus)
  const updateTracking = useMutation(api.orders.updateTracking)
  const markPaymentReceived = useMutation(api.orders.markPaymentReceived)
  const cancelOrder = useMutation(api.orders.cancel)

  const [trackingNumber, setTrackingNumber] = useState("")
  const [bankRef, setBankRef] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setTrackingNumber("")
    setBankRef("")
    setIsUpdating(false)
  }, [order?._id, open])

  if (!order) return null

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true)
    try {
      await updateStatus({ orderId: order._id, status: newStatus })
      toast.success("Order status updated")
      return true
    } catch (err) {
      toast.error("Failed to update order status", {
        description: err instanceof Error ? err.message : String(err),
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) return
    setIsUpdating(true)
    try {
      await updateTracking({ orderId: order._id, trackingNumber: trackingNumber.trim() })
      setTrackingNumber("")
      toast.success("Tracking number updated")
      return true
    } catch (err) {
      toast.error("Failed to update tracking number", {
        description: err instanceof Error ? err.message : String(err),
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleMarkPaid = async () => {
    setIsUpdating(true)
    try {
      await markPaymentReceived({ orderId: order._id, bankTransferRef: bankRef.trim() || undefined })
      setBankRef("")
      toast.success("Payment marked as received")
      return true
    } catch (err) {
      toast.error("Failed to mark payment as received", {
        description: err instanceof Error ? err.message : String(err),
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? This will restore inventory.")) return
    setIsUpdating(true)
    try {
      await cancelOrder({ orderId: order._id })
      toast.success("Order cancelled")
      onClose()
      return true
    } catch (err) {
      toast.error("Failed to cancel order", {
        description: err instanceof Error ? err.message : String(err),
      })
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  const StatusIcon = STATUS_CONFIG[order.status].icon

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-h3 font-medium text-[#002684]">
            Order {order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="flex flex-col gap-6">
            {/* Status & Actions */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Badge className={`${STATUS_CONFIG[order.status].color} flex items-center gap-1 w-fit`}>
                <StatusIcon className="h-4 w-4" />
                {STATUS_CONFIG[order.status].label}
              </Badge>

              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isUpdating} className="h-10 min-h-[44px]">
                      Change Status
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {KANBAN_COLUMNS.filter((s) => s !== order.status && s !== "cancelled").map((status) => (
                      <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                        {STATUS_CONFIG[status].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {["pending", "confirmed"].includes(order.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="h-10 min-h-[44px]"
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-body font-medium text-[#002684]">Payment</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm-fluid text-[#002684]/70">Method</span>
                  <span className="text-body text-[#002684]">
                    {order.paymentMethod === "bank_transfer" ? "Bank Transfer" : "Cash on Delivery"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm-fluid text-[#002684]/70">Status</span>
                  <Badge
                    className={
                      order.paymentStatus === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
                {order.bankTransferRef && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm-fluid text-[#002684]/70">Reference</span>
                    <span className="text-body text-[#002684]">{order.bankTransferRef}</span>
                  </div>
                )}

                {order.paymentStatus === "pending" && order.paymentMethod === "bank_transfer" && (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
                    <Input
                      placeholder="Bank transfer reference (optional)"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      className="h-10"
                    />
                    <Button
                      onClick={handleMarkPaid}
                      disabled={isUpdating}
                      className="h-10 min-h-[44px] bg-green-600 hover:bg-green-700"
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-body font-medium text-[#002684]">Shipping</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="text-body text-[#002684]">
                  <p className="font-medium">{order.shippingAddress.recipientName}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p className="text-[#002684]/70">{order.shippingAddress.phone}</p>}
                </div>

                {order.trackingNumber && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm-fluid text-[#002684]/70">Tracking</span>
                    <span className="text-body font-medium text-[#002684]">{order.trackingNumber}</span>
                  </div>
                )}

                {!order.trackingNumber && ["confirmed", "processing"].includes(order.status) && (
                  <div className="flex gap-2 mt-2 pt-2 border-t">
                    <Input
                      placeholder="Tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="h-10 flex-1"
                    />
                    <Button
                      onClick={handleUpdateTracking}
                      disabled={isUpdating || !trackingNumber.trim()}
                      className="h-10 min-h-[44px]"
                    >
                      Add
                    </Button>
                  </div>
                )}

                {order.isGift && order.giftMessage && (
                  <div className="flex flex-col gap-1 pt-2 border-t">
                    <span className="text-sm-fluid text-[#002684]/70">Gift Message</span>
                    <p className="text-body text-[#002684] italic">&ldquo;{order.giftMessage}&rdquo;</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <Card className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-body font-medium text-[#002684]">
                  Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <img
                      src={item.productImage || "/placeholder.jpg"}
                      alt={item.productName}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <p className="text-body font-medium text-[#002684] truncate">{item.productName}</p>
                      <p className="text-sm-fluid text-[#002684]/70">
                        {formatCents(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-body font-semibold text-[#002684]">
                      {formatCents(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <div className="flex flex-col gap-2 pt-3 border-t text-body">
                  <div className="flex justify-between text-[#002684]/70">
                    <span>Subtotal</span>
                    <span>{formatCents(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#002684]/70">
                    <span>Shipping</span>
                    <span>{order.shippingCost === 0 ? "Free" : formatCents(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-[#002684]/70">
                    <span>Tax</span>
                    <span>{formatCents(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#002684]">
                    <span>Total</span>
                    <span>{formatCents(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <div className="flex flex-col gap-1 text-sm-fluid text-[#002684]/50">
              <p>Created: {formatDate(order._creationTime)}</p>
              {order.shippedAt && <p>Shipped: {formatDate(order.shippedAt)}</p>}
              {order.deliveredAt && <p>Delivered: {formatDate(order.deliveredAt)}</p>}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminOrdersPage() {
  const ordersGrouped = useQuery(api.orders.listAllGrouped)
  const statusCounts = useQuery(api.orders.getStatusCounts)

  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<Id<"orders"> | null>(null)

  // Flatten orders for table view
  const allOrders = ordersGrouped
    ? [...ordersGrouped.pending, ...ordersGrouped.confirmed, ...ordersGrouped.processing, ...ordersGrouped.shipped, ...ordersGrouped.delivered, ...ordersGrouped.cancelled]
    : []

  // Filter orders by search
  const filteredOrders = allOrders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shippingAddress.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOrder = selectedOrderId
    ? allOrders.find((order) => order._id === selectedOrderId) ?? null
    : null

  useEffect(() => {
    if (selectedOrderId && !selectedOrder) {
      setSelectedOrderId(null)
    }
  }, [selectedOrderId, selectedOrder])

  if (!ordersGrouped || !statusCounts) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner className="h-8 w-8 text-[#1d4ed8]" />
        <p className="text-body text-[#002684]/70">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 font-serif font-semibold text-[#002684]">Orders</h1>
          <p className="text-body text-[#002684]/70">
            {statusCounts.total} total orders
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#002684]/50" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 min-h-[44px] pl-10 w-full sm:w-64"
            />
          </div>

          <div className="flex rounded-full border bg-white p-1">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={`h-10 min-h-[44px] rounded-full px-4 ${viewMode === "kanban" ? "bg-[#1d4ed8] text-white" : ""}`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`h-10 min-h-[44px] rounded-full px-4 ${viewMode === "table" ? "bg-[#1d4ed8] text-white" : ""}`}
            >
              <List className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {KANBAN_COLUMNS.map((status) => {
          const config = STATUS_CONFIG[status]
          const Icon = config.icon
          return (
            <Card key={status} className="rounded-lg shadow-sm border-gray-100">
              <CardContent className="flex items-center gap-3 p-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${config.color} bg-opacity-10`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 leading-none">{statusCounts[status]}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{config.label}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="h-[calc(100vh-200px)] overflow-x-auto pb-2">
          <div className="flex h-full gap-4 px-1 min-w-max">
            {KANBAN_COLUMNS.map((status) => {
              const config = STATUS_CONFIG[status]
              const orders = ordersGrouped[status].filter(
                (order) =>
                  order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.shippingAddress.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
              )

              return (
                <div key={status} className="flex flex-col w-64 shrink-0 h-full">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{config.label}</span>
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-100 px-1.5 text-[10px] font-bold text-gray-600">
                        {orders.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className="flex-1 rounded-lg bg-gray-50/50 p-2 ring-1 ring-gray-200/50">
                    <ScrollArea className="h-full">
                      <div className="flex flex-col gap-2 pr-2 pb-2">
                        {orders.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                            <Package className="h-6 w-6 mb-1" />
                            <p className="text-[10px] font-medium uppercase tracking-wide">Empty</p>
                          </div>
                        ) : (
                          orders.map((order) => (
                            <OrderCard
                              key={String(order._id)}
                              order={order}
                              onClick={() => setSelectedOrderId(order._id)}
                            />
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <Card className="rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#002684]/5">
                <tr>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Order</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Customer</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Status</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Payment</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Total</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Date</th>
                  <th className="text-left p-4 text-sm-fluid font-semibold text-[#002684]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#002684]/50">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const StatusIcon = STATUS_CONFIG[order.status].icon
                    return (
                      <tr key={String(order._id)} className="border-t hover:bg-[#002684]/5">
                        <td className="p-4">
                          <span className="text-body font-medium text-[#002684]">{order.orderNumber}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-body text-[#002684]">{order.shippingAddress.recipientName}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={`${STATUS_CONFIG[order.status].color} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {STATUS_CONFIG[order.status].label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm-fluid text-[#002684]">
                              {order.paymentMethod === "bank_transfer" ? "Bank" : "COD"}
                            </span>
                            <Badge
                              className={
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-body font-semibold text-[#002684]">{formatCents(order.total)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm-fluid text-[#002684]/70">{formatDate(order._creationTime)}</span>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrderId(order._id)}
                            className="h-10 min-h-[44px]"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  )
}
