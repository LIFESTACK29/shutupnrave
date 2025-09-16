export const dynamic = 'force-dynamic';
import { verifyAffiliateToken, logoutAffiliate } from '@/app/server/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/db';
import ReferralLinkCard from './components/ReferralLinkCard';

export default async function AffiliateDashboardPage() {
  const affiliate = await verifyAffiliateToken();
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not authenticated</CardTitle>
          </CardHeader>
          <CardContent>
            <a className="text-blue-600 underline" href="/affiliate/login">Go to Affiliate Login</a>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Load self stats (paid & confirmed only)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const referralLink = `${appUrl}/tickets?ref=${encodeURIComponent(affiliate.refCode)}`;

  const orders = await prisma.order.findMany({
    where: { affiliateId: affiliate.id, paymentStatus: 'PAID', status: 'CONFIRMED' },
    include: { orderItems: { include: { ticketType: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const ticketsSold = orders.reduce((sum, o) => sum + o.orderItems.reduce((s, i) => s + i.quantity, 0), 0);
  const subtotalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const commissionsAgg = await prisma.affiliateCommission.aggregate({
    _sum: { commissionAmount: true },
    where: { affiliateId: affiliate.id, orderItem: { order: { paymentStatus: 'PAID', status: 'CONFIRMED' } } }
  });
  const totalCommission = commissionsAgg._sum.commissionAmount || 0;

  const byType = orders.reduce((acc, o) => {
    o.orderItems.forEach(it => {
      const key = it.ticketType.name;
      if (!acc[key]) acc[key] = { tickets: 0, revenue: 0 };
      acc[key].tickets += it.quantity;
      acc[key].revenue += it.totalPrice;
    });
    return acc;
  }, {} as Record<string, { tickets: number; revenue: number }>);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Affiliate Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {affiliate.email} • Ref: {affiliate.refCode}</p>
          </div>
          <form action={async () => { 'use server'; await logoutAffiliate(); }}>
            <Button type="submit" variant="outline" className="cursor-pointer">Logout</Button>
          </form>
        </div>

        <ReferralLinkCard referralLink={referralLink} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Successful Orders</div><div className="text-2xl font-bold">{orders.length}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Tickets Sold</div><div className="text-2xl font-bold">{ticketsSold}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Commission</div><div className="text-2xl font-bold">₦{totalCommission.toLocaleString()}</div></CardContent></Card>
          <Card className="md:col-span-3"><CardContent className="p-4"><div className="text-sm text-gray-600">Subtotal Revenue</div><div className="text-2xl font-bold">₦{subtotalRevenue.toLocaleString()}</div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Performance by Ticket Type</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(byType).length === 0 ? (
              <div className="text-gray-600">No sales yet.</div>
            ) : (
              Object.entries(byType).map(([name, s]) => (
                <div key={name} className="rounded border bg-white p-3">
                  <div className="font-semibold">{name}</div>
                  <div className="text-sm text-gray-600">Tickets: {s.tickets}</div>
                  <div className="text-sm text-gray-600">Revenue: ₦{s.revenue.toLocaleString()}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {orders.slice(0, 20).map(o => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


