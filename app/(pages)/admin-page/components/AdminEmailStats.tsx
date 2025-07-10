"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Mail, Users, UserCheck, UserX, MailIcon } from 'lucide-react';

interface EmailStats {
  totalEmails: number;
  newsletterSubscribers: number;
  customers: number;
  activeEmails: number;
  inactiveEmails: number;
}

interface AdminEmailStatsProps {
  stats: EmailStats;
  isLoading?: boolean;
}

export default function AdminEmailStats({ stats, isLoading = false }: AdminEmailStatsProps) {
  const statCards = [
    {
      title: 'Total Emails',
      value: stats.totalEmails,
      icon: Mail,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Unique email addresses'
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.newsletterSubscribers,
      icon: MailIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Newsletter signups'
    },
    {
      title: 'Ticket Customers',
      value: stats.customers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Purchased tickets'
    },
    {
      title: 'Active Emails',
      value: stats.activeEmails,
      icon: UserCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Active subscriptions'
    },
    {
      title: 'Inactive Emails',
      value: stats.inactiveEmails,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Unsubscribed'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 truncate">
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 