/**
 * @fileoverview Admin Pending Tickets Component
 * @description Component for displaying and managing pending/unsuccessful tickets in the admin panel
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Eye,
  Calendar,
  User,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';

// ===== TYPE DEFINITIONS =====

/**
 * @interface PendingTicketsProps
 * @description Props for the AdminPendingTickets component
 */
interface PendingTicketsProps {
  /** Array of all orders to filter for pending tickets */
  orders: Order[];
  /** Loading state indicator */
  isLoading?: boolean;
  /** Callback when component needs to refresh data */
  onRefresh?: () => void;
}

/**
 * @interface PendingTicketStats
 * @description Statistics for pending tickets display
 */
interface PendingTicketStats {
  totalPending: number;
  pendingOrders: number;
  failedPayments: number;
  cancelledOrders: number;
  refundedOrders: number;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format currency in Naira
 */
function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

/**
 * Format date to readable string
 */
function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get status badge variant based on order status
 */
function getStatusBadgeVariant(order: Order): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (order.paymentStatus === 'FAILED') return 'destructive';
  if (order.status === 'CANCELLED') return 'destructive';
  if (order.status === 'REFUNDED') return 'outline';
  return 'secondary';
}

/**
 * Get status display text
 */
function getStatusText(order: Order): string {
  if (order.paymentStatus === 'FAILED') return 'Payment Failed';
  if (order.paymentStatus === 'PENDING' && order.status === 'PENDING') return 'Payment Pending';
  if (order.status === 'CANCELLED') return 'Cancelled';
  if (order.status === 'REFUNDED') return 'Refunded';
  return `${order.status} / ${order.paymentStatus}`;
}

/**
 * Get appropriate icon for order status
 */
function getStatusIcon(order: Order) {
  if (order.paymentStatus === 'FAILED') return XCircle;
  if (order.status === 'CANCELLED') return XCircle;
  if (order.status === 'REFUNDED') return RefreshCw;
  return Clock;
}

/**
 * @function AdminPendingTickets
 * @description Component for managing pending/unsuccessful tickets
 * @param {PendingTicketsProps} props - Component props
 * @returns {JSX.Element} The pending tickets management interface
 */
export default function AdminPendingTickets({ 
  orders, 
  isLoading = false, 
  onRefresh 
}: PendingTicketsProps) {
  const router = useRouter();

  // ===== STATE MANAGEMENT =====

  const [expandedView, setExpandedView] = useState(false);

  // ===== COMPUTED VALUES =====

  /**
   * Filter orders to get only pending/unsuccessful tickets
   * Pending tickets are those that aren't successfully paid and confirmed
   */
  const pendingTickets = orders.filter(order => 
    order.paymentStatus !== 'PAID' || order.status !== 'CONFIRMED'
  );

  /**
   * Calculate pending ticket statistics
   */
  const pendingStats: PendingTicketStats = {
    totalPending: pendingTickets.length,
    pendingOrders: pendingTickets.filter(order => 
      order.paymentStatus === 'PENDING' && order.status === 'PENDING'
    ).length,
    failedPayments: pendingTickets.filter(order => 
      order.paymentStatus === 'FAILED'
    ).length,
    cancelledOrders: pendingTickets.filter(order => 
      order.status === 'CANCELLED'
    ).length,
    refundedOrders: pendingTickets.filter(order => 
      order.status === 'REFUNDED'
    ).length,
  };

  // ===== CALLBACK FUNCTIONS =====

  /**
   * Handle viewing order details
   */
  const handleViewOrder = useCallback((orderId: string) => {
    router.push(`/admin-page/${orderId}`);
  }, [router]);

  /**
   * Handle expanding/collapsing the view
   */
  const handleToggleView = useCallback(() => {
    setExpandedView(prev => !prev);
  }, []);

  // ===== RENDER HELPERS =====

  /**
   * Render a pending ticket row
   */
  const renderPendingTicket = (order: Order) => {
    const StatusIcon = getStatusIcon(order);
    const totalTickets = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
      <div 
        key={order.id}
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-4 flex-1">
          {/* Status Icon */}
          <StatusIcon className="h-5 w-5 text-orange-600" />
          
          {/* Order Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-1">
              <p className="font-semibold text-gray-900 text-sm">
                {order.orderId}
              </p>
              <Badge variant={getStatusBadgeVariant(order)} className="text-xs">
                {getStatusText(order)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{order.user.fullName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{order.user.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(order.createdAt)}</span>
              </span>
            </div>
          </div>
          
          {/* Ticket Info */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {totalTickets} ticket{totalTickets !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-600">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewOrder(order.orderId)}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    );
  };

  // ===== MAIN RENDER =====

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <CardTitle>Pending Tickets</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleView}
              className="text-xs"
            >
              {expandedView ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        
        <CardDescription>
          Orders that are not successfully paid and confirmed. These tickets are excluded from successful sales totals.
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {/* Statistics Summary */}
        <div className="p-4 bg-orange-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-orange-700">{pendingStats.totalPending}</p>
              <p className="text-xs text-orange-600">Total Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-700">{pendingStats.pendingOrders}</p>
              <p className="text-xs text-blue-600">Payment Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-700">{pendingStats.failedPayments}</p>
              <p className="text-xs text-red-600">Payment Failed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-700">{pendingStats.cancelledOrders}</p>
              <p className="text-xs text-gray-600">Cancelled</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-700">{pendingStats.refundedOrders}</p>
              <p className="text-xs text-purple-600">Refunded</p>
            </div>
          </div>
        </div>

        {/* Pending Tickets List */}
        {pendingTickets.length === 0 ? (
          <div className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Tickets</h3>
            <p className="text-gray-600">All tickets have been successfully processed!</p>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              {/* Show limited or all tickets based on expanded view */}
              {(expandedView ? pendingTickets : pendingTickets.slice(0, 5)).map(renderPendingTicket)}
              
              {/* Show more indicator */}
              {!expandedView && pendingTickets.length > 5 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleView}
                    className="text-xs text-gray-600"
                  >
                    +{pendingTickets.length - 5} more pending tickets
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
