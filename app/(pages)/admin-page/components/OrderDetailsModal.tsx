"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard, 
  MapPin, 
  QrCode,
  Copy,
  ExternalLink
} from "lucide-react";
import { Order } from "@/types";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, open, onClose }: OrderDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string, isActive: boolean) => {
    if (paymentStatus === 'PAID') {
      if (!isActive) {
        return <Badge variant="secondary" className="text-sm">Used</Badge>;
      }
      return <Badge variant="default" className="text-sm">Active</Badge>;
    } else if (paymentStatus === 'PENDING') {
      return <Badge variant="outline" className="text-sm">Pending</Badge>;
    } else if (paymentStatus === 'FAILED') {
      return <Badge variant="destructive" className="text-sm">Failed</Badge>;
    }
    return <Badge variant="outline" className="text-sm">{paymentStatus}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            {getStatusBadge(order.status, order.paymentStatus, order.isActive)}
          </DialogTitle>
          <DialogDescription>
            Complete information for order {order.orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Order Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order ID</span>
                <div className="flex items-center space-x-2">
                  <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {order.orderId}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.orderId)}
                    className="h-auto p-1"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Order Status</span>
                <Badge variant="outline">{order.status}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Status</span>
                <Badge variant={order.paymentStatus === 'PAID' ? 'default' : 'destructive'}>
                  {order.paymentStatus === 'PAID' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Paid</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> {order.paymentStatus}</>
                  )}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ticket Status</span>
                <Badge variant={order.isActive ? 'default' : 'secondary'}>
                  {order.isActive ? 'Active' : 'Used'}
                </Badge>
              </div>

              {copied && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✓ Copied to clipboard
                </div>
              )}
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
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.user.fullName}</p>
                  <p className="text-sm text-gray-600">Full Name</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.user.email}</p>
                  <p className="text-sm text-gray-600">Email Address</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium">{order.user.phoneNumber}</p>
                  <p className="text-sm text-gray-600">Phone Number</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Order Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.ticketType.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-sm text-gray-600">{item.quantity} ticket{item.quantity > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Processing Fee</span>
                  <span>{formatCurrency(order.processingFee)}</span>
                </div>
                <div className="flex justify-between items-center font-medium text-lg">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{order.eventName}</p>
                <p className="text-sm text-gray-600">Event Name</p>
              </div>
              <div>
                <p className="font-medium">{order.eventDate}</p>
                <p className="text-sm text-gray-600">Date</p>
              </div>
              <div>
                <p className="font-medium">{order.eventTime}</p>
                <p className="text-sm text-gray-600">Time</p>
              </div>
              <div>
                <p className="font-medium">{order.eventLocation}</p>
                <p className="text-sm text-gray-600">Location</p>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span>QR Code Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {order.qrCodeUrl ? 'QR Code Available' : 'QR Code Not Available'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.qrCodeUrl 
                        ? 'Customer can present this QR code for verification' 
                        : 'QR code has been deleted or not generated'
                      }
                    </p>
                  </div>
                  <Badge variant={order.qrCodeUrl ? 'default' : 'secondary'}>
                    {order.qrCodeUrl ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                {order.qrCodeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(order.qrCodeUrl!, '_blank')}
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View QR Code</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 