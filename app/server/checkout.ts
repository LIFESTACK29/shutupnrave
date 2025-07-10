/**
 * shutupnraveee Checkout Server Actions
 *
 * This file handles the complete ticketing flow:
 * 1. Payment initialization with Paystack
 * 2. Payment verification and order confirmation
 * 3. QR code generation and cloud hosting
 * 4. Email notification with React Email templates
 *
 * External Services:
 * - Paystack: Payment processing
 * - Cloudinary: QR code hosting for email compatibility
 * - Resend: Email delivery service
 * - MongoDB: Order and user data persistence
 */

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

// Initialize external services
const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Cloudinary for QR code hosting
// This ensures QR codes work in all email clients (Gmail, Outlook, etc.)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ===== VALIDATION SCHEMAS =====
// These schemas validate input data before processing
// Using Zod for runtime type checking and validation

const CheckoutFormSchema = z.object({
  fullName: z.string().min(4, "Full name must be at least 4 characters"),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(11, "Phone number must be maximum 11 digits"),
  email: z.string().email("Please enter a valid email address"),
});

const OrderDataSchema = z.object({
  ticketType: z.string(), // "Solo Vibes" or "Geng Energy"
  quantity: z.number().min(1),
  subtotal: z.number().min(1), // Amount in kobo (NGN * 100)
  processingFee: z.number().min(0), // Processing fee in kobo
  total: z.number().min(1), // Final amount in kobo
});

// Types are now imported from @/types

// ===== UTILITY FUNCTIONS =====

/**
 * Generates a human-readable order ID for customer reference
 * Format: ORD-YYYY-XXXXXX (e.g., ORD-2025-ABC123)
 *
 * @returns {string} Custom order ID
 */
function generateOrderId(): string {
  // const timestamp = Date.now();
  const year = new Date().getFullYear();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${year}-${randomSuffix}`;
}

/**
 * Returns consistent base price for each ticket type
 * This ensures pricing consistency across all orders
 * Prices are in kobo (NGN * 100) for Paystack compatibility
 *
 * @param {string} ticketTypeName - The name of the ticket type
 * @returns {number} Price in kobo
 */
function getTicketBasePrice(ticketTypeName: string): number {
  switch (ticketTypeName) {
    case "Solo Vibes":
      return 5000; // 5000 kobo = 50 NGN
    case "Geng Energy":
      return 8000; // 8000 kobo = 80 NGN
    default:
      throw new Error(`Unknown ticket type: ${ticketTypeName}`);
  }
}

// ===== MAIN PAYMENT FUNCTIONS =====

/**
 * Initializes a payment session with Paystack
 *
 * This is the first step in the payment flow:
 * 1. Validates user input and order data
 * 2. Creates or updates user in database
 * 3. Creates or finds ticket type with consistent pricing
 * 4. Generates custom order ID for customer reference
 * 5. Creates pending order with order items
 * 6. Initializes Paystack payment session
 * 7. Returns payment URL for frontend redirect
 *
 * @param {CheckoutFormData} userData - Customer form data (name, email, phone)
 * @param {OrderData} orderData - Order details (ticket type, quantity, pricing)
 * @returns {Promise<PaymentInitResponse>} Payment initialization result
 */
export async function initializePayment(
  userData: CheckoutFormData,
  orderData: OrderData
): Promise<PaymentInitResponse> {
  try {
    // Step 1: Validate input data using Zod schemas
    // This ensures data integrity before database operations
    const validatedUser = CheckoutFormSchema.parse(userData);
    const validatedOrder = OrderDataSchema.parse(orderData);

    // Step 2: Create or update user in database
    // Uses upsert to handle both new and returning customers
    // This ensures no duplicate users while keeping data fresh
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

    // Step 3: Get or create ticket type with consistent pricing
    // We only have 2 ticket types, so we find existing or create with base price
    let ticketType = await prisma.ticketType.findFirst({
      where: { name: validatedOrder.ticketType },
    });

    if (!ticketType) {
      // Create ticket type with consistent pricing from our base price function
      // This ensures all "Solo Vibes" tickets cost the same, etc.
      const basePrice = getTicketBasePrice(validatedOrder.ticketType);
      ticketType = await prisma.ticketType.create({
        data: {
          name: validatedOrder.ticketType,
          price: basePrice,
          description: `${validatedOrder.ticketType} ticket for shutupnraveee 2025`,
        },
      });
    }

    // Step 4: Generate custom order ID for customer reference
    // This creates a human-readable ID separate from MongoDB's ObjectId
    const customOrderId = generateOrderId();

    // Step 5: Create pending order in database
    // This creates the order record before payment to track the transaction
    // Order starts as PENDING and gets updated after successful payment
    const order = await prisma.order.create({
      data: {
        orderId: customOrderId, // Our custom readable ID
        userId: user.id,
        subtotal: validatedOrder.subtotal,
        processingFee: validatedOrder.processingFee,
        total: validatedOrder.total,
        status: "PENDING", // Will be CONFIRMED after payment
        paymentStatus: "PENDING", // Will be PAID after payment
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
        user: true, // Include user data for email later
        orderItems: {
          include: {
            ticketType: true, // Include ticket type for order details
          },
        },
      },
    });

    // Step 6: Initialize Paystack payment session
    // This creates a payment link that redirects user to Paystack checkout
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference: order.orderId, // Use our custom order ID as payment reference
          email: validatedUser.email,
          amount: validatedOrder.total * 100, // Paystack expects amount in kobo (multiply by 100)
          currency: "NGN", // Nigerian Naira
          metadata: {
            // Additional data for payment tracking and verification
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

    const { data } = await paystackResponse.json();

    // Step 7: Return payment URL for frontend redirect
    return {
      success: true,
      data: {
        orderId: order.orderId, // Return custom order ID for tracking
        paymentUrl: data.authorization_url, // Redirect URL for payment
        accessCode: data.access_code,
        reference: data.reference, // Paystack's reference ID
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

/**
 * Verifies payment status with Paystack and completes the order
 *
 * This is called after the user returns from Paystack payment:
 * 1. Verifies payment status with Paystack API
 * 2. Updates order status to CONFIRMED if payment successful
 * 3. Generates and uploads QR code to Cloudinary
 * 4. Sends confirmation email with ticket details and QR code
 * 5. Returns complete order data for success page
 *
 * @param {string} reference - The payment reference (our custom order ID)
 * @returns {Promise<PaymentVerificationResponse>} Verification result with order data
 */
export async function verifyPayment(
  reference: string
): Promise<PaymentVerificationResponse> {
  try {
    // Step 1: Verify payment status with Paystack API
    // This ensures the payment was actually completed successfully
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

    const { data } = await paystackResponse.json();

    if (data.status !== "success") {
      throw new Error("Payment was not successful");
    }

    // Step 2: Update order status to confirmed
    // This marks the order as complete and paid in our database
    const order = await prisma.order.update({
      where: { orderId: reference }, // Using our custom order ID
      data: {
        status: "CONFIRMED", // Order is now confirmed
        paymentStatus: "PAID", // Payment is complete
      },
      include: {
        user: true, // Include user data for success page and email
        orderItems: {
          include: {
            ticketType: true, // Include ticket details for display
          },
        },
      },
    });

    // Step 3: Send confirmation email with QR code and save QR URL
    // This generates QR code, uploads to Cloudinary, and sends email
    const qrCodeUrl = await sendOrderConfirmationEmail(order);
    
    // Update order with QR code URL for admin verification
    const updatedOrder = await prisma.order.update({
      where: { orderId: reference },
      data: { qrCodeUrl },
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
      order: updatedOrder,
    };
  } catch (error) {
    console.error("Payment verification error:", error);

    // Error handling: Update order status to failed
    // This ensures we track failed payments for debugging and customer support
    try {
      await prisma.order.update({
        where: { orderId: reference },
        data: {
          paymentStatus: "FAILED", // Mark payment as failed
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

/**
 * Sends order confirmation email with QR code
 *
 * This function:
 * 1. Formats ticket data for email template
 * 2. Generates QR code linking to admin verification page
 * 3. Uploads QR code to Cloudinary for email compatibility
 * 4. Renders React Email template to HTML
 * 5. Sends email via Resend service
 *
 * @param {Order} order - Complete order data with user and items
 * @returns {Promise<string>} QR code URL from Cloudinary
 */
async function sendOrderConfirmationEmail(order: Order): Promise<string> {
  try {
    // Step 1: Format ticket details for email template
    // This creates a clean structure for the email display
    const ticketDetails = order.orderItems.map((item) => ({
      type: item.ticketType.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    // Step 2: Generate QR code with admin verification link
    // QR code contains URL to admin page for order verification
    const adminPageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin-page/${order.orderId}`;

    // Generate QR code as buffer for upload to Cloudinary
    // Buffer format is needed for cloud upload
    const qrCodeBuffer = await QRCode.toBuffer(adminPageUrl, {
      width: 200, // 200x200 pixel QR code
      margin: 2, // White margin around QR code
      color: {
        dark: "#FDC700", // yellow QR code
        light: "#000000", // black background
      },
    });

    // Step 3: Upload QR code to Cloudinary for email compatibility
    // Gmail and other email clients block data URLs, so we need hosted images
    let qrCodeUrl;
    try {
      const qrCodeUpload = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              public_id: `qr-codes/${order.orderId}`, // Unique filename based on order ID
              folder: "shutupnrave/qr-codes", // Organized in dedicated folder
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(qrCodeBuffer);
      });

      // Extract secure HTTPS URL from Cloudinary response
      qrCodeUrl = (qrCodeUpload as { secure_url: string }).secure_url;
    } catch (error) {
      console.error("Failed to upload QR code to Cloudinary:", error);
      // Fallback to data URL if Cloudinary upload fails
      // This may not work in all email clients but ensures email still sends
      qrCodeUrl = await QRCode.toDataURL(adminPageUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    }

    // Step 4: Render React Email template to HTML
    // This converts our React Email components to HTML for email clients
    const emailHtml = await render(
      OrderConfirmationEmail({
        customerName: order.user.fullName,
        orderId: order.orderId, // Our custom readable order ID
        ticketDetails, // Formatted ticket information
        subtotal: order.subtotal,
        processingFee: order.processingFee,
        total: order.total,
        eventDate: order.eventDate,
        eventTime: order.eventTime,
        eventLocation: order.eventLocation,
        qrCodeDataUrl: qrCodeUrl, // Hosted QR code URL from Cloudinary
      })
    );

    // Step 5: Send email via Resend service
    const emailResponse = await resend.emails.send({
      from: `Shutupnraveee <${process.env.RESEND_FROM_EMAIL}>`, // Configured sender email
      to: [order.user.email], // Customer's email address
      subject: "🎉 Your shutupnraveee 2025 Tickets Are Here!", // Email subject line
      html: emailHtml, // Rendered HTML email content
    });

    console.log("Email sent successfully:", emailResponse);
    return qrCodeUrl; // Return the QR code URL for storage in database
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

/**
 * Retrieves a complete order by order ID
 *
 * This function is used by:
 * - Payment success page to display order details
 * - Admin verification page to check order status
 * - Email confirmation system for order data
 *
 * @param {string} orderId - The custom order ID (ORD-YYYY-XXXXXX format)
 * @returns {Promise<OrderResponse>} Order data with user and items, or error
 */
export async function getOrder(orderId: string): Promise<OrderResponse> {
  try {
    // Query database for order using our custom order ID
    // Include all related data needed for display and verification
    const order = await prisma.order.findUnique({
      where: { orderId }, // Using our custom order ID field
      include: {
        user: true, // Customer information
        orderItems: {
          include: {
            ticketType: true, // Ticket details and pricing
          },
        },
      },
    });

    return {
      success: true,
      order: order || undefined, // Return undefined if order not found
    };
  } catch (error) {
    console.error("Get order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get order",
    };
  }
}

// ===== ADMIN VERIFICATION FUNCTIONS =====

/**
 * Verifies and deactivates a ticket order (admin use only)
 * 
 * This function:
 * 1. Retrieves the order and verifies it exists and is active
 * 2. Marks the order as inactive (used/verified)
 * 3. Deletes the QR code from Cloudinary
 * 4. Returns the updated order data
 * 
 * @param {string} orderId - The custom order ID to verify
 * @returns {Promise<{ success: boolean; order?: Order; error?: string; message?: string }>}
 */
export async function verifyAndDeactivateTicket(orderId: string): Promise<{
  success: boolean;
  order?: Order;
  error?: string;
  message?: string;
}> {
  try {
    // Step 1: Get the order with all related data
    const existingOrder = await prisma.order.findUnique({
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

    if (!existingOrder) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    // Step 2: Check if order is valid for verification
    if (existingOrder.paymentStatus !== "PAID") {
      return {
        success: false,
        error: "Order payment is not confirmed",
      };
    }

    if (existingOrder.status !== "CONFIRMED") {
      return {
        success: false,
        error: "Order is not confirmed",
      };
    }

    if (!existingOrder.isActive) {
      return {
        success: false,
        error: "Ticket has already been used",
        order: existingOrder,
      };
    }

    // Step 3: Delete QR code from Cloudinary if it exists
    if (existingOrder.qrCodeUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = existingOrder.qrCodeUrl.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = publicIdWithExt.split('.')[0];
        const fullPublicId = `shutupnrave/qr-codes/${publicId}`;

        await cloudinary.uploader.destroy(fullPublicId);
        console.log(`QR code deleted from Cloudinary: ${fullPublicId}`);
      } catch (cloudinaryError) {
        console.error("Failed to delete QR code from Cloudinary:", cloudinaryError);
        // Continue with order deactivation even if QR deletion fails
      }
    }

    // Step 4: Update order to inactive status
    const updatedOrder = await prisma.order.update({
      where: { orderId },
      data: {
        isActive: false,
        qrCodeUrl: null, // Remove QR code URL since it's been deleted
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

    return {
      success: true,
      order: updatedOrder,
      message: "Ticket has been successfully verified and deactivated",
    };
  } catch (error) {
    console.error("Ticket verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify ticket",
    };
  }
}

/**
 * Gets order details for admin verification (read-only)
 * 
 * This function is used by the admin page to display order information
 * without making any changes to the order status.
 * 
 * @param {string} orderId - The custom order ID to retrieve
 * @returns {Promise<OrderResponse>} Order data for admin verification
 */
export async function getOrderForAdmin(orderId: string): Promise<OrderResponse> {
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
    console.error("Get order for admin error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get order",
    };
  }
}

/**
 * Deactivates a ticket by setting isActive to false and deleting QR code from Cloudinary
 * Used by admin to mark tickets as used/invalid
 * 
 * @param {string} orderId - The custom order ID to deactivate
 * @returns {Promise<{success: boolean; error?: string}>}
 */
export async function deactivateTicket(orderId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Find and update the order
    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    if (!order) {
      return {
        success: false,
        error: "Order not found"
      };
    }

    if (order.paymentStatus !== 'PAID') {
      return {
        success: false,
        error: "Cannot deactivate unpaid tickets"
      };
    }

    if (!order.isActive) {
      return {
        success: false,
        error: "Ticket is already deactivated"
      };
    }

    // Delete QR code from Cloudinary if it exists
    // if (order.qrCodeUrl) {
    //   try {
    //     // Extract public_id from Cloudinary URL
    //     const urlParts = order.qrCodeUrl.split('/');
    //     const publicIdWithExt = urlParts[urlParts.length - 1];
    //     const publicId = publicIdWithExt.split('.')[0];
    //     const fullPublicId = `shutupnrave/qr-codes/${publicId}`;

    //     await cloudinary.uploader.destroy(fullPublicId);
    //     console.log(`QR code deleted from Cloudinary: ${fullPublicId}`);
    //   } catch (cloudinaryError) {
    //     console.error("Failed to delete QR code from Cloudinary:", cloudinaryError);
    //     // Continue with order deactivation even if QR deletion fails
    //   }
    // }

    // Update the order to deactivate the ticket and remove QR code URL
    await prisma.order.update({
      where: { orderId },
      data: { 
        isActive: false,
        // qrCodeUrl: null // Remove QR code URL since it's been deleted
      }
    });

    return {
      success: true
    };
  } catch (error) {
    console.error("Deactivate ticket error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to deactivate ticket"
    };
  }
}
