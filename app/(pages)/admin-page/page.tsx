/**
 * @fileoverview Admin Dashboard Main Page
 * @description Main dashboard page for the ShutUpNRave admin panel providing comprehensive
 * order management, ticket tracking, and event statistics.
 * 
 * Features:
 * - Real-time order statistics and analytics
 * - Advanced search and filtering capabilities
 * - Ticket type breakdown and revenue tracking
 * - Responsive design for all device sizes
 * - Live pagination and data management
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  QrCode, 
  Users, 
  Calendar, 
  Database, 
  Music, 
  Zap, 
  Ticket, 
  DollarSign, 
  Banknote 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Local component imports
import AdminOrderSearch from './components/AdminOrderSearch';
import AdminOrdersTable from './components/AdminOrdersTable';
import AdminHeader from './components/AdminHeader';
import { getOrdersWithFilters } from './actions';
import { Order } from '@/types';

// ===== TYPE DEFINITIONS =====

/**
 * @interface DashboardStatistics
 * @description Statistics displayed on the admin dashboard
 */
interface DashboardStatistics {
  totalOrders: number;
  activeTickets: number;
  usedTickets: number;
  soloVibesCount: number;
  gengEnergyCount: number;
  soloVibesRevenue: number;
  gengEnergyRevenue: number;
  totalTicketsSold: number;
  totalProcessingFees: number;
  totalSubtotal: number;
}

/**
 * @interface FilterState
 * @description Current filter state for order display
 */
interface FilterState {
  searchQuery: string;
  statusFilter: string;
  activeFilter: string;
}

/**
 * @interface PaginationState
 * @description Current pagination state
 */
interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

// ===== CONSTANTS =====

/** Default items per page for pagination */
const ITEMS_PER_PAGE = 20;

/** Event date for display */
const EVENT_DATE = 'Nov 29, 2025';

/**
 * @function AdminPage
 * @description Main admin dashboard component with comprehensive order management
 * @returns {JSX.Element} The complete admin dashboard interface
 * 
 * @example
 * ```tsx
 * <AdminPage />
 * ```
 */
export default function AdminPage() {
  const router = useRouter();

  // ===== STATE MANAGEMENT =====

  /** All orders loaded from the database (used for statistics) */
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  
  /** Currently displayed orders (filtered and paginated) */
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  
  /** Loading state for async operations */
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /** Current filter state */
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    statusFilter: 'all',
    activeFilter: 'all'
  });
  
  /** Current pagination state */
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // ===== COMPUTED VALUES =====

  /**
   * Calculate comprehensive dashboard statistics from all orders
   * Memoized for performance optimization
   */
  const statistics = useMemo<DashboardStatistics>(() => {
    if (!allOrders.length) {
      return {
        totalOrders: 0,
        activeTickets: 0,
        usedTickets: 0,
        soloVibesCount: 0,
        gengEnergyCount: 0,
        soloVibesRevenue: 0,
        gengEnergyRevenue: 0,
        totalTicketsSold: 0,
        totalProcessingFees: 0,
        totalSubtotal: 0
      };
    }

    const stats: DashboardStatistics = {
      totalOrders: allOrders.length,
      activeTickets: allOrders.filter(order => order.isActive).length,
      usedTickets: allOrders.filter(order => !order.isActive).length,
      soloVibesCount: 0,
      gengEnergyCount: 0,
      soloVibesRevenue: 0,
      gengEnergyRevenue: 0,
      totalTicketsSold: 0,
      totalProcessingFees: 0,
      totalSubtotal: 0
    };

    // Calculate detailed ticket and revenue statistics
    allOrders.forEach(order => {
      stats.totalProcessingFees += order.processingFee;
      stats.totalSubtotal += order.subtotal;
      
      order.orderItems.forEach(item => {
        stats.totalTicketsSold += item.quantity;
        
        if (item.ticketType.name === 'Solo Vibes') {
          stats.soloVibesCount += item.quantity;
          stats.soloVibesRevenue += item.totalPrice;
        } else if (item.ticketType.name === 'Geng Energy') {
          stats.gengEnergyCount += item.quantity;
          stats.gengEnergyRevenue += item.totalPrice;
        }
      });
    });
    
    return stats;
  }, [allOrders]);

  /**
   * Apply client-side filtering to orders
   * Memoized for performance optimization
   */
  const clientFilteredOrders = useMemo(() => {
    if (!allOrders.length) return [];

    let filtered = allOrders;

    // Apply search filter across multiple fields
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(query) ||
        order.user.fullName.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        order.user.phoneNumber.includes(query)
      );
    }

    // Apply order status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === filters.statusFilter.toUpperCase());
    }

    // Apply ticket activation filter
    if (filters.activeFilter !== 'all') {
      const isActive = filters.activeFilter === 'active';
      filtered = filtered.filter(order => order.isActive === isActive);
    }

    return filtered;
  }, [allOrders, filters]);

  // ===== CALLBACK FUNCTIONS =====

  /**
   * Load all orders from the database
   * This runs once on component mount to populate the statistics
   */
  const loadAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getOrdersWithFilters('', 'all', 'all', 1, 10000);
      if (result.success && result.allOrders) {
        setAllOrders(result.allOrders);
      } else {
        console.error('Failed to fetch orders:', result.error);
        setAllOrders([]);
      }
    } catch (error) {
      console.error('[AdminPage] Error fetching orders:', error);
      setAllOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle search and filter updates
   * Updates filter state and resets pagination
   */
  const handleSearch = useCallback((searchQuery: string, statusFilter: string, activeFilter: string) => {
    setFilters({
      searchQuery,
      statusFilter,
      activeFilter
    });
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  }, []);

  /**
   * Handle pagination changes
   */
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  /**
   * Handle order click navigation
   * Navigates to the detailed order page
   */
  const handleOrderClick = useCallback((order: Order) => {
    router.push(`/admin-page/${order.orderId}`);
  }, [router]);

  // ===== SIDE EFFECTS =====

  /**
   * Load initial data on component mount
   */
  useEffect(() => {
    loadAllOrders();
  }, [loadAllOrders]);

  /**
   * Update pagination and filtered orders when filters or page changes
   */
  useEffect(() => {
    const totalFiltered = clientFilteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / ITEMS_PER_PAGE));
    
    // Calculate pagination bounds
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedOrders = clientFilteredOrders.slice(startIndex, endIndex);

    // Update displayed orders and pagination metadata
    setFilteredOrders(paginatedOrders);
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalCount: totalFiltered
    }));

    // Auto-correct page if it's beyond available pages
    if (pagination.currentPage > totalPages && totalPages > 0) {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
    }
  }, [clientFilteredOrders, pagination.currentPage]);

  // ===== RENDER STATISTICS CARDS =====

  /**
   * Render a statistics card component
   */
  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    colorClass 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    colorClass: string;
  }) => (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Icon className={`h-6 w-6 md:h-8 md:w-8 ${colorClass}`} />
          <div>
            <p className="text-xs md:text-sm text-gray-600">{title}</p>
            <p className="text-xl md:text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ===== MAIN RENDER =====

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <AdminHeader />

      {/* Main Dashboard Content */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        
        {/* Welcome Section */}
        <div className="text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Search, filter, and manage all ticket orders for shutupnraveee 2025. 
            View order details, verify tickets, and track event attendance.
          </p>
        </div>

        {/* Statistics Dashboard - Always shows data from ALL orders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Core Statistics */}
          <StatCard
            icon={Database}
            title="Total Orders"
            value={statistics.totalOrders}
            colorClass="text-blue-600"
          />
          
          <StatCard
            icon={QrCode}
            title="Active Tickets"
            value={statistics.activeTickets}
            colorClass="text-green-600"
          />
          
          <StatCard
            icon={Users}
            title="Used Tickets"
            value={statistics.usedTickets}
            colorClass="text-red-600"
          />
          
          {/* Event Information */}
          <StatCard
            icon={Calendar}
            title="Event Date"
            value={EVENT_DATE}
            colorClass="text-yellow-600"
          />

          {/* Ticket Type Statistics */}
          <StatCard
            icon={Music}
            title="Solo Vibes Sold"
            value={statistics.soloVibesCount}
            subtitle={`₦${statistics.soloVibesRevenue.toLocaleString()}`}
            colorClass="text-purple-600"
          />

          <StatCard
            icon={Zap}
            title="Geng Energy Sold"
            value={statistics.gengEnergyCount}
            subtitle={`₦${statistics.gengEnergyRevenue.toLocaleString()}`}
            colorClass="text-orange-600"
          />

          {/* Financial Statistics */}
          <StatCard
            icon={Ticket}
            title="Total Tickets Sold"
            value={statistics.totalTicketsSold}
            colorClass="text-indigo-600"
          />

          <StatCard
            icon={DollarSign}
            title="Processing Fees"
            value={`₦${statistics.totalProcessingFees.toLocaleString()}`}
            colorClass="text-emerald-600"
          />

          <StatCard
            icon={Banknote}
            title="Tickets Subtotal"
            value={`₦${statistics.totalSubtotal.toLocaleString()}`}
            colorClass="text-blue-600"
          />

        </div>

        {/* Search and Filter Controls */}
        <AdminOrderSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          autoSearch={true}
        />

        {/* Orders Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>
              Showing {filteredOrders.length} of {pagination.totalCount} filtered orders
              {(filters.searchQuery || filters.statusFilter !== 'all' || filters.activeFilter !== 'all') && 
                ` (${statistics.totalOrders} total orders)`
              }
            </CardDescription>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="p-0">
            <AdminOrdersTable 
              orders={filteredOrders}
              total={pagination.totalCount}
              currentPage={pagination.currentPage}
              itemsPerPage={pagination.itemsPerPage}
              loading={isLoading}
              onPageChange={handlePageChange}
              onOrderClick={handleOrderClick}
            />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}