/**
 * @fileoverview Admin Order Search Component
 * @description Provides advanced search and filtering capabilities for order management
 * in the admin dashboard. Supports real-time search with debouncing and multiple filter types.
 * 
 * Features:
 * - Text search across order ID, customer name, and email
 * - Order status filtering (Pending, Confirmed, Cancelled, Refunded)
 * - Ticket status filtering (Active vs Used tickets)
 * - Auto-search with debouncing for real-time results
 * - Loading states and disabled state management
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// ===== TYPE DEFINITIONS =====

/**
 * @interface SearchFilters
 * @description Current state of all search and filter options
 */
interface SearchFilters {
  /** Text search query for order ID, customer name, or email */
  query: string;
  /** Order confirmation status filter */
  status: string;
  /** Ticket activation status filter */
  activeFilter: string;
}

/**
 * @interface AdminOrderSearchProps
 * @description Props for the AdminOrderSearch component
 */
interface AdminOrderSearchProps {
  /** Callback function triggered when search filters change */
  onSearch: (searchQuery: string, statusFilter: string, activeFilter: string) => void;
  /** Loading state to disable interactions during data fetching */
  isLoading?: boolean;
  /** Enable automatic search with debouncing (300ms delay) */
  autoSearch?: boolean;
}

// ===== CONSTANTS =====

/** Debounce delay for auto-search functionality (in milliseconds) */
const AUTO_SEARCH_DEBOUNCE_MS = 300;

/** Available order status options for filtering */
const ORDER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' }
] as const;

/** Available ticket status options for filtering */
const TICKET_STATUS_OPTIONS = [
  { value: 'all', label: 'All tickets' },
  { value: 'active', label: 'Active tickets' },
  { value: 'used', label: 'Used tickets' }
] as const;

/**
 * @function AdminOrderSearch
 * @description Advanced search and filtering component for order management
 * 
 * @param {AdminOrderSearchProps} props - Component props
 * @returns {JSX.Element} The search and filter interface
 * 
 * @example
 * ```tsx
 * <AdminOrderSearch
 *   onSearch={(query, status, active) => console.log('Search:', { query, status, active })}
 *   isLoading={false}
 *   autoSearch={true}
 * />
 * ```
 */
export default function AdminOrderSearch({ 
  onSearch, 
  isLoading = false, 
  autoSearch = false 
 }: AdminOrderSearchProps) {

  // ===== STATE MANAGEMENT =====

  /** Current filter state */
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    activeFilter: 'all',
  });

  // ===== CALLBACK FUNCTIONS =====

  /**
   * Handle manual search button click
   * Triggers the search callback with current filter values
   */
  const handleSearch = useCallback(() => {
    onSearch(filters.query, filters.status, filters.activeFilter);
  }, [filters, onSearch]);

  /**
   * Update a specific filter value
   * @param {keyof SearchFilters} key - The filter key to update
   * @param {string} value - The new value for the filter
   */
  const updateFilter = useCallback((key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // ===== SIDE EFFECTS =====

  /**
   * Auto-search effect with debouncing
   * Automatically triggers search when filters change (if autoSearch is enabled)
   */
  useEffect(() => {
    if (!autoSearch) return;

    const timeoutId = setTimeout(() => {
      onSearch(filters.query, filters.status, filters.activeFilter);
    }, AUTO_SEARCH_DEBOUNCE_MS);

    // Cleanup timeout on dependency change or unmount
    return () => clearTimeout(timeoutId);
  }, [filters, onSearch, autoSearch]);

  // ===== RENDER =====

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="h-5 w-5" />
          <span>Search & Filter Orders</span>
        </CardTitle>
        <CardDescription>
          Search by order ID, customer name, or email. Use filters to narrow down results.
          {autoSearch && " (Auto-search enabled - results update as you type)"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        
        {/* Text Search Input */}
        <div className="space-y-2">
          <Label htmlFor="query">Search</Label>
          <Input
            id="query"
            type="text"
            placeholder="Order ID, customer name, or email..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Order Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select 
              value={filters.status} 
              onValueChange={(value) => updateFilter('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="activeStatus">Ticket Status</Label>
            <Select 
              value={filters.activeFilter} 
              onValueChange={(value) => updateFilter('activeFilter', value)}
              disabled={isLoading}
            >
              <SelectTrigger id="activeStatus">
                <SelectValue placeholder="All tickets" />
              </SelectTrigger>
              <SelectContent>
                {TICKET_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        </div>

        {/* Manual Search Button - Only displayed when auto-search is disabled */}
        {!autoSearch && (
        <div className="flex items-center space-x-3 pt-2">
            <Button 
              onClick={handleSearch} 
              disabled={isLoading} 
              className="flex items-center space-x-2"
              type="button"
            >
              {isLoading ? (
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search Orders</span>
              </>
            )}
          </Button>
          </div>
        )}
          
      </CardContent>
    </Card>
  );
} 