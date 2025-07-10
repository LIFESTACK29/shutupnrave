"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, User, Calendar, Download, MailIcon, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AdminHeader from '../components/AdminHeader';
import AdminEmailStats from '../components/AdminEmailStats';
import { getAllEmails, EmailData } from '../actions';

export default function AdminEmailsPage() {
  const [allEmails, setAllEmails] = useState<EmailData[]>([]); // All emails
  const [filteredEmails, setFilteredEmails] = useState<EmailData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
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
        const result = await getAllEmails('', 'all', 'all', 1, 1000); // Get all emails
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

    // Apply source filter
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
  }, [currentFilter, allEmails]);

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Create simple CSV with just names and emails from filtered results
      const csvHeaders = ['Name', 'Email'];
      const csvRows = filteredEmails.map(email => [
        email.fullName || '', // Name (empty if not available)
        email.email // Email
      ]);

      // Combine headers and rows
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download the file
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
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
        {/* Email Statistics - Always shows ALL emails */}
        <AdminEmailStats stats={stats} isLoading={isLoading} />
        
        {/* Filter Tabs */}
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
        
        {/* Results and Export */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email List
                </CardTitle>
                <CardDescription>
                  Showing {filteredEmails.length} emails
                  {currentFilter !== 'all' && ` in ${currentFilter} category`}
                </CardDescription>
              </div>
              <Button
                onClick={handleExport}
                disabled={isExporting || filteredEmails.length === 0}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No emails found for the selected filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEmails.map((email, index) => (
                  <div
                    key={`${email.email}-${index}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {email.fullName || 'Anonymous'}
                        </div>
                        <div className="text-sm text-gray-600">{email.email}</div>
                        {email.phoneNumber && (
                          <div className="text-xs text-gray-500">{email.phoneNumber}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {email.isBoth ? (
                        <div className="flex space-x-1">
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            Newsletter
                          </Badge>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Customer
                          </Badge>
                        </div>
                      ) : (
                        <Badge 
                          variant="default" 
                          className={
                            email.source === 'newsletter' 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {email.source === 'newsletter' ? 'Newsletter' : 'Customer'}
                        </Badge>
                      )}
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(email.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 