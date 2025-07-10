/**
 * @fileoverview Admin Dashboard Server Actions
 * @description This file contains all server actions for the admin dashboard functionality
 * including order management, email management, and ticket operations.
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use server";

import { revalidatePath } from 'next/cache';
import { deactivateTicket } from '@/app/server/checkout';
import { prisma } from '@/lib/db';
import { Order } from '@/types';
import type { Prisma } from '@prisma/client';

// ===== TYPE DEFINITIONS =====

/**
 * @type OrderWithIncludes
 * @description Prisma order type with all necessary includes for admin operations
 */
type OrderWithIncludes = Prisma.OrderGetPayload<{
  include: {
    user: true;
    orderItems: {
      include: {
        ticketType: true;
      };
    };
  };
}>;

/**
 * @interface PaginationParams
 * @description Parameters for pagination functionality
 */
interface PaginationParams {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * @interface TicketStatistics
 * @description Statistics for different ticket types
 */
interface TicketStatistics {
  count: number;
  revenue: number;
}

/**
 * @interface OrderFiltersResult
 * @description Result structure for order filtering operations
 */
interface OrderFiltersResult {
  success: boolean;
  orders?: Order[];
  allOrders?: Order[];
  pagination?: PaginationParams;
  ticketStats?: Record<string, TicketStatistics>;
  error?: string;
}

/**
 * @interface EmailData
 * @description Complete email data structure for admin email management
 */
export interface EmailData {
  id: string;
  email: string;
  source: 'newsletter' | 'customer';
  fullName?: string;
  phoneNumber?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Customer-specific metadata
  totalOrders?: number;
  lastOrderDate?: Date;
  // Deduplication tracking
  isBoth?: boolean;
  originalSources?: ('newsletter' | 'customer')[];
}

/**
 * @interface EmailStatistics
 * @description Email management statistics for admin dashboard
 */
interface EmailStatistics {
  totalEmails: number;
  newsletterSubscribers: number;
  customers: number;
  activeEmails: number;
  inactiveEmails: number;
}

/**
 * @interface EmailManagementResult
 * @description Result structure for email management operations
 */
interface EmailManagementResult {
  success: boolean;
  emails?: EmailData[];
  allEmails?: EmailData[];
  pagination?: PaginationParams;
  stats?: EmailStatistics;
  error?: string;
}

// ===== TICKET MANAGEMENT ACTIONS =====

/**
 * @function deactivateTicketAction
 * @description Server action to deactivate a ticket (mark as used)
 * @param {string} orderId - The unique identifier of the order containing the ticket
 * @returns {Promise<{success: boolean, error?: string}>} Result of the deactivation operation
 * 
 * @example
 * ```typescript
 * const result = await deactivateTicketAction('ORD-2025-ABC123');
 * if (result.success) {
 *   console.log('Ticket deactivated successfully');
 * }
 * ```
 */
export async function deactivateTicketAction(orderId: string): Promise<{success: boolean, error?: string}> {
  try {
    // Validate input
    if (!orderId || typeof orderId !== 'string') {
      return {
        success: false,
        error: "Invalid order ID provided"
      };
    }

    // Call the deactivation service
    const result = await deactivateTicket(orderId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to deactivate ticket"
      };
    }

    // Revalidate relevant pages to show updated data
    revalidatePath(`/admin-page/${orderId}`);
    revalidatePath('/admin-page');
    
    return {
      success: true
    };
  } catch (error) {
    console.error('[deactivateTicketAction] Unexpected error:', error);
    return {
      success: false,
      error: "An unexpected error occurred while deactivating the ticket"
    };
  }
}

// ===== ORDER MANAGEMENT ACTIONS =====

/**
 * @function getOrdersWithFilters
 * @description Retrieves orders with advanced filtering, searching, and pagination
 * @param {string} [searchQuery] - Search term for order ID, customer name, email, or phone
 * @param {string} [statusFilter] - Filter by order status ('all', 'PENDING', 'CONFIRMED', etc.)
 * @param {string} [activeFilter] - Filter by ticket status ('all', 'active', 'used')
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of orders per page
 * @returns {Promise<OrderFiltersResult>} Paginated orders with statistics
 * 
 * @example
 * ```typescript
 * const result = await getOrdersWithFilters('john@example.com', 'PAID', 'active', 1, 20);
 * if (result.success) {
 *   console.log(`Found ${result.orders?.length} orders`);
 * }
 * ```
 */
export async function getOrdersWithFilters(
  searchQuery?: string,
  statusFilter?: string,
  activeFilter?: string,
  page: number = 1,
  limit: number = 15
): Promise<OrderFiltersResult> {
  try {
    // Validate pagination parameters
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit))); // Cap at 100

    // Build database query filters
    const where: Prisma.OrderWhereInput = {};

    // Apply search filter across multiple fields
    if (searchQuery?.trim()) {
      const query = searchQuery.trim();
      where.OR = [
        { orderId: { contains: query, mode: 'insensitive' } },
        { user: { fullName: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: query } } }
      ];
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase() as Prisma.EnumOrderStatusFilter;
    }

    // Apply ticket activation filter
    if (activeFilter && activeFilter !== 'all') {
      where.isActive = activeFilter === 'active';
    }

    // Calculate pagination offset
    const skip = (validPage - 1) * validLimit;
    
    // Execute database queries in parallel for performance
    const [totalCount, orders, allOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
      where,
      include: {
        user: true,
        orderItems: {
          include: {
            ticketType: true
          }
        }
      },
        orderBy: { createdAt: 'desc' },
      skip,
        take: validLimit
      }),
      prisma.order.findMany({
      where,
      include: {
        user: true,
        orderItems: {
          include: {
            ticketType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
      })
    ]);

    // Transform database results to match our type system
    const transformOrder = (order: OrderWithIncludes): Order => ({
      ...order,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: {
        ...order.user,
        createdAt: order.user.createdAt,
        updatedAt: order.user.updatedAt
      },
      orderItems: order.orderItems.map((item) => ({
        ...item,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        ticketType: {
          ...item.ticketType,
          createdAt: item.ticketType.createdAt,
          updatedAt: item.ticketType.updatedAt
        }
      }))
    });

    const transformedOrders = orders.map(transformOrder);
    const transformedAllOrders = allOrders.map(transformOrder);

    // Calculate ticket type statistics for dashboard
    const ticketStats = transformedAllOrders.reduce((stats, order) => {
      order.orderItems.forEach(item => {
        const ticketType = item.ticketType.name;
        if (!stats[ticketType]) {
          stats[ticketType] = { count: 0, revenue: 0 };
        }
        stats[ticketType].count += item.quantity;
        stats[ticketType].revenue += item.totalPrice;
      });
      return stats;
    }, {} as Record<string, TicketStatistics>);

    // Prepare pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const pagination: PaginationParams = {
      currentPage: validPage,
      totalPages,
      totalCount,
      limit: validLimit,
      hasNext: validPage < totalPages,
      hasPrevious: validPage > 1
    };

    return {
      success: true,
      orders: transformedOrders,
      allOrders: transformedAllOrders,
      pagination,
      ticketStats
    };
  } catch (error) {
    console.error('[getOrdersWithFilters] Database query error:', error);
    return {
      success: false,
      error: 'Failed to fetch orders. Please try again.',
      orders: []
    };
  }
} 

// ===== EMAIL MANAGEMENT ACTIONS =====

/**
 * @function getNewsletterSubscribers
 * @description Retrieves all newsletter subscribers from the database
 * @returns {Promise<{success: boolean, subscribers?: EmailData[], error?: string}>}
 * 
 * @example
 * ```typescript
 * const result = await getNewsletterSubscribers();
 * if (result.success) {
 *   console.log(`Found ${result.subscribers?.length} newsletter subscribers`);
 * }
 * ```
 */
export async function getNewsletterSubscribers(): Promise<{success: boolean, subscribers?: EmailData[], error?: string}> {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const transformedSubscribers: EmailData[] = subscribers.map(subscriber => ({
      id: subscriber.id,
      email: subscriber.email,
      source: 'newsletter' as const,
      active: subscriber.active,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt
    }));

    return {
      success: true,
      subscribers: transformedSubscribers
    };
  } catch (error) {
    console.error('[getNewsletterSubscribers] Database error:', error);
    return {
      success: false,
      error: 'Failed to fetch newsletter subscribers',
      subscribers: []
    };
  }
}

/**
 * @function getCustomerEmails
 * @description Retrieves all customer emails with order statistics
 * @returns {Promise<{success: boolean, customers?: EmailData[], error?: string}>}
 * 
 * @example
 * ```typescript
 * const result = await getCustomerEmails();
 * if (result.success) {
 *   console.log(`Found ${result.customers?.length} customers`);
 * }
 * ```
 */
export async function getCustomerEmails(): Promise<{success: boolean, customers?: EmailData[], error?: string}> {
  try {
    const customers = await prisma.user.findMany({
      include: {
        orders: {
          include: {
            orderItems: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const customerEmails: EmailData[] = customers.map(customer => {
      // Calculate customer order statistics
    const totalOrders = customer.orders.length;
    const lastOrderDate = customer.orders.length > 0 
      ? new Date(Math.max(...customer.orders.map(order => order.createdAt.getTime())))
      : undefined;

    return {
      id: customer.id,
      email: customer.email,
      source: 'customer' as const,
      fullName: customer.fullName,
      phoneNumber: customer.phoneNumber,
      active: true, // All customers are considered active
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalOrders,
      lastOrderDate
    };
  });

    return {
      success: true,
      customers: customerEmails
    };
  } catch (error) {
    console.error('[getCustomerEmails] Database error:', error);
    return {
      success: false,
      error: 'Failed to fetch customer emails',
      customers: []
    };
  }
}

/**
 * @function getAllEmails
 * @description Retrieves and combines all emails with advanced filtering and deduplication
 * @param {string} [searchQuery] - Search term for email, name, or phone
 * @param {string} [sourceFilter] - Filter by source ('all', 'newsletter', 'customer')
 * @param {string} [activeFilter] - Filter by status ('all', 'active', 'inactive')
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=50] - Number of emails per page
 * @returns {Promise<EmailManagementResult>} Paginated emails with statistics
 * 
 * @example
 * ```typescript
 * const result = await getAllEmails('john', 'customer', 'active', 1, 25);
 * if (result.success) {
 *   console.log(`Found ${result.emails?.length} matching emails`);
 * }
 * ```
 */
export async function getAllEmails(
  searchQuery?: string,
  sourceFilter?: string,
  activeFilter?: string,
  page: number = 1,
  limit: number = 50
): Promise<EmailManagementResult> {
  try {
    // Validate pagination parameters
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));

    // Fetch all email data in parallel
    const [newsletterResult, customerResult] = await Promise.all([
      getNewsletterSubscribers(),
      getCustomerEmails()
    ]);

    if (!newsletterResult.success || !customerResult.success) {
      throw new Error('Failed to fetch email data from one or more sources');
    }

    // Combine all emails
    let allEmails: EmailData[] = [
      ...(newsletterResult.subscribers || []),
      ...(customerResult.customers || [])
    ];

    // Apply source filter
    if (sourceFilter && sourceFilter !== 'all') {
      allEmails = allEmails.filter(email => email.source === sourceFilter);
    }

    // Apply active status filter
    if (activeFilter && activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      allEmails = allEmails.filter(email => email.active === isActive);
    }

    // Apply search filter
    if (searchQuery?.trim()) {
      const query = searchQuery.trim().toLowerCase();
      allEmails = allEmails.filter(email => 
        email.email.toLowerCase().includes(query) ||
        (email.fullName?.toLowerCase().includes(query)) ||
        (email.phoneNumber?.includes(query))
      );
    }

    // Handle email deduplication (users who are both newsletter subscribers and customers)
    const emailMap = new Map<string, EmailData>();
    
    allEmails.forEach(email => {
      const existing = emailMap.get(email.email);
      
      if (!existing) {
        // First occurrence of this email
        emailMap.set(email.email, { ...email, isBoth: false });
      } else {
        // Handle duplicate - merge data and mark as both
        if (email.source === 'customer' && existing.source === 'newsletter') {
          // Prioritize customer data (more complete) but preserve newsletter status
          emailMap.set(email.email, { 
            ...email, 
            isBoth: true,
            originalSources: ['newsletter', 'customer']
          });
        } else if (email.source === 'newsletter' && existing.source === 'customer') {
          // Customer data exists, just mark as both
          emailMap.set(email.email, { 
            ...existing, 
            isBoth: true,
            originalSources: ['newsletter', 'customer']
          });
        }
      }
    });
    
    const uniqueEmails = Array.from(emailMap.values());

    // Sort by creation date (newest first)
    uniqueEmails.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Calculate pagination
    const totalCount = uniqueEmails.length;
    const totalPages = Math.ceil(totalCount / validLimit);
    const skip = (validPage - 1) * validLimit;
    const paginatedEmails = uniqueEmails.slice(skip, skip + validLimit);

    // Calculate comprehensive statistics
    const stats: EmailStatistics = {
      totalEmails: totalCount,
      newsletterSubscribers: allEmails.filter(e => 
        e.source === 'newsletter' || 
        (e.originalSources?.includes('newsletter'))
      ).length,
      customers: allEmails.filter(e => 
        e.source === 'customer' || 
        (e.originalSources?.includes('customer'))
      ).length,
      activeEmails: uniqueEmails.filter(e => e.active).length,
      inactiveEmails: uniqueEmails.filter(e => !e.active).length
    };

    const pagination: PaginationParams = {
      currentPage: validPage,
      totalPages,
      totalCount,
      limit: validLimit,
      hasNext: validPage < totalPages,
      hasPrevious: validPage > 1
    };

    return {
      success: true,
      emails: paginatedEmails,
      allEmails: uniqueEmails,
      pagination,
      stats
    };
  } catch (error) {
    console.error('[getAllEmails] Email processing error:', error);
    return {
      success: false,
      error: 'Failed to fetch and process emails. Please try again.',
      emails: [],
      stats: {
        totalEmails: 0,
        newsletterSubscribers: 0,
        customers: 0,
        activeEmails: 0,
        inactiveEmails: 0
      }
    };
  }
}

/**
 * @function exportEmails
 * @description Exports filtered emails to CSV format for download
 * @param {string} [searchQuery] - Search filter to apply
 * @param {string} [sourceFilter] - Source filter to apply
 * @param {string} [activeFilter] - Status filter to apply
 * @returns {Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}>}
 * 
 * @example
 * ```typescript
 * const result = await exportEmails('', 'customer', 'active');
 * if (result.success) {
 *   // Download the CSV file
 *   downloadFile(result.csvContent, result.filename);
 * }
 * ```
 */
export async function exportEmails(
  searchQuery?: string,
  sourceFilter?: string,
  activeFilter?: string
): Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}> {
  try {
    // Get all matching emails (large limit to ensure we get everything)
    const result = await getAllEmails(searchQuery, sourceFilter, activeFilter, 1, 10000);
    
    if (!result.success || !result.allEmails) {
      throw new Error(result.error || 'Failed to fetch emails for export');
    }

    // Define CSV headers
    const headers = [
      'Email',
      'Source',
      'Full Name',
      'Phone Number',
      'Status',
      'Total Orders',
      'Last Order Date',
      'Created Date'
    ];

    // Transform email data to CSV rows
    const rows = result.allEmails.map(email => [
      email.email,
      email.source === 'newsletter' ? 'Newsletter Subscriber' : 'Ticket Customer',
      email.fullName || '',
      email.phoneNumber || '',
      email.active ? 'Active' : 'Inactive',
      email.totalOrders?.toString() || '0',
      email.lastOrderDate ? email.lastOrderDate.toISOString().split('T')[0] : '',
      email.createdAt.toISOString().split('T')[0]
    ]);

    // Generate CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Generate filename with current date and filter info
    const filterSuffix = sourceFilter && sourceFilter !== 'all' ? `_${sourceFilter}` : '';
    const filename = `shutupnrave_emails${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

    return {
      success: true,
      csvContent,
      filename
    };
  } catch (error) {
    console.error('[exportEmails] Export error:', error);
    return {
      success: false,
      error: 'Failed to export emails. Please try again.'
    };
  }
} 