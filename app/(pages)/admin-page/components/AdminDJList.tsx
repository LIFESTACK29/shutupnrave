/**
 * @fileoverview Admin DJ Applications List Component
 * @description List component for displaying and managing DJ applications with pagination
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Music, 
  Instagram, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Eye
} from 'lucide-react';
import Pagination from './Pagination';
import { DJApplicationStatus } from '@prisma/client';

// ===== TYPE DEFINITIONS =====

/**
 * @interface DJApplication
 * @description Complete DJ application data structure
 */
interface DJApplication {
  id: string;
  fullName: string;
  phoneNumber: string;
  instagramHandle: string;
  mixLink: string;
  status: DJApplicationStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface AdminDJListProps
 * @description Props for the AdminDJList component
 */
interface AdminDJListProps {
  applications: DJApplication[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onStatusUpdate?: (applicationId: string, status: DJApplicationStatus) => Promise<void>;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Format date to readable string
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get status badge variant
 */
function getStatusBadgeVariant(status: DJApplicationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case DJApplicationStatus.APPROVED: return 'default';
    case DJApplicationStatus.REJECTED: return 'destructive';
    case DJApplicationStatus.PENDING: return 'secondary';
    default: return 'outline';
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: DJApplicationStatus) {
  switch (status) {
    case DJApplicationStatus.APPROVED: return CheckCircle;
    case DJApplicationStatus.REJECTED: return XCircle;
    case DJApplicationStatus.PENDING: return Clock;
    default: return Clock;
  }
}

/**
 * Normalize Instagram handle for display
 */
function formatInstagramHandle(handle: string): string {
  return handle.startsWith('@') ? handle : `@${handle}`;
}

/**
 * Get platform name from URL
 */
function getPlatformName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('spotify')) return 'Spotify';
    if (hostname.includes('audiomack')) return 'Audiomack';
    if (hostname.includes('apple')) return 'Apple Music';
    if (hostname.includes('soundcloud')) return 'SoundCloud';
    if (hostname.includes('youtube') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('mixcloud')) return 'Mixcloud';
    return 'Music Platform';
  } catch {
    return 'Music Platform';
  }
}

/**
 * @function AdminDJList
 * @description Component for displaying paginated DJ applications with management actions
 * @param {AdminDJListProps} props - Component props
 * @returns {JSX.Element} The DJ applications list interface
 */
export default function AdminDJList({
  applications,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onStatusUpdate
}: AdminDJListProps) {

  // ===== STATE MANAGEMENT =====
  
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  // ===== EVENT HANDLERS =====

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (applicationId: string, newStatus: DJApplicationStatus) => {
    if (!onStatusUpdate || updatingStatus) return;
    
    setUpdatingStatus(applicationId);
    try {
      await onStatusUpdate(applicationId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  /**
   * Toggle application details
   */
  const toggleExpanded = (applicationId: string) => {
    setExpandedApplication(prev => prev === applicationId ? null : applicationId);
  };

  // ===== LOADING STATE =====

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ===== EMPTY STATE =====

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No DJ Applications</h3>
        <p className="text-gray-600">No DJ applications found matching your criteria.</p>
      </div>
    );
  }

  // ===== MAIN RENDER =====

  return (
    <div className="space-y-4">
      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((application) => {
          const StatusIcon = getStatusIcon(application.status);
          const isExpanded = expandedApplication === application.id;
          const isUpdating = updatingStatus === application.id;

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                
                {/* Main Application Row */}
                <div className="flex items-center justify-between">
                  
                  {/* Application Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{application.fullName}</h3>
                        <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {application.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Instagram className="w-3 h-3" />
                          <span>{formatInstagramHandle(application.instagramHandle)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{application.phoneNumber}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(application.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {/* Mix Link */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(application.mixLink, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {getPlatformName(application.mixLink)}
                    </Button>
                    
                    {/* View Details */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(application.id)}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {isExpanded ? 'Hide' : 'Details'}
                    </Button>
                    
                    {/* Status Actions */}
                    {onStatusUpdate && application.status === DJApplicationStatus.PENDING && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, DJApplicationStatus.APPROVED)}
                          disabled={isUpdating}
                          className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, DJApplicationStatus.REJECTED)}
                          disabled={isUpdating}
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-4">
                      
                      {/* Basic Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Contact Information</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{application.phoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Instagram className="w-4 h-4 text-gray-400" />
                            <a 
                              href={`https://instagram.com/${application.instagramHandle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {formatInstagramHandle(application.instagramHandle)}
                            </a>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Application Details</h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Submitted:</span> {formatDate(application.submittedAt)}
                          </div>
                          {application.reviewedAt && (
                            <div>
                              <span className="font-medium">Reviewed:</span> {formatDate(application.reviewedAt)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Mix Platform:</span> {getPlatformName(application.mixLink)}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                    

                  </div>
                )}
                
              </CardContent>
            </Card>
          );
        })}
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
