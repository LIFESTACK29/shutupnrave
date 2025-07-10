import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/app/server/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated
  const admin = await verifyAdminToken();
  
  if (!admin) {
    // Note: This layout-level redirect will be overridden by page-level redirects
    // for specific pages like order details that need to preserve the full URL
    redirect('/admin-login');
  }

  return <>{children}</>;
} 