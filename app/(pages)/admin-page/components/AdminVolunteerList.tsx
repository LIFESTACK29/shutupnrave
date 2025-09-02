/**
 * @fileoverview Admin Volunteer Applications List Component
 * @description List component for displaying and managing volunteer applications with pagination
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
  Heart, 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  User,
  Users
} from 'lucide-react';
import Pagination from './Pagination';
import { Gender, VolunteerRole, VolunteerApplicationStatus } from '@prisma/client';

// ===== TYPE DEFINITIONS =====

/**
 * @interface VolunteerApplication
 * @description Complete volunteer application data structure
 */
interface VolunteerApplication {
  id: string;
  fullName: string;
  phoneNumber: string;
  gender: Gender;
  role: VolunteerRole;
  status: VolunteerApplicationStatus;
  submittedAt: Date;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @interface AdminVolunteerListProps
 * @description Props for the AdminVolunteerList component
 */
interface AdminVolunteerListProps {
  applications: VolunteerApplication[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onStatusUpdate?: (applicationId: string, status: VolunteerApplicationStatus) => Promise<void>;
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
function getStatusBadgeVariant(status: VolunteerApplicationStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case VolunteerApplicationStatus.APPROVED: return 'default';
    case VolunteerApplicationStatus.REJECTED: return 'destructive';
    case VolunteerApplicationStatus.PENDING: return 'secondary';
    default: return 'outline';
  }
}

/**
 * Get status icon
 */
function getStatusIcon(status: VolunteerApplicationStatus) {
  switch (status) {
    case VolunteerApplicationStatus.APPROVED: return CheckCircle;
    case VolunteerApplicationStatus.REJECTED: return XCircle;
    case VolunteerApplicationStatus.PENDING: return Clock;
    default: return Clock;
  }
}

/**
 * Format gender for display
 */
function formatGender(gender: Gender): string {
  const genderMap: Record<Gender, string> = {
    [Gender.MALE]: 'Male',
    [Gender.FEMALE]: 'Female',
    [Gender.OTHER]: 'Other',
    [Gender.PREFER_NOT_TO_SAY]: 'Prefer not to say'
  };
  return genderMap[gender] || gender;
}

/**
 * Format role name for display
 */
function formatRoleName(role: VolunteerRole): string {
  const roleMap: Record<VolunteerRole, string> = {
    [VolunteerRole.LOGISTICS_SETUP]: 'Logistics & Setup',
    [VolunteerRole.ASSISTANCE]: 'General Assistance',
    [VolunteerRole.SOCIAL_MEDIA_SUPPORT]: 'Social Media Support',
    [VolunteerRole.TECH_SUPPORT_STAGE_MANAGEMENT]: 'Tech Support/Stage Management',
    [VolunteerRole.CONTENT_CREATION]: 'Content Creation',
    [VolunteerRole.GUEST_REGISTRATION_TICKETING]: 'Guest Registration/Ticketing',
    [VolunteerRole.CROWD_CONTROL]: 'Crowd Control',
    [VolunteerRole.SALES_MARKETING]: 'Sales/Marketing',
    [VolunteerRole.OFFLINE_PUBLICITY]: 'Offline Publicity',
    [VolunteerRole.MEDICALS]: 'Medical Support',
    [VolunteerRole.GAMES]: 'Games & Activities',
    [VolunteerRole.PR_TEAM]: 'PR Team'
  };
  return roleMap[role] || role;
}

/**
 * Get role icon color based on role type
 */
function getRoleIconColor(role: VolunteerRole): string {
  const colorMap: Record<VolunteerRole, string> = {
    [VolunteerRole.LOGISTICS_SETUP]: 'text-blue-600',
    [VolunteerRole.ASSISTANCE]: 'text-gray-600',
    [VolunteerRole.SOCIAL_MEDIA_SUPPORT]: 'text-pink-600',
    [VolunteerRole.TECH_SUPPORT_STAGE_MANAGEMENT]: 'text-purple-600',
    [VolunteerRole.CONTENT_CREATION]: 'text-orange-600',
    [VolunteerRole.GUEST_REGISTRATION_TICKETING]: 'text-indigo-600',
    [VolunteerRole.CROWD_CONTROL]: 'text-red-600',
    [VolunteerRole.SALES_MARKETING]: 'text-green-600',
    [VolunteerRole.OFFLINE_PUBLICITY]: 'text-yellow-600',
    [VolunteerRole.MEDICALS]: 'text-red-500',
    [VolunteerRole.GAMES]: 'text-cyan-600',
    [VolunteerRole.PR_TEAM]: 'text-emerald-600'
  };
  return colorMap[role] || 'text-gray-600';
}

/**
 * @function AdminVolunteerList
 * @description Component for displaying paginated volunteer applications with management actions
 * @param {AdminVolunteerListProps} props - Component props
 * @returns {JSX.Element} The volunteer applications list interface
 */
export default function AdminVolunteerList({
  applications,
  isLoading,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onStatusUpdate
}: AdminVolunteerListProps) {

  // ===== STATE MANAGEMENT =====
  
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  // ===== EVENT HANDLERS =====

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (applicationId: string, newStatus: VolunteerApplicationStatus) => {
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
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Volunteer Applications</h3>
        <p className="text-gray-600">No volunteer applications found matching your criteria.</p>
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
          const roleIconColor = getRoleIconColor(application.role);

          return (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                
                {/* Main Application Row */}
                <div className="flex items-center justify-between">
                  
                  {/* Application Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-12 h-12 bg-green-100 rounded-full flex items-center justify-center`}>
                      <Heart className={`w-6 h-6 ${roleIconColor}`} />
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
                          <Phone className="w-3 h-3" />
                          <span>{application.phoneNumber}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{formatGender(application.gender)}</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(application.submittedAt)}
                        </span>
                      </div>
                      
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${roleIconColor}`}>
                          {formatRoleName(application.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    
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
                    {onStatusUpdate && application.status === VolunteerApplicationStatus.PENDING && (
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, VolunteerApplicationStatus.APPROVED)}
                          disabled={isUpdating}
                          className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(application.id, VolunteerApplicationStatus.REJECTED)}
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
                            <Users className="w-4 h-4 text-gray-400" />
                            <span>Gender: {formatGender(application.gender)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Application Details */}
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
                            <span className="font-medium">Preferred Role:</span> {formatRoleName(application.role)}
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
