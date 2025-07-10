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
    redirect('/admin-login');
  }

  return <>{children}</>;
} 