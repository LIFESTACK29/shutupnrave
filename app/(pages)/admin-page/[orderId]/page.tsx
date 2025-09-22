import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard, 
  Package, 
  AlertCircle
} from 'lucide-react';
import { getOrderForAdmin } from '@/app/server/checkout';
import { CopyButton, DeactivateButton } from './components/OrderDetailsClient';
import TicketDetailsHeader from './components/TicketDetailsHeader';

// Format currency in Naira
function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

// Format date to readable string
function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format time to readable string - handles both single times and time ranges
function formatTime(timeString: string): string {
  // If it's already a formatted time range (like "12:00 PM - 10:00 PM"), return as-is
  if (timeString.includes(' - ') || timeString.includes('PM') || timeString.includes('AM')) {
    return timeString;
  }
  
  // Otherwise, try to parse and format it
  try {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    // If parsing fails, return the original string
    return timeString;
  }
}

// Updated for Next.js 15 - params is now async
interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  // Await the params Promise in Next.js 15
  const { orderId } = await params;
  
  // Fetch order data on the server
  const result = await getOrderForAdmin(orderId);
  
  if (!result.success || !result.order) {
    notFound();
  }
  
  const order = result.order;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <TicketDetailsHeader order={order} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Order Summary</span>
            </CardTitle>
            <CardDescription>
              Complete order information and current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Order Created</p>
                <p className="font-medium">
                  {formatDate(order.createdAt)} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-lg">{formatCurrency(order.total)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Ticket Count</p>
                <p className="font-medium">
                  {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} tickets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{order.user.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{order.user.email}</p>
                      <CopyButton text={order.user.email} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{order.user.phoneNumber}</p>
                      <CopyButton text={order.user.phoneNumber} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{order.orderId}</p>
                      <CopyButton text={order.orderId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Event Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Event Date</p>
                <p className="font-medium">{formatDate(order.eventDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Event Time</p>
                <p className="font-medium">{formatTime(order.eventTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{order.eventLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Ticket Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.ticketType.name}</h4>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span>
                    Discount{order.discountCode ? ` (${order.discountCode})` : ''}
                  </span>
                  <span>-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span>Processing Fee</span>
                <span>{formatCurrency(order.processingFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-medium text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Payment Reference</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-sm">{order.orderId}</p>
                  <CopyButton text={order.orderId} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Actions */}
        {order.isActive && order.paymentStatus === 'PAID' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Admin Actions</span>
              </CardTitle>
              <CardDescription>
                Use these actions to manage the ticket status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Deactivating a ticket marks it as used and prevents re-entry
                </p>
                <DeactivateButton orderId={order.orderId} />
              </div>
            </CardContent>
          </Card>
        )}

        {!order.isActive && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span>Ticket Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Used</Badge>
                <p className="text-sm text-gray-600">
                  This ticket has been deactivated and cannot be used for entry
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 