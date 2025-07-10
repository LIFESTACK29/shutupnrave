"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Phone, Calendar, ShoppingBag, Activity } from 'lucide-react';
import { EmailData } from '@/app/(pages)/admin-page/actions';
import Pagination from './Pagination';

interface AdminEmailListProps {
  emails: EmailData[];
  isLoading?: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export default function AdminEmailList({ 
  emails, 
  isLoading = false, 
  currentPage, 
  totalPages, 
  totalCount, 
  onPageChange 
}: AdminEmailListProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
          <p className="text-gray-600">
            No emails match your current search criteria. Try adjusting your filters or search terms.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email List */}
      <div className="space-y-4">
        {emails.map((email) => (
          <Card key={email.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {email.email}
                      </h3>
                    </div>
                    
                    {email.fullName && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{email.fullName}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant={email.source === 'customer' ? 'default' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {email.source === 'customer' ? (
                        <ShoppingBag className="h-3 w-3" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {email.source === 'customer' ? 'Customer' : 'Newsletter'}
                    </Badge>
                    
                    <Badge 
                      variant={email.active ? 'default' : 'destructive'}
                      className="flex items-center gap-1"
                    >
                      <Activity className="h-3 w-3" />
                      {email.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                  {/* Phone Number */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium">
                        {email.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Joined</p>
                      <p className="text-sm font-medium">
                        {formatDate(email.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Orders (for customers) */}
                  {email.source === 'customer' && (
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Orders</p>
                        <p className="text-sm font-medium">
                          {email.totalOrders || 0} order{(email.totalOrders || 0) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}



                  {/* Last Order Date (for customers) */}
                  {email.source === 'customer' && email.lastOrderDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Last Order</p>
                        <p className="text-sm font-medium">
                          {formatDate(email.lastOrderDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemsPerPage={20}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
} 