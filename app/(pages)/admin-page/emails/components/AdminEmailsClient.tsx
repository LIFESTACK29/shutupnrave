"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Download, MailIcon, ShoppingBag } from 'lucide-react';
import AdminHeader from '../../components/AdminHeader';
import AdminEmailStats from '../../components/AdminEmailStats';
import AdminEmailList from '../../components/AdminEmailList';
import { getAllEmails, EmailData } from '../../actions';

export default function AdminEmailsClient() {
  const [allEmails, setAllEmails] = useState<EmailData[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalEmails: 0,
    newsletterSubscribers: 0,
    customers: 0,
    activeEmails: 0,
    inactiveEmails: 0
  });

  // Load all emails on page load
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const result = await getAllEmails('', 'all', 'all', 1, 1000);
        if (result.success) {
          setAllEmails(result.allEmails || []);
          setFilteredEmails(result.allEmails || []);
          setStats(result.stats || {
            totalEmails: 0,
            newsletterSubscribers: 0,
            customers: 0,
            activeEmails: 0,
            inactiveEmails: 0
          });
          setTotalCount(result.allEmails?.length || 0);
          setTotalPages(Math.ceil((result.allEmails?.length || 0) / 20));
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  // Apply filters when filter changes
  useEffect(() => {
    let filtered = allEmails;

    if (currentFilter === 'newsletter') {
      filtered = filtered.filter(email => 
        email.source === 'newsletter' || 
        (email.originalSources && email.originalSources.includes('newsletter'))
      );
    } else if (currentFilter === 'customers') {
      filtered = filtered.filter(email => 
        email.source === 'customer' || 
        (email.originalSources && email.originalSources.includes('customer'))
      );
    }

    setFilteredEmails(filtered);
    setTotalCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / 20));
    setCurrentPage(1); // Reset to first page when filter changes
  }, [currentFilter, allEmails]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      const csvHeaders = ['Name', 'Email', 'Source', 'Phone', 'Status', 'Created Date'];
      const csvRows = filteredEmails.map(email => [
        email.fullName || '',
        email.email,
        email.source === 'newsletter' ? 'Newsletter' : 'Customer',
        email.phoneNumber || '',
        email.active ? 'Active' : 'Inactive',
        email.createdAt.toISOString().split('T')[0]
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        const filterSuffix = currentFilter === 'all' ? 'all' : currentFilter;
        const filename = `shutupnrave_emails_${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Get paginated emails for current page
  const getPaginatedEmails = () => {
    const startIndex = (currentPage - 1) * 20;
    const endIndex = startIndex + 20;
    return filteredEmails.slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading emails...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <AdminEmailStats stats={stats} isLoading={isLoading} />
        
        <Card>
          <CardContent className="p-4">
            <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2 cursor-pointer">
                  <Mail className="h-4 w-4" />
                  <span>All Emails ({allEmails.length})</span>
                </TabsTrigger>
                <TabsTrigger value="newsletter" className="flex items-center gap-2 cursor-pointer">
                  <MailIcon className="h-4 w-4" />
                  <span>Newsletter ({stats.newsletterSubscribers})</span>
                </TabsTrigger>
                <TabsTrigger value="customers" className="flex items-center gap-2 cursor-pointer">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Customers ({stats.customers})</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email List
              </CardTitle>
              <CardDescription>
                Showing {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
                {currentFilter !== 'all' && ` from ${currentFilter}`}
              </CardDescription>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting || filteredEmails.length === 0}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </CardHeader>
          
          <CardContent>
            <AdminEmailList
              emails={getPaginatedEmails()}
              isLoading={false}
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 