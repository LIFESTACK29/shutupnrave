"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Ticket, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Activity
} from "lucide-react";

interface AdminStatsProps {
  stats: {
    totalOrders: number;
    paidOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    soloVibesTickets: number;
    gengEnergyTickets: number;
    activeTickets: number;
    usedTickets: number;
  } | null;
  loading?: boolean;
}

export default function AdminStatsCards({ stats, loading = false }: AdminStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>Unable to load statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalTickets = stats.soloVibesTickets + stats.gengEnergyTickets;
  const paymentSuccessRate = stats.totalOrders > 0 ? (stats.paidOrders / stats.totalOrders * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>
          {stats.totalOrders > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {stats.paidOrders} paid, {stats.pendingOrders} pending
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            From {stats.paidOrders} paid orders
          </div>
        </CardContent>
      </Card>

      {/* Total Tickets Sold */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Ticket className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.soloVibesTickets} Solo Vibes, {stats.gengEnergyTickets} Geng Energy
          </div>
        </CardContent>
      </Card>

      {/* Payment Success Rate */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold">{paymentSuccessRate.toFixed(1)}%</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Payment completion rate
          </div>
        </CardContent>
      </Card>

      {/* Active Tickets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tickets</p>
              <p className="text-2xl font-bold">{stats.activeTickets.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Ready for event entry
          </div>
        </CardContent>
      </Card>

      {/* Used Tickets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Used Tickets</p>
              <p className="text-2xl font-bold">{stats.usedTickets.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Already verified at event
          </div>
        </CardContent>
      </Card>

      {/* Pending Orders */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Awaiting payment
          </div>
        </CardContent>
      </Card>

      {/* Solo Vibes Tickets */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Solo Vibes</p>
              <p className="text-2xl font-bold">{stats.soloVibesTickets.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Individual tickets sold
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 