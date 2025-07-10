import { verifyAdminToken } from '@/app/server/auth';
import { redirect } from 'next/navigation';
import AdminLoginClient from './components/AdminLoginClient';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderLoginPage({ params }: PageProps) {
  // Check if user is already authenticated
  const admin = await verifyAdminToken();
  
  // Await the params Promise in Next.js 15
  const { orderId } = await params;
  
  if (admin) {
    // If already authenticated, redirect to the order details page
    redirect(`/admin-page/${orderId}`);
  }

  return <AdminLoginClient redirectTo={`/admin-page/${orderId}`} orderId={orderId} />;
} 