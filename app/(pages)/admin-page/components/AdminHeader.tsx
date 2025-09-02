/**
 * @fileoverview Admin Header Component
 * @description Navigation header for the admin dashboard providing branding, navigation tabs,
 * and authentication controls. Handles admin logout functionality and route navigation.
 * 
 * Features:
 * - Official ShutUpNRave branding with logo
 * - Responsive design for mobile and desktop
 * - Secure logout functionality with loading states
 * - Route-based navigation with active tab detection
 * - Clean, modern interface design
 * 
 * @author ShutUpNRave Admin Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use client";

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Database, Mail, Music, Heart } from 'lucide-react';
import { logoutAdmin } from '@/app/server/auth';

// ===== CONSTANTS =====

/** Logo configuration */
const LOGO_CONFIG = {
  src: "/shutupnrave-wb.png",
  alt: "Shut Up N Rave Logo",
  width: { mobile: 150, desktop: 100 },
  height: { mobile: 150, desktop: 100 }
} as const;

/** Navigation route configuration */
const ADMIN_ROUTES = {
  main: '/admin-page',
  emails: '/admin-page/emails',
  djApplications: '/admin-page/dj-applications',
  volunteerApplications: '/admin-page/volunteer-applications',
  login: '/admin-login'
} as const;

/**
 * @function AdminHeader
 * @description Main navigation header for the admin dashboard
 * 
 * Provides:
 * - Company branding and logo
 * - Admin authentication status and logout
 * - Responsive navigation controls
 * - Route-aware active state management
 * 
 * @returns React component element
 * 
 * @example
 * ```tsx
 * <AdminHeader />
 * ```
 */
export default function AdminHeader() {
  
  // ===== STATE MANAGEMENT =====
  
  /** Loading state for logout operation */
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  
  // ===== HOOKS =====
  
  const router = useRouter();
  const pathname = usePathname();

  // ===== NAVIGATION HELPERS =====

  /**
   * Get current active tab based on pathname
   */
  const getCurrentTab = (): string => {
    if (pathname === ADMIN_ROUTES.emails) return 'emails';
    if (pathname === ADMIN_ROUTES.djApplications) return 'dj-applications';
    if (pathname === ADMIN_ROUTES.volunteerApplications) return 'volunteer-applications';
    return 'dashboard';
  };

  /**
   * Handle tab navigation
   */
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'dashboard':
        router.push(ADMIN_ROUTES.main);
        break;
      case 'emails':
        router.push(ADMIN_ROUTES.emails);
        break;
      case 'dj-applications':
        router.push(ADMIN_ROUTES.djApplications);
        break;
      case 'volunteer-applications':
        router.push(ADMIN_ROUTES.volunteerApplications);
        break;
    }
  };

  // ===== EVENT HANDLERS =====

  /**
   * Handle admin logout
   * Performs secure logout, clears session, and redirects to login
   */
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent double-clicks
    
    setIsLoggingOut(true);
    
    try {
      await logoutAdmin();
      router.push(ADMIN_ROUTES.login);
      router.refresh(); // Refresh to clear any cached authentication state
    } catch (error) {
      console.error('[AdminHeader] Logout error:', error);
      // Still redirect to login on error - the token should be cleared server-side
      router.push(ADMIN_ROUTES.login);
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, isLoggingOut]);

  // ===== RENDER =====

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col space-y-4 md:space-y-6">
          
          {/* Main Header Row: Logo/Branding and Logout Button */}
          <div className="flex items-center justify-between">
            
            {/* Logo and Branding Section */}
            <Link 
              href={ADMIN_ROUTES.main} 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Navigate to admin dashboard home"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 relative">
                <Image
                  src={LOGO_CONFIG.src}
                  alt={LOGO_CONFIG.alt}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            
            {/* Authentication Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2 cursor-pointer"
              type="button"
              aria-label="Sign out from admin panel"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </Button>
            
          </div>
          
          {/* Navigation Tabs */}
          <div className="w-full">
            <Tabs 
              value={getCurrentTab()} 
              onValueChange={handleTabChange} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger 
                  value="dashboard" 
                  className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Orders & Tickets</span>
                  <span className="sm:hidden">Orders</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="emails" 
                  className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email Management</span>
                  <span className="sm:hidden">Emails</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="dj-applications" 
                  className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Music className="h-4 w-4" />
                  <span className="hidden sm:inline">DJ Applications</span>
                  <span className="sm:hidden">DJs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="volunteer-applications" 
                  className="flex items-center gap-2 cursor-pointer data-[state=active]:bg-white data-[state=active]:text-black"
                >
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Volunteers</span>
                  <span className="sm:hidden">Vol</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
        </div>
      </div>
    </div>
  );
} 