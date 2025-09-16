"use client";

import { useEffect, useMemo, useState } from 'react';
import AdminHeader from '../../../components/AdminHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAffiliateDetails, type AffiliateDetailsResult } from '../../../actions';

interface Props {
  affiliateId: string;
}

export default function AdminAffiliateDetailsClient({ affiliateId }: Props) {
  const [data, setData] = useState<AffiliateDetailsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await getAffiliateDetails(affiliateId);
        setData(res);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [affiliateId]);

  const byTicketType = useMemo(() => data?.stats?.byTicketType || {}, [data]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {isLoading || !data?.affiliate ? (
          <div className="text-center py-10 text-gray-600">Loading affiliate details...</div>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{data.affiliate.user.fullName}</h2>
              <p className="text-sm text-gray-600">Ref Code: <span className="font-mono font-semibold">{data.affiliate.refCode}</span></p>
              <p className="text-sm text-gray-600">{data.affiliate.user.email} • {data.affiliate.user.phoneNumber}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Successful Orders</div>
                  <div className="text-2xl font-bold">{data.stats?.successfulOrders || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Tickets Sold</div>
                  <div className="text-2xl font-bold">{data.stats?.ticketsSold || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Subtotal</div>
                  <div className="text-2xl font-bold">₦{(data.stats?.subtotalRevenue || 0).toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600">Commission</div>
                  <div className="text-2xl font-bold">₦{(data.stats?.totalCommission || 0).toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Commission Rules</CardTitle>
                <CardDescription>Per ticket type</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(data.affiliate.commissionRules || []).map((r, idx) => (
                  <div key={idx} className="rounded border bg-white p-3">
                    <div className="font-semibold">{r.ticketTypeName}</div>
                    <div className="text-sm text-gray-600">
                      {r.type === 'PERCENTAGE' ? `${Math.round((r.rate || 0) * 100)}%` : `₦${(r.amount || 0).toLocaleString()}`} per ticket
                    </div>
                  </div>
                ))}
                {(!data.affiliate.commissionRules || data.affiliate.commissionRules.length === 0) && (
                  <div className="text-gray-600">No commission rules configured.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Ticket Type</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(byTicketType).length === 0 ? (
                  <div className="text-gray-600">No sales yet.</div>
                ) : (
                  Object.entries(byTicketType).map(([name, s]) => (
                    <div key={name} className="rounded border bg-white p-3">
                      <div className="font-semibold">{name}</div>
                      <div className="text-sm text-gray-600">Tickets: {s.tickets}</div>
                      <div className="text-sm text-gray-600">Revenue: ₦{s.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Commission: ₦{s.commission.toLocaleString()}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 20 successful orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data.recentOrders || []).map(o => (
                  <div key={o.id} className="rounded border bg-white p-3 flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold">{o.orderId}</div>
                      <div className="text-sm text-gray-600">{new Date(o.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Subtotal</div>
                      <div className="font-semibold">₦{o.subtotal.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
                {(!data.recentOrders || data.recentOrders.length === 0) && (
                  <div className="text-gray-600">No orders yet.</div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}




