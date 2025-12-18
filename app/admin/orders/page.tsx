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

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const StatusIcon = STATUS_CONFIG[order.status].icon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick()
          return
        }

        if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault()
          onClick()
        }
      }}
      className="flex flex-col gap-3 rounded-xl border bg-white p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-body font-medium text-[#002684] truncate">{order.orderNumber}</p>
          <p className="text-sm-fluid text-[#002684]/70">{order.shippingAddress.recipientName}</p>
        </div>
        <Badge className={`${STATUS_CONFIG[order.status].color} flex items-center gap-1 shrink-0`}>
          <StatusIcon className="h-3 w-3" />
          {STATUS_CONFIG[order.status].label}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm-fluid">
        <span className="text-[#002684]/70">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
        <span className="font-semibold text-[#002684]">{formatCents(order.total)}</span>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm-fluid text-[#002684]/50">
        <span>{formatDate(order._creationTime)}</span>
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          <span>{order.paymentMethod === "bank_transfer" ? "Bank" : "COD"}</span>
          {order.paymentStatus === "paid" && <CheckCircle className="h-3 w-3 text-green-600" />}
        </div>
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
            <Card key={status} className="rounded-xl">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-h3 font-semibold text-[#002684]">{statusCounts[status]}</span>
                  <span className="text-sm-fluid text-[#002684]/70">{config.label}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map((status) => {
              const config = STATUS_CONFIG[status]
              const orders = ordersGrouped[status].filter(
                (order) =>
                  order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  order.shippingAddress.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
              )

              return (
                <div key={status} className="flex flex-col gap-3 w-72 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={config.color}>{config.label}</Badge>
                      <span className="text-sm-fluid text-[#002684]/50">{orders.length}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl bg-[#002684]/5 p-3 min-h-[200px]">
                    {orders.length === 0 ? (
                      <p className="text-sm-fluid text-[#002684]/50 text-center py-8">No orders</p>
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
