import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/app/server/auth';
import AdminLoginClient from './components/AdminLoginClient';

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  // Check if user is already authenticated
  const admin = await verifyAdminToken();
  
  if (admin) {
    // If already authenticated, redirect to return URL or default admin page
    const { returnUrl } = await searchParams;
    const destination = returnUrl && returnUrl.startsWith('/admin-page') 
      ? decodeURIComponent(returnUrl) 
      : '/admin-page';
    redirect(destination);
  }

  return <AdminLoginClient />;
}