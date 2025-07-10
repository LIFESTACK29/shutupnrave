/**
 * @fileoverview Admin Orders Table Component
 * @description Comprehensive table component for displaying and managing orders in the admin dashboard.
 * Provides both desktop table view and mobile card view with pagination, sorting, and detailed order information.
 * 
 * Features:
 * - Responsive design (table on desktop, cards on mobile)
 * - Order sorting capabilities by various fields
 * - Comprehensive pagination with page navigation
 * - Status badges for order and payment states
 * - Currency formatting for amounts
 * - Date formatting for timestamps
 * - Loading and empty states
 * - Interactive order viewing
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import React, { useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from "lucide-react";
import { Order } from "@/types";

// ===== TYPE DEFINITIONS =====

/**
 * @interface AdminOrdersTableProps
 * @description Props for the AdminOrdersTable component
 */
interface AdminOrdersTableProps {
  /** Array of orders to display in the table */
  orders: Order[];
  /** Total number of orders (for pagination display) */
  total: number;
  /** Current page number (1-based) */
  currentPage: number;
  /** Number of items to display per page */
  itemsPerPage: number;
  /** Loading state to show loading indicators */
  loading?: boolean;
  /** Callback for page navigation */
  onPageChange: (page: number) => void;
  /** Callback when an order is clicked for viewing details */
  onOrderClick: (order: Order) => void;
  /** Optional callback for column sorting */
  onSort?: (field: string) => void;
}

/**
 * @type BadgeVariant
 * @description Available badge variants for status display
 */
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * @interface StatusBadgeConfig
 * @description Configuration for status badge display
 */
interface StatusBadgeConfig {
  variant: BadgeVariant;
  label: string;
}

// ===== CONSTANTS =====

/** Maximum number of page buttons to show in pagination */
const MAX_PAGINATION_BUTTONS = 5;

/** Currency formatter options for Nigerian Naira */
const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'NGN'
};

/** Date formatter options for order timestamps */
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

/**
 * @function AdminOrdersTable
 * @description Comprehensive orders table with responsive design and full order management capabilities
 * 
 * @param {AdminOrdersTableProps} props - Component props
 * @returns React component element
 * 
 * @example
 * ```tsx
 * <AdminOrdersTable
 *   orders={ordersList}
 *   total={150}
 *   currentPage={1}
 *   itemsPerPage={20}
 *   onPageChange={(page) => setCurrentPage(page)}
 *   onOrderClick={(order) => viewOrderDetails(order)}
 * />
 * ```
 */
export default function AdminOrdersTable({ 
  orders, 
  total, 
  currentPage, 
  itemsPerPage, 
  loading = false,
  onPageChange,
  onOrderClick,
  onSort
}: AdminOrdersTableProps) {
  
  // ===== COMPUTED VALUES =====

  /** Calculate pagination metadata */
  const paginationInfo = useMemo(() => {
  const totalPages = Math.ceil(total / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, total);

    return {
      totalPages,
      startItem,
      endItem,
      hasPages: totalPages > 1
    };
  }, [total, itemsPerPage, currentPage]);

  // ===== UTILITY FUNCTIONS =====

  /**
   * Format currency amount to Nigerian Naira
   * @param {number} amount - Amount in kobo (smallest currency unit)
   * @returns {string} Formatted currency string
   */
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-NG', CURRENCY_FORMAT_OPTIONS).format(amount);
  }, []);

  /**
   * Format date to localized string
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = useCallback((date: Date): string => {
    return new Date(date).toLocaleDateString('en-NG', DATE_FORMAT_OPTIONS);
  }, []);

  /**
   * Generate appropriate status badge based on order and payment status
   * @param {string} status - Order status
   * @param {string} paymentStatus - Payment status
   * @param {boolean} isActive - Whether the ticket is active
   * @returns React badge component
   */
  const getStatusBadge = useCallback((status: string, paymentStatus: string, isActive: boolean) => {
    let config: StatusBadgeConfig;

    if (paymentStatus === 'PAID') {
      config = isActive 
        ? { variant: "default", label: "Active" }
        : { variant: "secondary", label: "Used" };
    } else if (paymentStatus === 'PENDING') {
      config = { variant: "outline", label: "Pending" };
    } else if (paymentStatus === 'FAILED') {
      config = { variant: "destructive", label: "Failed" };
    } else {
      config = { variant: "outline", label: paymentStatus };
    }

    return <Badge variant={config.variant}>{config.label}</Badge>;
  }, []);

  /**
   * Generate summary text for order items
   * @param {Order['orderItems']} orderItems - Array of order items
   * @returns {string} Formatted ticket summary
   */
  const getTicketSummary = useCallback((orderItems: Order['orderItems']): string => {
    return orderItems
      .map(item => `${item.quantity}x ${item.ticketType.name}`)
      .join(', ');
  }, []);

  /**
   * Generate page numbers for pagination display
   * @returns {number[]} Array of page numbers to display
   */
  const getPageNumbers = useCallback((): number[] => {
    const { totalPages } = paginationInfo;
    
    if (totalPages <= MAX_PAGINATION_BUTTONS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => i + 1);
    }

    if (currentPage >= totalPages - 2) {
      return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => 
        totalPages - MAX_PAGINATION_BUTTONS + 1 + i
      );
    }

    return Array.from({ length: MAX_PAGINATION_BUTTONS }, (_, i) => 
      currentPage - 2 + i
    );
  }, [currentPage, paginationInfo]);

  // ===== EVENT HANDLERS =====

  /**
   * Handle sort button clicks
   * @param {string} field - Field name to sort by
   */
  const handleSort = useCallback((field: string) => {
    onSort?.(field);
  }, [onSort]);

  /**
   * Handle pagination navigation
   * @param {number} page - Target page number
   */
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      onPageChange(page);
    }
  }, [onPageChange, paginationInfo.totalPages]);

  /**
   * Handle order row click
   * @param {Order} order - Selected order
   */
  const handleOrderClick = useCallback((order: Order) => {
    onOrderClick(order);
  }, [onOrderClick]);

  // ===== LOADING STATE =====

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600" />
            <span>Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== EMPTY STATE =====

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p>No orders match your current search criteria.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Orders ({total})</CardTitle>
            <CardDescription>
              Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {total} orders
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('orderId')} 
                      className="h-auto p-0 font-medium"
                      type="button"
                    >
                      Order ID <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Tickets</th>
                  <th className="text-left p-3 font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('total')} 
                      className="h-auto p-0 font-medium"
                      type="button"
                    >
                      Amount <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('createdAt')} 
                      className="h-auto p-0 font-medium"
                      type="button"
                    >
                      Date <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-mono text-sm">{order.orderId}</div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{order.user.fullName}</div>
                        <div className="text-sm text-gray-600 truncate max-w-xs">
                          {order.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{getTicketSummary(order.orderItems)}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{formatCurrency(order.total)}</div>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(order.status, order.paymentStatus, order.isActive)}
                    </td>
                    <td className="p-3">
                      <div className="text-sm">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOrderClick(order)}
                        className="flex items-center space-x-1"
                        type="button"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline">View</span>
                        <span className="sm:hidden">Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {orders.map((order) => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:shadow-md transition-shadow" 
              onClick={() => handleOrderClick(order)}
            >
              <CardContent className="p-4">
                
                <div className="flex items-center justify-between mb-3">
                  <div className="font-mono text-sm font-medium">{order.orderId}</div>
                  {getStatusBadge(order.status, order.paymentStatus, order.isActive)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{order.user.fullName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{order.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                <Separator className="my-3" />
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 truncate">
                    {getTicketSummary(order.orderItems)}
                  </div>
                  <div className="font-medium">{formatCurrency(order.total)}</div>
                </div>
                
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Controls */}
        {paginationInfo.hasPages && (
          <div className="flex items-center justify-between mt-6">
            
            <div className="text-sm text-gray-600">
              Page {currentPage} of {paginationInfo.totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              
              {/* Previous Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center space-x-1"
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              {/* Page Number Buttons */}
              <div className="flex items-center space-x-1">
                {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                    onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8"
                    type="button"
                    >
                      {pageNum}
                    </Button>
                ))}
              </div>
              
              {/* Next Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationInfo.totalPages}
                className="flex items-center space-x-1"
                type="button"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
} 