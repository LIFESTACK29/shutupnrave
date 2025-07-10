import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/app/server/auth';
import AdminLoginClient from './components/AdminLoginClient';

export default async function AdminLoginPage() {
  // Check if user is already authenticated
  const admin = await verifyAdminToken();
  
  if (admin) {
    redirect('/admin-page');
  }

  return <AdminLoginClient />;
}