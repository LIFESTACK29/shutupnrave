"use client";

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  CreditCard,
  Copy
} from 'lucide-react';
import { TicketStatus } from './OrderDetailsClient';

interface Order {
  orderId: string;
  paymentStatus: string;
  status: string;
  isActive: boolean;
  total: number;
  discountAmount?: number;
  discountCode?: string | null;
  createdAt: string | Date;
  user: {
    fullName: string;
  };
}

interface TicketDetailsHeaderProps {
  order: Order;
}

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

export default function TicketDetailsHeader({ order }: TicketDetailsHeaderProps) {
  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order.orderId);
      // You could add a toast notification here if you have one
    } catch (error) {
      console.error('Failed to copy order ID:', error);
    }
  };



  return (
    <div className="sticky top-0 z-50 bg-white shadow-lg border-b-2 border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Top Row: Logo and Navigation - Restructured for proper spacing */}
        <div className="flex items-center justify-between mb-6 min-h-[80px]">
          {/* Logo Section - Give it dedicated space */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <Link 
              href="/admin-page" 
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/shutupnrave-wb.png" 
                alt="Shut Up N Rave Logo"
                className="w-25 h-8 md:w-40 md:h-12 object-contain"
              />
        
            </Link>
          </div>

          {/* Navigation Button - Give it dedicated space */}
          <div className="flex-shrink-0">
            <Link href="/admin-page">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center space-x-2 text-sm px-6 py-3"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Bottom Row: Order Information and Status */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 p-4 bg-gray-50 rounded-lg border">
          {/* Order Info */}
          <div className="space-y-2 md:space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {order.orderId}
              </h1>
              <div className="flex items-center space-x-1">
                <Copy 
                  className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" 
                  onClick={handleCopyOrderId}
                />
              </div>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <p className="text-xs text-gray-600">
                Discount{order.discountCode ? ` (${order.discountCode})` : ''} applied: -₦{Number(order.discountAmount).toLocaleString()}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{order.user.fullName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDate(order.createdAt)} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-3 w-3" />
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={order.paymentStatus === 'PAID' ? 'default' : 'destructive'}
              className="text-xs font-medium"
            >
              {order.paymentStatus}
            </Badge>
            <Badge 
              variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}
              className="text-xs font-medium"
            >
              {order.status}
            </Badge>
            <TicketStatus isActive={order.isActive} />
            {(order.paymentStatus === 'PAID' && order.status === 'CONFIRMED') && (
              <Badge variant="outline" className="text-xs border-green-200 text-green-700 bg-green-50">
                ✓ Valid Ticket
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
