"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { render } from "@react-email/render";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import QRCode from "qrcode";
import { v2 as cloudinary } from "cloudinary";
import {
  CheckoutFormData,
  OrderData,
  PaymentInitResponse,
  PaymentVerificationResponse,
  OrderResponse,
  Order,
} from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Form validation schema
const CheckoutFormSchema = z.object({
  fullName: z.string().min(4, "Full name must be at least 4 characters"),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(11, "Phone number must be maximum 11 digits"),
  email: z.string().email("Please enter a valid email address"),
});

const OrderDataSchema = z.object({
  ticketType: z.string(),
  quantity: z.number().min(1),
  subtotal: z.number().min(1),
  processingFee: z.number().min(0),
  total: z.number().min(1),
});

// Types are now imported from @/types

// Generate custom order ID
function generateOrderId(): string {
  // const timestamp = Date.now();
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}-${randomSuffix}`;
}

// Get consistent base price for each ticket type
function getTicketBasePrice(ticketTypeName: string): number {
  switch (ticketTypeName) {
    case "Solo Vibes":
      return 5000; // 50 NGN in kobo
    case "Geng Energy":
      return 8000; // 80 NGN in kobo
    default:
      throw new Error(`Unknown ticket type: ${ticketTypeName}`);
  }
}

// Initialize Paystack payment
export async function initializePayment(
  userData: CheckoutFormData,
  orderData: OrderData
): Promise<PaymentInitResponse> {
  try {
    // Validate input data
    const validatedUser = CheckoutFormSchema.parse(userData);
    const validatedOrder = OrderDataSchema.parse(orderData);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: validatedUser.email },
      update: {
        fullName: validatedUser.fullName,
        phoneNumber: validatedUser.phone,
      },
      create: {
        fullName: validatedUser.fullName,
        phoneNumber: validatedUser.phone,
        email: validatedUser.email,
      },
    });

    // Get or create ticket type (find by name, create once with consistent info)
    let ticketType = await prisma.ticketType.findFirst({
      where: { name: validatedOrder.ticketType },
    });

    if (!ticketType) {
      // Create ticket type with consistent pricing
      const basePrice = getTicketBasePrice(validatedOrder.ticketType);
      ticketType = await prisma.ticketType.create({
        data: {
          name: validatedOrder.ticketType,
          price: basePrice,
          description: `${validatedOrder.ticketType} ticket for shutupnraveee 2025`,
        },
      });
    }

    // Generate custom order ID
    const customOrderId = generateOrderId();

    // Create pending order
    const order = await prisma.order.create({
      data: {
        orderId: customOrderId,
        userId: user.id,
        subtotal: validatedOrder.subtotal,
        processingFee: validatedOrder.processingFee,
        total: validatedOrder.total,
        status: "PENDING",
        paymentStatus: "PENDING",
        orderItems: {
          create: {
            ticketTypeId: ticketType.id,
            quantity: validatedOrder.quantity,
            unitPrice: validatedOrder.subtotal / validatedOrder.quantity,
            totalPrice: validatedOrder.subtotal,
          },
        },
      },
      include: {
        user: true,
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    // Initialize Paystack payment using the custom order ID
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: order.orderId, // Use custom order ID as reference
          email: validatedUser.email,
          amount: validatedOrder.total * 100, // Paystack expects amount in kobo
          currency: "NGN",
          metadata: {
            orderId: order.orderId,
            userId: user.id,
            ticketType: validatedOrder.ticketType,
            quantity: validatedOrder.quantity,
            customerName: validatedUser.fullName,
            customerPhone: validatedUser.phone,
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/payment-success`,
        }),
      }
    );

    if (!paystackResponse.ok) {
      throw new Error("Failed to initialize payment");
    }

    const paystackData = await paystackResponse.json();

    return {
      success: true,
      data: {
        orderId: order.orderId, // Return custom order ID, not MongoDB ID
        paymentUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        reference: paystackData.data.reference,
      },
    };
  } catch (error) {
    console.error("Payment initialization error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Payment initialization failed",
    };
  }
}

// Verify payment and complete order
export async function verifyPayment(
  reference: string
): Promise<PaymentVerificationResponse> {
  try {
    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!paystackResponse.ok) {
      throw new Error("Payment verification failed");
    }

    const paystackData = await paystackResponse.json();

    if (paystackData.data.status !== "success") {
      throw new Error("Payment was not successful");
    }

    // Update order status using the MongoDB ID
    const order = await prisma.order.update({
      where: { orderId: reference },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
      },
      include: {
        user: true,
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    // Send confirmation email
    await sendOrderConfirmationEmail(order);

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Payment verification error:", error);

    // Update order status to failed
    try {
      await prisma.order.update({
        where: { orderId: reference },
        data: {
          paymentStatus: "FAILED",
        },
      });
    } catch (dbError) {
      console.error("Failed to update order status:", dbError);
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

// Send order confirmation email using React Email template
async function sendOrderConfirmationEmail(order: Order) {
  try {
    const ticketDetails = order.orderItems.map((item) => ({
      type: item.ticketType.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    // Generate QR code with admin page link
    const adminPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin-page/${order.orderId}`;

    // Generate QR code as buffer
    const qrCodeBuffer = await QRCode.toBuffer(adminPageUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Upload QR code to Cloudinary
    let qrCodeUrl;
    try {
      const qrCodeUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              public_id: `qr-codes/${order.orderId}`,
              folder: "shutupnrave/qr-codes",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(qrCodeBuffer);
      });

      qrCodeUrl = (qrCodeUpload as any).secure_url;
    } catch (error) {
      console.error("Failed to upload QR code to Cloudinary:", error);
      // Fallback to data URL if Cloudinary fails
      qrCodeUrl = await QRCode.toDataURL(adminPageUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    }

    // Render the React Email template to HTML
    const emailHtml = await render(
      OrderConfirmationEmail({
        customerName: order.user.fullName,
        orderId: order.orderId,
        ticketDetails,
        subtotal: order.subtotal,
        processingFee: order.processingFee,
        total: order.total,
        eventDate: order.eventDate,
        eventTime: order.eventTime,
        eventLocation: order.eventLocation,
        qrCodeDataUrl: qrCodeUrl,
      })
    );

    const emailResponse = await resend.emails.send({
      from: `shutupnraveee <${process.env.RESEND_FROM_EMAIL}>`,
      to: [order.user.email],
      subject: "🎉 Your shutupnraveee 2025 Tickets Are Here!",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);
    return emailResponse;
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

// Get order details
export async function getOrder(orderId: string): Promise<OrderResponse> {
  try {
    const order = await prisma.order.findUnique({
      where: { orderId },
      include: {
        user: true,
        orderItems: {
          include: {
            ticketType: true,
          },
        },
      },
    });

    return {
      success: true,
      order: order || undefined,
    };
  } catch (error) {
    console.error("Get order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get order",
    };
  }
}
