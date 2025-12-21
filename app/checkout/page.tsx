"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { CheckCircle, ChevronLeft, CreditCard, Truck } from "lucide-react"
import { toast } from "sonner"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { useErrorNotice } from "@/hooks/useErrorNotice"

type Step = "shipping" | "payment" | "confirmation"

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function CheckoutPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()

  const cartItems = useQuery(api.cart.get)
  const currentUser = useQuery(api.users.current)
  const placeOrder = useMutation(api.orders.createFromCart)
  const { showError } = useErrorNotice({
    title: "We couldn't place that order",
    context: "Checkout",
    fallbackDescription: "Please review your details and try again shortly.",
  })

  const [step, setStep] = useState<Step>("shipping")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0)

  // Shipping form state
  const [recipientName, setRecipientName] = useState("")
  const [street, setStreet] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [country, setCountry] = useState("United States")
  const [phone, setPhone] = useState("")

  // Gift options
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState("")

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash_on_delivery">("cash_on_delivery")

  // Pre-fill from user's default address
  const defaultAddress = currentUser?.defaultAddress
  useEffect(() => {
    if (!defaultAddress) return

    setStreet((prev) => (prev.trim() ? prev : defaultAddress.street))
    setCity((prev) => (prev.trim() ? prev : defaultAddress.city))
    setState((prev) => (prev.trim() ? prev : defaultAddress.state))
    setZipCode((prev) => (prev.trim() ? prev : defaultAddress.zipCode))
    setCountry((prev) => (prev.trim() ? prev : defaultAddress.country))
    setPhone((prev) => (prev.trim() ? prev : (defaultAddress.phone ?? "")))
  }, [defaultAddress])

  // Calculate totals
  const subtotalCents = (cartItems ?? []).reduce((sum, item) => {
    if (!item.product) return sum
    return sum + item.product.price * item.quantity
  }, 0)
  const shippingCost = subtotalCents >= 10000 ? 0 : 999
  const tax = Math.round(subtotalCents * 0.08)
  const total = subtotalCents + shippingCost + tax

  // Validation
  const isShippingValid =
    recipientName.trim() &&
    street.trim() &&
    city.trim() &&
    state.trim() &&
    zipCode.trim() &&
    country.trim()

  const handlePlaceOrder = async () => {
    if (!isShippingValid) {
      const message = "Please fill in your shipping address before placing the order."
      setError(message)
      showError(message, { title: "Shipping details missing" })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Store total before placing order (cart will be cleared after)
      const finalTotal = total

      const orderId = await placeOrder({
        shippingAddress: {
          recipientName: recipientName.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          country: country.trim(),
          phone: phone.trim() || undefined,
        },
        isGift,
        giftMessage: isGift ? giftMessage.trim() || undefined : undefined,
        paymentMethod,
      })

      // Store the confirmed total and order ID
      setConfirmedTotal(finalTotal)
      setOrderNumber(orderId)
      setStep("confirmation")
    } catch (err) {
      const friendly = showError(err)
      setError(friendly)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading states
  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="h-8 w-8 text-[#1d4ed8]" />
        <p className="text-body text-[#002684]/70">Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <h1 className="text-h2 font-serif font-semibold text-[#002684]">Sign in to checkout</h1>
        <p className="text-body text-[#002684]/70 text-center max-w-md">
          Please sign in to complete your purchase.
        </p>
        <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (cartItems === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="h-8 w-8 text-[#1d4ed8]" />
        <p className="text-body text-[#002684]/70">Loading cart...</p>
      </div>
    )
  }

  if (cartItems.length === 0 && step !== "confirmation") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <h1 className="text-h2 font-serif font-semibold text-[#002684]">Your cart is empty</h1>
        <p className="text-body text-[#002684]/70 text-center max-w-md">
          Add some items to your cart before checking out.
        </p>
        <Button asChild className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white">
          <Link href="/store">Browse products</Link>
        </Button>
      </div>
    )
  }

  // Confirmation step
  if (step === "confirmation") {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-h1 font-serif font-bold text-[#002684]">Order Placed!</h1>
          <p className="text-body text-[#002684]/70 max-w-md">
            Thank you for your order. We&apos;ll send you an email confirmation shortly.
          </p>

          {orderNumber && (
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm-fluid text-[#002684]/70">Order Number</p>
              <p className="text-body font-medium text-[#002684] break-all">{orderNumber}</p>
            </div>
          )}

          {paymentMethod === "bank_transfer" && (
            <Card className="w-full rounded-2xl">
              <CardHeader>
                <CardTitle className="text-h3 font-medium text-[#002684]">
                  Bank Transfer Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-left">
                <p className="text-body text-[#002684]/70">
                  Please transfer <strong>{formatCents(confirmedTotal)}</strong> to the following account:
                </p>
                <div className="flex flex-col gap-2 rounded-xl bg-[#f7f4ee] p-4">
                  <div className="flex justify-between">
                    <span className="text-sm-fluid text-[#002684]/70">Bank Name</span>
                    <span className="text-body font-medium text-[#002684]">First National Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm-fluid text-[#002684]/70">Account Name</span>
                    <span className="text-body font-medium text-[#002684]">BossinBaskets LLC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm-fluid text-[#002684]/70">Account Number</span>
                    <span className="text-body font-medium text-[#002684]">1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm-fluid text-[#002684]/70">Routing Number</span>
                    <span className="text-body font-medium text-[#002684]">021000021</span>
                  </div>
                </div>
                <p className="text-sm-fluid text-[#002684]/70">
                  Please include your order number in the transfer reference. Your order will be processed once payment is confirmed.
                </p>
              </CardContent>
            </Card>
          )}

          {paymentMethod === "cash_on_delivery" && (
            <Card className="w-full rounded-2xl">
              <CardHeader>
                <CardTitle className="text-h3 font-medium text-[#002684]">
                  Cash on Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body text-[#002684]/70">
                  Please have <strong>{formatCents(confirmedTotal)}</strong> ready when your order arrives. Our delivery person will collect payment upon delivery.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
            <Button asChild variant="outline" className="h-12 min-h-[44px] rounded-full px-6">
              <Link href="/store">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8 py-6 md:py-10">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="h-12 min-h-[44px] rounded-full px-3">
            <Link href="/store">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back to store</span>
            </Link>
          </Button>
          <h1 className="text-h2 font-serif font-semibold text-[#002684]">Checkout</h1>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === "shipping" ? "text-[#1d4ed8]" : "text-[#002684]/50"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === "shipping" ? "bg-[#1d4ed8] text-white" : "bg-[#002684]/10 text-[#002684]/50"}`}>
              1
            </div>
            <span className="hidden sm:inline text-body font-medium">Shipping</span>
          </div>
          <div className="h-px w-8 bg-[#002684]/20" />
          <div className={`flex items-center gap-2 ${step === "payment" ? "text-[#1d4ed8]" : "text-[#002684]/50"}`}>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${step === "payment" ? "bg-[#1d4ed8] text-white" : "bg-[#002684]/10 text-[#002684]/50"}`}>
              2
            </div>
            <span className="hidden sm:inline text-body font-medium">Payment</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main form */}
          <div className="flex flex-col gap-6">
            {step === "shipping" && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-h3 font-medium text-[#002684]">
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="John Doe"
                      className="h-12 min-h-[44px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Main St"
                      className="h-12 min-h-[44px]"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        className="h-12 min-h-[44px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        className="h-12 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="10001"
                        className="h-12 min-h-[44px]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="United States"
                        className="h-12 min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-12 min-h-[44px]"
                    />
                  </div>

                  <div className="h-px w-full bg-border my-2" />

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="isGift"
                      checked={isGift}
                      onCheckedChange={(checked) => setIsGift(checked === true)}
                    />
                    <Label htmlFor="isGift" className="cursor-pointer">
                      This is a gift
                    </Label>
                  </div>

                  {isGift && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="giftMessage">Gift Message (optional)</Label>
                      <Textarea
                        id="giftMessage"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        placeholder="Write a personal message..."
                        className="min-h-[100px]"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => setStep("payment")}
                    disabled={!isShippingValid}
                    className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90 mt-4"
                  >
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "payment" && (
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-h3 font-medium text-[#002684]">
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
                    className="flex flex-col gap-4"
                  >
                    <label
                      htmlFor="cod"
                      className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                        paymentMethod === "cash_on_delivery"
                          ? "border-[#1d4ed8] bg-[#1d4ed8]/5"
                          : "border-border hover:border-[#002684]/30"
                      }`}
                    >
                      <RadioGroupItem value="cash_on_delivery" id="cod" className="mt-1" />
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-[#002684]" />
                          <span className="text-body font-medium text-[#002684]">Cash on Delivery</span>
                        </div>
                        <p className="text-sm-fluid text-[#002684]/70">
                          Pay when your order arrives. Our delivery person will collect payment.
                        </p>
                      </div>
                    </label>

                    <label
                      htmlFor="bank"
                      className={`flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-colors ${
                        paymentMethod === "bank_transfer"
                          ? "border-[#1d4ed8] bg-[#1d4ed8]/5"
                          : "border-border hover:border-[#002684]/30"
                      }`}
                    >
                      <RadioGroupItem value="bank_transfer" id="bank" className="mt-1" />
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-[#002684]" />
                          <span className="text-body font-medium text-[#002684]">Bank Transfer</span>
                        </div>
                        <p className="text-sm-fluid text-[#002684]/70">
                          Transfer funds directly to our bank account. Order will be processed after payment confirmation.
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="outline"
                      onClick={() => setStep("shipping")}
                      className="h-12 min-h-[44px] rounded-full px-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90 flex-1"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Spinner className="h-4 w-4" />
                          Placing Order...
                        </span>
                      ) : (
                        `Place Order • ${formatCents(total)}`
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-h3 font-medium text-[#002684]">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {cartItems?.map((item) => (
                    <div key={String(item._id)} className="flex gap-3">
                      <img
                        src={item.product?.images?.[0] ?? "/placeholder.jpg"}
                        alt={item.product?.name ?? "Product"}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <p className="text-body font-medium text-[#002684] truncate">
                          {item.product?.name ?? "Product"}
                        </p>
                        <p className="text-sm-fluid text-[#002684]/70">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-body font-medium text-[#002684]">
                        {item.product ? formatCents(item.product.price * item.quantity) : "—"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="h-px w-full bg-border" />

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="text-body text-[#002684]/70">Subtotal</span>
                    <span className="text-body font-medium text-[#002684]">{formatCents(subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body text-[#002684]/70">Shipping</span>
                    <span className="text-body font-medium text-[#002684]">
                      {shippingCost === 0 ? "Free" : formatCents(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body text-[#002684]/70">Tax (8%)</span>
                    <span className="text-body font-medium text-[#002684]">{formatCents(tax)}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border" />

                <div className="flex justify-between">
                  <span className="text-body font-semibold text-[#002684]">Total</span>
                  <span className="text-h3 font-semibold text-[#002684]">{formatCents(total)}</span>
                </div>

                {subtotalCents < 10000 && (
                  <p className="text-sm-fluid text-[#002684]/70 text-center">
                    Add {formatCents(10000 - subtotalCents)} more for free shipping!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
