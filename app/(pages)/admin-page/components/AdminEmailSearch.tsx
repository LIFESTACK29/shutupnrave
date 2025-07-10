"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, X, Mail } from 'lucide-react';

interface AdminEmailSearchProps {
  onSearch: (searchQuery: string, sourceFilter: string, activeFilter: string) => void;
  onExport: (searchQuery: string, sourceFilter: string, activeFilter: string) => void;
  isLoading?: boolean;
  isExporting?: boolean;
}

export default function AdminEmailSearch({ 
  onSearch, 
  onExport, 
  isLoading = false, 
  isExporting = false 
}: AdminEmailSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSearch = () => {
    onSearch(searchQuery, sourceFilter, activeFilter);
  };

  const handleExport = () => {
    onExport(searchQuery, sourceFilter, activeFilter);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSourceFilter('all');
    setActiveFilter('all');
    onSearch('', 'all', 'all');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by email, name, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                  <SelectItem value="customer">Ticket Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={activeFilter} onValueChange={setActiveFilter} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 sm:flex-none cursor-pointer"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? 'Searching...' : 'Search Emails'}
            </Button>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isLoading || isExporting}
              className="flex-1 sm:flex-none cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>

            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={isLoading}
              className="flex-1 sm:flex-none cursor-pointer"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          {/* Quick Stats or Active Filters Display */}
          {(searchQuery || sourceFilter !== 'all' || activeFilter !== 'all') && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <div className="text-sm text-gray-600 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                Active filters:
              </div>
              
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              
              {sourceFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Source: {sourceFilter === 'newsletter' ? 'Newsletter' : 'Customers'}
                </span>
              )}
              
              {activeFilter !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  Status: {activeFilter === 'active' ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 