// User types
export type User = {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

// Ticket type
export type TicketType = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Order item type
export type OrderItem = {
  id: string;
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  ticketType: TicketType;
};

// Complete order type with relations
export type Order = {
  id: string;
  orderId: string;
  userId: string;
  subtotal: number;
  processingFee: number;
  total: number;
  status: string;
  paymentStatus: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  orderItems: OrderItem[];
};

// Checkout form types (from zod schemas)
export type CheckoutFormData = {
  fullName: string;
  phone: string;
  email: string;
};

export type OrderData = {
  ticketType: string;
  quantity: number;
  subtotal: number;
  processingFee: number;
  total: number;
};

// API response types
export type PaymentInitResponse = {
  success: boolean;
  data?: {
    orderId: string;
    paymentUrl: string;
    accessCode: string;
    reference: string;
  };
  error?: string;
};

export type PaymentVerificationResponse = {
  success: boolean;
  order?: Order;
  error?: string;
};

export type OrderResponse = {
  success: boolean;
  order?: Order;
  error?: string;
};

// Email template types
export type TicketDetail = {
  type: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type OrderConfirmationEmailProps = {
  customerName: string;
  orderId: string;
  ticketDetails: TicketDetail[];
  subtotal: number;
  processingFee: number;
  total: number;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  qrCodeDataUrl: string;
};
