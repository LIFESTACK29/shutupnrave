/**
 * @fileoverview Admin DJ Applications Statistics Component
 * @description Statistics dashboard for DJ applications showing key metrics and counts
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Clock, CheckCircle, XCircle, Users } from 'lucide-react';

// ===== TYPE DEFINITIONS =====

/**
 * @interface DJApplicationsStats
 * @description Statistics for DJ applications
 */
interface DJApplicationsStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  recentApplications: number; // Applications from last 7 days
}

/**
 * @interface AdminDJStatsProps
 * @description Props for the AdminDJStats component
 */
interface AdminDJStatsProps {
  stats: DJApplicationsStats;
  isLoading: boolean;
}

/**
 * @function AdminDJStats
 * @description Component displaying comprehensive DJ applications statistics
 * @param {AdminDJStatsProps} props - Component props
 * @returns {JSX.Element} The DJ statistics dashboard
 */
export default function AdminDJStats({ stats, isLoading }: AdminDJStatsProps) {
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render a statistics card
   */
  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    colorClass,
    isLoading 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: number;
    subtitle?: string;
    colorClass: string;
    isLoading: boolean;
  }) => (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Icon className={`h-6 w-6 md:h-8 md:w-8 ${colorClass}`} />
          <div>
            <p className="text-xs md:text-sm text-gray-600">{title}</p>
            {isLoading ? (
              <div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div>
            ) : (
              <p className="text-xl md:text-2xl font-bold">{value}</p>
            )}
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="h-5 w-5 text-purple-600" />
          <span>DJ Applications Overview</span>
        </CardTitle>
        <CardDescription>
          Statistics and metrics for DJ applications to shutupnraveee 2025
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          
          {/* Total Applications */}
          <StatCard
            icon={Users}
            title="Total Applications"
            value={stats.totalApplications}
            colorClass="text-blue-600"
            isLoading={isLoading}
          />
          
          {/* Pending Applications */}
          <StatCard
            icon={Clock}
            title="Pending Review"
            value={stats.pendingApplications}
            colorClass="text-yellow-600"
            isLoading={isLoading}
          />
          
          {/* Approved Applications */}
          <StatCard
            icon={CheckCircle}
            title="Approved"
            value={stats.approvedApplications}
            colorClass="text-green-600"
            isLoading={isLoading}
          />
          
          {/* Rejected Applications */}
          <StatCard
            icon={XCircle}
            title="Rejected"
            value={stats.rejectedApplications}
            colorClass="text-red-600"
            isLoading={isLoading}
          />
          
          {/* Recent Applications */}
          <StatCard
            icon={Music}
            title="This Week"
            value={stats.recentApplications}
            subtitle="Last 7 days"
            colorClass="text-purple-600"
            isLoading={isLoading}
          />
          
        </div>
      </CardContent>
    </Card>
  );
}
