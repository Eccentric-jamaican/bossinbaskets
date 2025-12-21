"use client"

import Link from "next/link"
import { useClerk, useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { Menu, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"

import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function Nav() {
  const { isSignedIn, isLoaded } = useUser()
  const { signOut } = useClerk()
  const currentUser = useQuery(api.users.current)
  const isAdmin = currentUser?.role === "admin"

  const cartCount = useQuery(api.cart.getCount)
  const cartItems = useQuery(api.cart.get)
  const updateQuantity = useMutation(api.cart.updateQuantity)
  const removeItem = useMutation(api.cart.remove)
  const clearCart = useMutation(api.cart.clear)

  const count = cartCount ?? 0
  const subtotalCents = (cartItems ?? []).reduce((sum, item) => {
    if (!item.product) return sum
    return sum + item.product.price * item.quantity
  }, 0)

  return (
    <header className="w-full bg-[#f7f4ee]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-white px-3 py-2 md:px-4">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[40px] min-w-[40px] lg:hidden text-[#002684] hover:text-[#002684]/80"
                    aria-label="Open menu"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0">
                  <SheetHeader className="border-b">
                    <SheetTitle className="text-h3 font-medium">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-3 p-4">
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                      <Link href="/">Home</Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                      <Link href="/store">Shop</Link>
                    </Button>

                    <div className="h-px w-full bg-border" />

                    {isLoaded && !isSignedIn && (
                      <>
                        <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                          <Link href="/sign-in">Login</Link>
                        </Button>
                        <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                          <Link href="/sign-up">Sign Up</Link>
                        </Button>
                      </>
                    )}

                    {isLoaded && isSignedIn && (
                      <Button
                        variant="ghost"
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80"
                      >
                        Sign Out
                      </Button>
                    )}

                    {currentUser && isAdmin && (
                      <>
                        <div className="h-px w-full bg-border" />
                        <Button asChild variant="ghost" className="h-12 min-h-[44px] justify-start text-body text-[#002684] hover:text-[#002684]/80">
                          <Link href="/admin">Admin Dashboard</Link>
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="text-h3 font-bold leading-tight text-[#002684]">
                BossinBaskets
              </Link>

              {currentUser && isAdmin && (
                <nav className="hidden lg:flex items-center gap-1 ml-4">
                  <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                    <Link href="/admin">Admin</Link>
                  </Button>
                </nav>
              )}
            </div>

            <div className="flex items-center gap-1 lg:gap-2">
              <div className="hidden lg:flex flex-col gap-2 lg:flex-row lg:items-center">
                {isLoaded && !isSignedIn && (
                  <>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                      <Link href="/sign-in">Login</Link>
                    </Button>
                    <Button asChild variant="ghost" className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80">
                      <Link href="/sign-up">Sign Up</Link>
                    </Button>
                  </>
                )}
                {isLoaded && isSignedIn && (
                  <Button
                    variant="ghost"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="h-12 min-h-[44px] px-3 text-body font-semibold text-[#002684] hover:bg-transparent hover:text-[#002684]/80"
                  >
                    Sign Out
                  </Button>
                )}
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="relative h-10 w-10 min-h-[40px] min-w-[40px] lg:h-12 lg:w-auto lg:min-h-[44px] lg:px-4 rounded-full text-[#002684]"
                    aria-label="Open cart"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="hidden lg:inline text-body font-semibold ml-2">Cart</span>
                    {count > 0 ? (
                      <span className="absolute -top-1 -right-1 lg:-top-2 inline-flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-semibold leading-none text-white">
                        {count}
                      </span>
                    ) : null}
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="p-0">
                  <SheetHeader className="border-b">
                    <SheetTitle className="text-h3 font-medium">Your cart</SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-4 p-4">
                    {cartItems === undefined ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Spinner className="h-6 w-6 text-[#1d4ed8]" />
                        <p className="text-body leading-relaxed text-[#002684]/70">
                          Loading…
                        </p>
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="flex flex-col gap-3">
                        <p className="text-body leading-relaxed text-[#002684]/70">
                          Your cart is empty.
                        </p>
                        <Button
                          asChild
                          className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
                        >
                          <Link href="/store">Browse products</Link>
                        </Button>
                      </div>
                    ) : (
                      <ScrollArea className="max-h-[60vh]">
                        <div className="flex flex-col gap-4 pr-2">
                          {cartItems.map((item) => {
                            const product = item.product
                            const imageUrl =
                              product?.images?.[0] ?? "/placeholder.jpg"
                            const isIncrementDisabled =
                              !product || product.inventory <= 0 || item.quantity >= product.inventory
                            const isDecrementDisabled = item.quantity <= 1

                            return (
                              <div
                                key={String(item._id)}
                                className="flex flex-col gap-3 rounded-2xl border bg-white p-4"
                              >
                                <div className="flex gap-3">
                                  <img
                                    src={imageUrl}
                                    alt={product?.name ?? "Product"}
                                    className="h-20 w-20 min-w-[80px] rounded-xl object-cover"
                                  />

                                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    <p className="text-body font-medium text-[#002684] truncate">
                                      {product?.name ?? "Unavailable product"}
                                    </p>
                                    {product ? (
                                      <p className="text-sm-fluid text-[#002684]/70">
                                        {formatCents(product.price)}
                                      </p>
                                    ) : null}

                                    {product && product.inventory === 0 ? (
                                      <p className="text-sm-fluid text-red-600">Out of stock</p>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="flex items-center gap-2 rounded-full border bg-white/60 px-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() =>
                                        void updateQuantity({
                                          cartItemId: item._id,
                                          quantity: item.quantity - 1,
                                        })
                                      }
                                      disabled={isDecrementDisabled}
                                      aria-label="Decrease quantity"
                                      className="h-12 min-h-[44px] w-12 min-w-[44px] rounded-full text-[#002684] hover:bg-white"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>

                                    <span className="text-body font-medium text-[#002684] w-10 text-center">
                                      {item.quantity}
                                    </span>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() =>
                                        void updateQuantity({
                                          cartItemId: item._id,
                                          quantity: item.quantity + 1,
                                        })
                                      }
                                      disabled={isIncrementDisabled}
                                      aria-label="Increase quantity"
                                      className="h-12 min-h-[44px] w-12 min-w-[44px] rounded-full text-[#002684] hover:bg-white"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => void removeItem({ cartItemId: item._id })}
                                    className="h-12 min-h-[44px] rounded-full px-4"
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <Trash2 className="h-4 w-4" />
                                      Remove
                                    </span>
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  {cartItems && cartItems.length > 0 ? (
                    <SheetFooter className="border-t">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-body font-medium text-[#002684]">Subtotal</p>
                          <p className="text-body font-semibold text-[#002684]">
                            {formatCents(subtotalCents)}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3">
                          <Button
                            type="button"
                            onClick={() => void clearCart({})}
                            variant="outline"
                            className="h-12 min-h-[44px] rounded-full"
                          >
                            Clear cart
                          </Button>

                          <Button
                            asChild
                            className="h-12 min-h-[44px] rounded-full bg-[#1d4ed8] px-6 text-white hover:bg-[#1d4ed8]/90"
                          >
                            <Link href="/checkout">Checkout</Link>
                          </Button>
                        </div>
                      </div>
                    </SheetFooter>
                  ) : null}
                </SheetContent>
              </Sheet>

              <Button asChild className="h-10 min-h-[40px] lg:h-12 lg:min-h-[44px] rounded-full bg-[#1d4ed8] px-4 lg:px-6 text-sm lg:text-body text-white hover:bg-[#1d4ed8]/90">
                <Link href="/store">Shop now</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
