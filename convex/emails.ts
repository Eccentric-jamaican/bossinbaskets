import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import { Resend } from "resend"

// Welcome email action
export const sendWelcomeEmail = internalAction({
  args: {
    userId: v.id("users"),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    // Extract first name only
    const fullName = args.name || "there"
    const firstName = fullName.split(" ")[0]
    const resend = new Resend(RESEND_API_KEY)

    try {
      const { data, error } = await resend.emails.send({
        from: "BossinBaskets <hi@bossinbaskets.shop>",
        to: [args.email],
        subject: `Welcome to BossinBaskets, ${firstName}!`,
        html: generateWelcomeHtml(firstName),
      })

      if (error) {
        throw new Error(error.message || "Failed to send email")
      }

      console.log(
        `Welcome email sent to ${args.email} for user ${args.userId}, Resend ID: ${data?.id}`
      )

      return { success: true, id: data?.id }
    } catch (error) {
      console.error("Failed to send welcome email:", error)
      return { success: false, error: String(error) }
    }
  },
})

// Order confirmation email action
export const sendOrderConfirmationEmail = internalAction({
  args: {
    orderId: v.id("orders"),
    email: v.string(),
    customerName: v.string(),
    orderNumber: v.string(),
    items: v.array(
      v.object({
        productName: v.string(),
        productImage: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    subtotal: v.number(),
    shippingCost: v.number(),
    tax: v.number(),
    total: v.number(),
    shippingAddress: v.object({
      recipientName: v.string(),
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    paymentMethod: v.union(
      v.literal("bank_transfer"),
      v.literal("cash_on_delivery")
    ),
    isGift: v.boolean(),
    giftMessage: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured")
      return { success: false, error: "Email service not configured" }
    }

    const resend = new Resend(RESEND_API_KEY)

    try {
      const { data, error } = await resend.emails.send({
        from: "BossinBaskets <orders@bossinbaskets.shop>",
        to: [args.email],
        subject: `Order Confirmed - ${args.orderNumber}`,
        html: generateOrderConfirmationHtml(args),
      })

      if (error) {
        throw new Error(error.message || "Failed to send email")
      }

      console.log(
        `Order confirmation email sent for order ${args.orderNumber}, Resend ID: ${data?.id}`
      )

      return { success: true, id: data?.id }
    } catch (error) {
      console.error("Failed to send order confirmation email:", error)
      return { success: false, error: String(error) }
    }
  },
})

// Helper function to format cents as dollars
function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Generate welcome email HTML
function generateWelcomeHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BossinBaskets</title>
      </head>
      <body style="background-color: #f7f4ee; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://bossinbaskets.shop/icon.png" alt="BossinBaskets" width="120" height="120" style="display: inline-block;">
          </div>

          <h1 style="color: #002684; font-size: 28px; font-weight: bold; text-align: center; margin: 0 0 24px; font-family: Georgia, 'Times New Roman', serif;">
            Welcome to BossinBaskets!
          </h1>

          <p style="color: #002684; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
            Hi ${name},
          </p>

          <p style="color: #002684; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
            Thank you for joining BossinBaskets! We're thrilled to have you as part of our community of thoughtful gift-givers.
          </p>

          <p style="color: #002684; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
            Explore our curated collection of premium gift baskets, perfect for every occasion. Whether you're celebrating a birthday, anniversary, or just want to show someone you care, we have something special for you.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://bossinbaskets.shop/store" style="background-color: #002684; border-radius: 9999px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; display: inline-block;">
              Start Shopping
            </a>
          </div>

          <p style="color: #002684; font-size: 14px; opacity: 0.7; text-align: center; margin: 24px 0;">
            Questions? Reply to this email or contact us at support@bossinbaskets.shop
          </p>

          <div style="border-top: 1px solid rgba(0, 38, 132, 0.1); margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #002684; font-size: 12px; opacity: 0.5; margin: 0;">
              &copy; ${new Date().getFullYear()} BossinBaskets. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Generate order confirmation email HTML
function generateOrderConfirmationHtml(args: {
  customerName: string
  orderNumber: string
  items: Array<{
    productName: string
    productImage: string
    price: number
    quantity: number
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
  }
  paymentMethod: "bank_transfer" | "cash_on_delivery"
  isGift: boolean
  giftMessage?: string
}): string {
  // Extract first name only
  const firstName = args.customerName.split(" ")[0]

  const itemsHtml = args.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid rgba(0, 38, 132, 0.1);">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td width="64" style="vertical-align: top;">
                <img src="${item.productImage || "https://bossinbaskets.shop/placeholder.jpg"}" alt="${item.productName}" width="64" height="64" style="border-radius: 8px; object-fit: cover;">
              </td>
              <td style="padding-left: 16px; vertical-align: top;">
                <p style="color: #002684; font-size: 16px; font-weight: 500; margin: 0 0 4px;">${item.productName}</p>
                <p style="color: #002684; font-size: 14px; opacity: 0.7; margin: 0;">Qty: ${item.quantity}</p>
              </td>
              <td style="text-align: right; vertical-align: top;">
                <p style="color: #002684; font-size: 16px; font-weight: 500; margin: 0;">${formatCents(item.price * item.quantity)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `
    )
    .join("")

  const paymentInstructions =
    args.paymentMethod === "bank_transfer"
      ? `
      <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #002684; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Bank Transfer Instructions</h3>
        <p style="color: #002684; font-size: 14px; line-height: 22px; margin: 0 0 16px;">
          Please transfer <strong>${formatCents(args.total)}</strong> to the following account:
        </p>
        <div style="background-color: #f7f4ee; border-radius: 12px; padding: 16px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="padding: 4px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Bank Name</span></td>
              <td style="text-align: right;"><span style="color: #002684; font-size: 14px; font-weight: 500;">First National Bank</span></td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Account Name</span></td>
              <td style="text-align: right;"><span style="color: #002684; font-size: 14px; font-weight: 500;">BossinBaskets LLC</span></td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Account Number</span></td>
              <td style="text-align: right;"><span style="color: #002684; font-size: 14px; font-weight: 500;">1234567890</span></td>
            </tr>
            <tr>
              <td style="padding: 4px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Routing Number</span></td>
              <td style="text-align: right;"><span style="color: #002684; font-size: 14px; font-weight: 500;">021000021</span></td>
            </tr>
          </table>
        </div>
        <p style="color: #002684; font-size: 14px; opacity: 0.7; margin: 16px 0 0;">
          Please include your order number <strong>${args.orderNumber}</strong> in the transfer reference.
        </p>
      </div>
    `
      : `
      <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #002684; font-size: 18px; font-weight: 600; margin: 0 0 16px;">Cash on Delivery</h3>
        <p style="color: #002684; font-size: 14px; line-height: 22px; margin: 0;">
          Please have <strong>${formatCents(args.total)}</strong> ready when your order arrives. Our delivery person will collect payment upon delivery.
        </p>
      </div>
    `

  const giftSection =
    args.isGift && args.giftMessage
      ? `
      <div style="background-color: #fbbf24; border-radius: 16px; padding: 16px; margin: 24px 0;">
        <p style="color: #002684; font-size: 14px; font-weight: 600; margin: 0 0 8px;">Gift Message</p>
        <p style="color: #002684; font-size: 14px; font-style: italic; margin: 0;">${args.giftMessage}</p>
      </div>
    `
      : ""

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${args.orderNumber}</title>
      </head>
      <body style="background-color: #f7f4ee; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 40px;">
            <img src="https://bossinbaskets.shop/icon.png" alt="BossinBaskets" width="120" height="120" style="display: inline-block;">
          </div>

          <h1 style="color: #002684; font-size: 28px; font-weight: bold; text-align: center; margin: 0 0 24px; font-family: Georgia, 'Times New Roman', serif;">
            Order Confirmed!
          </h1>

          <p style="color: #002684; font-size: 16px; line-height: 24px; margin: 0 0 16px;">
            Hi ${firstName},
          </p>

          <p style="color: #002684; font-size: 16px; line-height: 24px; margin: 0 0 24px;">
            Thank you for your order! We've received your order and will begin processing it shortly.
          </p>

          <!-- Order Number -->
          <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #002684; font-size: 14px; opacity: 0.7; margin: 0;">Order Number</p>
            <p style="color: #002684; font-size: 20px; font-weight: bold; margin: 8px 0 0;">${args.orderNumber}</p>
          </div>

          <!-- Order Items -->
          <h3 style="color: #002684; font-size: 18px; font-weight: 600; margin: 24px 0 16px;">Order Items</h3>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${itemsHtml}
          </table>

          <!-- Order Summary -->
          <div style="margin: 24px 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="padding: 8px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Subtotal</span></td>
                <td style="text-align: right;"><span style="color: #002684; font-size: 14px;">${formatCents(args.subtotal)}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Shipping</span></td>
                <td style="text-align: right;"><span style="color: #002684; font-size: 14px;">${args.shippingCost === 0 ? "Free" : formatCents(args.shippingCost)}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><span style="color: #002684; font-size: 14px; opacity: 0.7;">Tax</span></td>
                <td style="text-align: right;"><span style="color: #002684; font-size: 14px;">${formatCents(args.tax)}</span></td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 16px 0 8px;"><div style="border-top: 1px solid rgba(0, 38, 132, 0.1);"></div></td>
              </tr>
              <tr>
                <td><span style="color: #002684; font-size: 16px; font-weight: 600;">Total</span></td>
                <td style="text-align: right;"><span style="color: #002684; font-size: 18px; font-weight: bold;">${formatCents(args.total)}</span></td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <h3 style="color: #002684; font-size: 18px; font-weight: 600; margin: 24px 0 16px;">Shipping To</h3>
          <p style="color: #002684; font-size: 14px; line-height: 22px; margin: 0;">
            ${args.shippingAddress.recipientName}<br>
            ${args.shippingAddress.street}<br>
            ${args.shippingAddress.city}, ${args.shippingAddress.state} ${args.shippingAddress.zipCode}<br>
            ${args.shippingAddress.country}
          </p>

          ${giftSection}

          ${paymentInstructions}

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://bossinbaskets.shop/store" style="background-color: #002684; border-radius: 9999px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; display: inline-block;">
              Continue Shopping
            </a>
          </div>

          <p style="color: #002684; font-size: 14px; opacity: 0.7; text-align: center; margin: 24px 0;">
            Questions about your order? Reply to this email or contact support@bossinbaskets.shop
          </p>

          <div style="border-top: 1px solid rgba(0, 38, 132, 0.1); margin-top: 32px; padding-top: 24px; text-align: center;">
            <p style="color: #002684; font-size: 12px; opacity: 0.5; margin: 0;">
              &copy; ${new Date().getFullYear()} BossinBaskets. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
