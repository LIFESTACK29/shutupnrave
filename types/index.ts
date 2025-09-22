/**
 * Core Type Definitions for shutupnraveee Ticketing System
 *
 * This file contains all TypeScript interfaces used throughout the application.
 * It provides type safety for database entities, API responses, and form data.
 * All types mirror the Prisma schema structure for consistency.
 */

// ===== DATABASE ENTITY TYPES =====

/**
 * User represents a customer in the system
 * Stores basic contact information for ticket purchases
 */
export type User = {
  id: string; // MongoDB ObjectId
  fullName: string; // Customer's full name
  phoneNumber: string; // Contact phone number
  email: string; // Primary contact email (unique)
  createdAt: Date; // Account creation timestamp
  updatedAt: Date; // Last modification timestamp
};

/**
 * TicketType represents different categories of tickets available
 * Currently supports "Solo Vibes" and "Geng Energy" types
 */
export type TicketType = {
  id: string; // MongoDB ObjectId
  name: string; // Ticket type name (e.g., "Solo Vibes")
  price: number; // Base price in kobo (NGN * 100)
  description: string | null; // Optional ticket description
  isActive: boolean; // Whether this ticket type is available for purchase
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last modification timestamp
};

/**
 * OrderItem represents individual ticket purchases within an order
 * Links tickets to orders with quantity and pricing information
 */
export type OrderItem = {
  id: string; // MongoDB ObjectId
  orderId: string; // Reference to parent order
  ticketTypeId: string; // Reference to ticket type
  quantity: number; // Number of tickets purchased
  unitPrice: number; // Price per ticket in kobo
  totalPrice: number; // Total price for this item (unitPrice * quantity)
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last modification timestamp
  ticketType: TicketType; // Populated ticket type information
};

/**
 * Order represents a complete ticket purchase transaction
 * Contains customer information, items, pricing, and payment status
 */
export type Order = {
  id: string; // MongoDB ObjectId
  orderId: string; // Human-readable order ID (ORD-YYYY-XXXXXX)
  userId: string; // Reference to customer
  subtotal: number; // Total before processing fees (in kobo)
  processingFee: number; // Payment processing fee (in kobo)
  total: number; // Final amount charged (in kobo)
  // Discount snapshot
  discountId?: string | null;
  discountCode?: string | null;
  discountType?: 'PERCENTAGE' | null;
  discountRate?: number | null; // e.g., 0.1 for 10%
  discountAmount: number; // in kobo
  status: string; // Order status ("PENDING" | "CONFIRMED" | "CANCELLED")
  paymentStatus: string; // Payment status ("PENDING" | "PAID" | "FAILED")
  isActive: boolean; // Whether the ticket is active/unused (default: true)
  eventName: string; // Name of the event
  eventDate: string; // Event date
  eventTime: string; // Event time
  eventLocation: string; // Event venue/location
  qrCodeUrl: string | null; // Cloudinary URL for QR code image
  createdAt: Date; // Order creation timestamp
  updatedAt: Date; // Last modification timestamp
  user: User; // Populated customer information
  orderItems: OrderItem[]; // Array of purchased items
};

// ===== FORM DATA TYPES =====

/**
 * CheckoutFormData represents the customer input from the checkout form
 * Validated by Zod schema before processing
 */
export type CheckoutFormData = {
  fullName: string; // Customer's full name (minimum 4 characters)
  phone: string; // Phone number (exactly 11 digits)
  email: string; // Valid email address
};

/**
 * OrderData represents the ticket selection and pricing information
 * Calculated on frontend and validated on backend
 */
export type OrderData = {
  ticketType: string; // Selected ticket type ("Solo Vibes" | "Geng Energy")
  quantity: number; // Number of tickets (minimum 1)
  subtotal: number; // Total before processing fee (in kobo)
  processingFee: number; // Payment processing fee (in kobo)
  total: number; // Final amount to charge (in kobo)
  discountCode?: string; // Optional discount code entered by user
};

// ===== API RESPONSE TYPES =====

/**
 * PaymentInitResponse is returned from initializePayment server action
 * Contains Paystack payment URL or error information
 */
export type PaymentInitResponse = {
  success: boolean; // Whether initialization was successful
  data?: {
    orderId: string; // Our custom order ID for tracking
    paymentUrl: string; // Paystack checkout URL
    accessCode: string; // Paystack access code
    reference: string; // Payment reference (same as orderId)
  };
  error?: string; // Error message if initialization failed
};

/**
 * PaymentVerificationResponse is returned from verifyPayment server action
 * Contains order data after successful payment verification
 */
export type PaymentVerificationResponse = {
  success: boolean; // Whether verification was successful
  order?: Order; // Complete order data if successful
  error?: string; // Error message if verification failed
};

/**
 * OrderResponse is returned from getOrder server action
 * Used for fetching order details by ID
 */
export type OrderResponse = {
  success: boolean; // Whether order retrieval was successful
  order?: Order; // Order data if found
  error?: string; // Error message if not found or failed
};

// ===== EMAIL TEMPLATE TYPES =====

/**
 * TicketDetail represents formatted ticket information for email templates
 * Simplified version of OrderItem for email display
 */
export type TicketDetail = {
  type: string; // Ticket type name
  quantity: number; // Number of tickets
  unitPrice: number; // Price per ticket (in kobo)
  totalPrice: number; // Total price for this ticket type (in kobo)
};

/**
 * OrderConfirmationEmailProps contains all data needed for the email template
 * Passed to React Email component for rendering
 */
export type OrderConfirmationEmailProps = {
  customerName: string; // Customer's full name
  orderId: string; // Custom order ID for reference
  ticketDetails: TicketDetail[]; // Array of purchased tickets
  subtotal: number; // Total before processing fee (in kobo)
  discountCode?: string | null; // Applied discount code
  discountAmount?: number; // Discount amount in kobo
  processingFee: number; // Processing fee (in kobo)
  total: number; // Final amount paid (in kobo)
  eventDate: string; // Event date
  eventTime: string; // Event time
  eventLocation: string; // Event venue/location
  qrCodeDataUrl: string; // URL to hosted QR code image
};
