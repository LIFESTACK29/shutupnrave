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
import { Resend } from 'resend';
import { render } from '@react-email/render';
import AffiliateWelcomeEmail from '@/emails/affiliate-welcome';
import { z } from 'zod';

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
      discountId: (order as any).discountId ?? null,
      discountCode: (order as any).discountCode ?? null,
      discountType: (order as any).discountType ?? null,
      discountRate: (order as any).discountRate ?? null,
      discountAmount: (order as any).discountAmount ?? 0,
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

// ===== AFFILIATE MANAGEMENT ACTIONS =====

export interface AffiliateListItem {
  id: string;
  refCode: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  stats: {
    successfulOrders: number;
    ticketsSold: number;
    subtotalRevenue: number; // in kobo
    totalCommission: number; // in kobo
    byTicketType?: Record<string, number>;
  };
}

export interface AffiliateListResult {
  success: boolean;
  affiliates?: AffiliateListItem[];
  pagination?: PaginationParams;
  error?: string;
}

export async function getAffiliates(
  searchQuery: string = '',
  page: number = 1,
  limit: number = 20
): Promise<AffiliateListResult> {
  try {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));

    const where: Prisma.AffiliateWhereInput = {};

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { refCode: { contains: q, mode: 'insensitive' } },
        { user: { fullName: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { phoneNumber: { contains: q } } }
      ];
    }

    const skip = (validPage - 1) * validLimit;

    const [totalCount, affiliates] = await Promise.all([
      prisma.affiliate.count({ where }),
      prisma.affiliate.findMany({
        where,
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit
      })
    ]);

    // Compute stats per affiliate (paid & confirmed orders only)
    const affiliatesWithStats: AffiliateListItem[] = [];

    for (const a of affiliates) {
      const successfulOrders = await prisma.order.findMany({
        where: {
          affiliateId: a.id,
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        },
        include: {
          orderItems: true
        }
      });

      const ticketsSold = successfulOrders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0);
      const subtotalRevenue = successfulOrders.reduce((sum, o) => sum + o.subtotal, 0);

      // Build counts by ticket type name
      const byTicketType = successfulOrders.reduce((acc, o) => {
        o.orderItems.forEach(item => {
          const key = String(item.ticketTypeId); // temporary by id first
          acc[key] = (acc[key] || 0) + item.quantity;
        });
        return acc;
      }, {} as Record<string, number>);

      const commissionAgg = await prisma.affiliateCommission.aggregate({
        _sum: { commissionAmount: true },
        where: {
          affiliateId: a.id,
          orderItem: { order: { paymentStatus: 'PAID', status: 'CONFIRMED' } }
        }
      });

      // Resolve ticketTypeId -> name mapping for display
      let byTicketTypeNamed: Record<string, number> | undefined = undefined;
      if (Object.keys(byTicketType).length) {
        const ids = Object.keys(byTicketType);
        const types = await prisma.ticketType.findMany({ where: { id: { in: ids } } });
        byTicketTypeNamed = {};
        for (const t of types) {
          byTicketTypeNamed[t.name] = byTicketType[t.id] || 0;
        }
      }

      affiliatesWithStats.push({
        id: a.id,
        refCode: a.refCode,
        createdAt: a.createdAt,
        user: {
          id: a.user.id,
          fullName: a.user.fullName,
          email: a.user.email,
          phoneNumber: a.user.phoneNumber
        },
        stats: {
          successfulOrders: successfulOrders.length,
          ticketsSold,
          subtotalRevenue,
          totalCommission: commissionAgg._sum.commissionAmount || 0,
          byTicketType: byTicketTypeNamed
        }
      });
    }

    const pagination: PaginationParams = {
      currentPage: validPage,
      totalPages: Math.max(1, Math.ceil(totalCount / validLimit)),
      totalCount,
      limit: validLimit,
      hasNext: validPage * validLimit < totalCount,
      hasPrevious: validPage > 1
    };

    return { success: true, affiliates: affiliatesWithStats, pagination };
  } catch (error) {
    console.error('[getAffiliates] Error:', error);
    return { success: false, error: 'Failed to fetch affiliates' };
  }
}

export interface AffiliateDetailsResult {
  success: boolean;
  affiliate?: {
    id: string;
    refCode: string;
    createdAt: Date;
    user: {
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    commissionRules: Array<{ ticketTypeName: string; type: 'PERCENTAGE' | 'FIXED_AMOUNT'; rate?: number; amount?: number }>;
  };
  stats?: {
    successfulOrders: number;
    ticketsSold: number;
    subtotalRevenue: number;
    totalCommission: number;
    byTicketType: Record<string, { tickets: number; revenue: number; commission: number }>;
  };
  recentOrders?: Array<{ id: string; orderId: string; createdAt: Date; subtotal: number; total: number }>;
  error?: string;
}

export async function getAffiliateDetails(affiliateId: string): Promise<AffiliateDetailsResult> {
  try {
    if (!affiliateId) return { success: false, error: 'Affiliate ID is required' };

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: {
        user: true,
        commissionRules: { include: { ticketType: true } }
      }
    });

    if (!affiliate) return { success: false, error: 'Affiliate not found' };

    const successfulOrders = await prisma.order.findMany({
      where: { affiliateId, paymentStatus: 'PAID', status: 'CONFIRMED' },
      include: { orderItems: { include: { ticketType: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const commissionAgg = await prisma.affiliateCommission.aggregate({
      _sum: { commissionAmount: true },
      where: { affiliateId, orderItem: { order: { paymentStatus: 'PAID', status: 'CONFIRMED' } } }
    });

    const byTicketType = successfulOrders.reduce((acc, order) => {
      order.orderItems.forEach(item => {
        const key = item.ticketType.name;
        if (!acc[key]) acc[key] = { tickets: 0, revenue: 0, commission: 0 };
        acc[key].tickets += item.quantity;
        acc[key].revenue += item.totalPrice;
      });
      return acc;
    }, {} as Record<string, { tickets: number; revenue: number; commission: number }>);

    // Fill commission per ticket type from AffiliateCommission
    const commissionsByType = await prisma.affiliateCommission.groupBy({
      by: ['ticketTypeId'],
      _sum: { commissionAmount: true },
      where: { affiliateId, orderItem: { order: { paymentStatus: 'PAID', status: 'CONFIRMED' } } }
    });

    const ticketTypes = await prisma.ticketType.findMany({});
    for (const row of commissionsByType) {
      const t = ticketTypes.find(tt => tt.id === row.ticketTypeId);
      if (!t) continue;
      if (!byTicketType[t.name]) byTicketType[t.name] = { tickets: 0, revenue: 0, commission: 0 };
      byTicketType[t.name].commission = row._sum.commissionAmount || 0;
    }

    const details: AffiliateDetailsResult = {
      success: true,
      affiliate: {
        id: affiliate.id,
        refCode: affiliate.refCode,
        createdAt: affiliate.createdAt,
        user: {
          id: affiliate.user.id,
          fullName: affiliate.user.fullName,
          email: affiliate.user.email,
          phoneNumber: affiliate.user.phoneNumber
        },
        commissionRules: affiliate.commissionRules.map(r => ({
          ticketTypeName: r.ticketType.name,
          type: r.commissionType as 'PERCENTAGE' | 'FIXED_AMOUNT',
          rate: r.rate ?? undefined,
          amount: r.amount ?? undefined
        }))
      },
      stats: {
        successfulOrders: successfulOrders.length,
        ticketsSold: successfulOrders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0),
        subtotalRevenue: successfulOrders.reduce((sum, o) => sum + o.subtotal, 0),
        totalCommission: commissionAgg._sum.commissionAmount || 0,
        byTicketType
      },
      recentOrders: successfulOrders.slice(0, 20).map(o => ({ id: o.id, orderId: o.orderId, createdAt: o.createdAt, subtotal: o.subtotal, total: o.total }))
    };

    return details;
  } catch (error) {
    console.error('[getAffiliateDetails] Error:', error);
    return { success: false, error: 'Failed to fetch affiliate details' };
  }
}

// ===== AFFILIATE CREATION ACTION =====

export interface CreateAffiliateInput {
  email: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export interface CreateAffiliateResult {
  success: boolean;
  affiliateId?: string;
  refCode?: string;
  link?: string;
  error?: string;
}

function generateRefCode(fullName?: string) {
  const base = (fullName || '').replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase();
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(2, 8);
  return `${base || 'AFF'}${suffix}`;
}

export async function createAffiliateAndSendEmail(input: CreateAffiliateInput): Promise<CreateAffiliateResult> {
  try {
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return { success: false, error: 'Valid email is required' };
    }
    if (input.password && input.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shutupnrave.com';
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!resendKey || !fromEmail) {
      return { success: false, error: 'Email service is not configured' };
    }

    const resend = new Resend(resendKey);

    // Upsert user by email
    const user = await prisma.user.upsert({
      where: { email: input.email },
      update: {
        fullName: input.fullName ?? undefined,
        phoneNumber: input.phoneNumber ?? undefined,
      },
      create: {
        email: input.email,
        fullName: input.fullName || input.email.split('@')[0],
        phoneNumber: input.phoneNumber || ''
      }
    });

    // Ensure unique refCode
    let refCode = generateRefCode(user.fullName);
    // Attempt a few times to avoid rare collisions
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.affiliate.findUnique({ where: { refCode } }).catch(() => null);
      if (!exists) break;
      refCode = generateRefCode(user.fullName);
    }

    // Create affiliate (or fetch if already exists)
    const affiliate = await prisma.affiliate.upsert({
      where: { userId: user.id },
      update: input.password ? { passwordHash: await (await import('bcryptjs')).default.hash(input.password, 10) } : {},
      create: {
        userId: user.id,
        refCode,
        status: 'ACTIVE',
        passwordHash: input.password ? await (await import('bcryptjs')).default.hash(input.password, 10) : null
      }
    });

    // If affiliate existed without refCode, backfill
    if (!affiliate.refCode) {
      const updated = await prisma.affiliate.update({ where: { id: affiliate.id }, data: { refCode } });
      refCode = updated.refCode;
    }

    const link = `${appUrl}/tickets?ref=${encodeURIComponent(refCode)}`;

    const html = await render(
      AffiliateWelcomeEmail({
        appUrl,
        fullName: user.fullName,
        refCode,
        link,
        email: user.email,
        temporaryPassword: input.password || undefined
      })
    );

    await resend.emails.send({
      from: `ShutUpNRave <${fromEmail}>`,
      to: [user.email],
      subject: 'Your ShutUpNRave Affiliate Link',
      html
    });

    return { success: true, affiliateId: affiliate.id, refCode, link };
  } catch (error) {
    console.error('[createAffiliateAndSendEmail] Error:', error);
    return { success: false, error: 'Failed to create affiliate or send email' };
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

// ===== DISCOUNT MANAGEMENT ACTIONS =====

const CreateDiscountSchema = z.object({
  code: z.string().trim().min(3).max(32).optional(),
  percentage: z.number().gt(0).lte(1), // 0.1 for 10%
  isActive: z.boolean().optional(),
});

export async function createDiscount(input: { code?: string; percentage: number; isActive?: boolean }): Promise<{ success: boolean; id?: string; code?: string; error?: string }>{
  try {
    const parsed = CreateDiscountSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'Invalid discount input' };
    const code = (parsed.data.code || Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(2, 10)).toUpperCase();
    const discount = await prisma.discount.create({
      data: {
        code,
        type: 'PERCENTAGE',
        percentage: parsed.data.percentage,
        isActive: parsed.data.isActive ?? true,
      }
    });
    return { success: true, id: discount.id, code: discount.code };
  } catch (e) {
    console.error('[createDiscount] Error:', e);
    return { success: false, error: 'Failed to create discount' };
  }
}

export async function listDiscounts(): Promise<{ success: boolean; discounts?: Array<{ id: string; code: string; percentage: number; isActive: boolean; usageCount: number; createdAt: Date }>; error?: string }>{
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    return {
      success: true,
      discounts: discounts.map(d => ({ id: d.id, code: d.code, percentage: d.percentage, isActive: d.isActive, usageCount: d.usageCount, createdAt: d.createdAt }))
    };
  } catch (e) {
    console.error('[listDiscounts] Error:', e);
    return { success: false, error: 'Failed to fetch discounts' };
  }
}

export async function setDiscountActive(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }>{
  try {
    await prisma.discount.update({ where: { id }, data: { isActive } });
    return { success: true };
  } catch (e) {
    console.error('[setDiscountActive] Error:', e);
    return { success: false, error: 'Failed to update discount' };
  }
}

const UpdateDiscountSchema = z.object({
  code: z.string().trim().min(3).max(32),
  percentage: z.number().gt(0).lte(1), // 0.1 for 10%
  isActive: z.boolean(),
});

export async function updateDiscount(
  id: string,
  input: { code: string; percentage: number; isActive: boolean }
): Promise<{ success: boolean; error?: string }>{
  try {
    const parsed = UpdateDiscountSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: 'Invalid discount input' };

    // Check if code already exists for a different discount
    const existing = await prisma.discount.findUnique({ where: { code: parsed.data.code.toUpperCase() } });
    if (existing && existing.id !== id) {
      return { success: false, error: 'Discount code already exists' };
    }

    await prisma.discount.update({
      where: { id },
      data: {
        code: parsed.data.code.toUpperCase(),
        percentage: parsed.data.percentage,
        isActive: parsed.data.isActive,
      }
    });
    return { success: true };
  } catch (e) {
    console.error('[updateDiscount] Error:', e);
    return { success: false, error: 'Failed to update discount' };
  }
}

export async function deleteDiscount(id: string): Promise<{ success: boolean; error?: string }>{
  try {
    await prisma.discount.delete({ where: { id } });
    return { success: true };
  } catch (e) {
    console.error('[deleteDiscount] Error:', e);
    return { success: false, error: 'Failed to delete discount' };
  }
}