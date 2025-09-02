"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music, Download, Clock, CheckCircle, XCircle, Users } from 'lucide-react';
import AdminHeader from '../../components/AdminHeader';
import AdminDJStats from '../../components/AdminDJStats';
import AdminDJList from '../../components/AdminDJList';
import { 
  getDJApplicationsWithFilters, 
  updateDJApplicationStatus, 
  exportDJApplications 
} from '../../../dj-application/actions';
import { DJApplicationStatus } from '@prisma/client';

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

export default function AdminDJApplicationsClient() {
  const [allApplications, setAllApplications] = useState<DJApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<DJApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    recentApplications: 0
  });

  // Load all applications on page load
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const result = await getDJApplicationsWithFilters('all', 1, 1000);
        if (result.success) {
          const applications = result.applications || [];
          setAllApplications(applications);
          setFilteredApplications(applications);
          setStats(result.stats || {
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
            recentApplications: 0
          });
          setTotalCount(applications.length);
          setTotalPages(Math.ceil(applications.length / 20));
        }
      } catch (error) {
        console.error('Error fetching DJ applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Apply filters when filter changes
  useEffect(() => {
    let filtered = allApplications;

    if (currentFilter !== 'all') {
      filtered = filtered.filter(app => app.status === currentFilter.toUpperCase());
    }

    setFilteredApplications(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / 20));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [currentFilter, allApplications]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: DJApplicationStatus) => {
    try {
      const result = await updateDJApplicationStatus(applicationId, newStatus);
      if (result.success) {
        // Update the application in our local state
        setAllApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus, reviewedAt: new Date() }
              : app
          )
        );
        
        // Refresh stats
        const updatedResult = await getDJApplicationsWithFilters('all', 1, 1000);
        if (updatedResult.success && updatedResult.stats) {
          setStats(updatedResult.stats);
        }
      } else {
        alert('Failed to update application status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const result = await exportDJApplications(currentFilter);
      if (result.success && result.csvContent && result.filename) {
        const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', result.filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      } else {
        alert('Failed to export applications: ' + result.error);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export applications');
    } finally {
      setIsExporting(false);
    }
  };

  // Get paginated applications for current page
  const getPaginatedApplications = () => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    return filteredApplications.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading DJ applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <AdminDJStats stats={stats} isLoading={isLoading} />
        
        <Card>
          <CardContent className="p-4">
            <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <span>All ({allApplications.length})</span>
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2 cursor-pointer">
                  <Clock className="h-4 w-4" />
                  <span>Pending ({stats.pendingApplications})</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved ({stats.approvedApplications})</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="flex items-center gap-2 cursor-pointer">
                  <XCircle className="h-4 w-4" />
                  <span>Rejected ({stats.rejectedApplications})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                DJ Applications
              </CardTitle>
              <CardDescription>
                Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}
                {currentFilter !== 'all' && ` with status: ${currentFilter}`}
              </CardDescription>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting || filteredApplications.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </CardHeader>
          
          <CardContent>
            <AdminDJList
              applications={getPaginatedApplications()}
              isLoading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              onStatusUpdate={handleStatusUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
