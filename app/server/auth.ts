"use server";

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRES_IN = '1d'; // 1 day
const AFFILIATE_TOKEN_NAME = 'affiliate-token';

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface AdminUser {
  id: string;
  email: string;
}

export interface AffiliateUser {
  id: string;
  userId: string;
  email: string;
  refCode: string;
}

/**
 * Admin login server action
 */
export async function loginAdmin(email: string, password: string): Promise<LoginResponse> {
  try {
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    // Set secure cookie
    (await
          // Set secure cookie
          cookies()).set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      path: '/'
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

/**
 * Admin logout server action
 */
export async function logoutAdmin(): Promise<void> {
  (await cookies()).delete('admin-token');
}

/**
 * Verify admin token and return admin user
 */
export async function verifyAdminToken(): Promise<AdminUser | null> {
  try {
    const token = (await cookies()).get('admin-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    
    // Verify admin still exists
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id }
    });

    if (!admin) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * Affiliate (sub-admin) login
 */
export async function loginAffiliate(email: string, password: string): Promise<LoginResponse> {
  try {
    const affiliate = await prisma.affiliate.findFirst({
      where: { user: { email } },
      include: { user: true }
    });
    if (!affiliate || !affiliate.passwordHash) return { success: false, error: 'Invalid credentials' };

    const bcryptjs = (await import('bcryptjs')).default;
    const ok = await bcryptjs.compare(password, affiliate.passwordHash);
    if (!ok) return { success: false, error: 'Invalid credentials' };

    const token = jwt.sign(
      { id: affiliate.id, userId: affiliate.userId, email: affiliate.user.email, refCode: affiliate.refCode, role: 'affiliate' },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    (await cookies()).set(AFFILIATE_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    });

    return { success: true };
  } catch (e) {
    console.error('Affiliate login error:', e);
    return { success: false, error: 'Login failed' };
  }
}

export async function logoutAffiliate(): Promise<void> {
  (await cookies()).delete(AFFILIATE_TOKEN_NAME);
}

export async function verifyAffiliateToken(): Promise<AffiliateUser | null> {
  try {
    const token = (await cookies()).get(AFFILIATE_TOKEN_NAME)?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; userId: string; email: string; refCode: string };

    const affiliate = await prisma.affiliate.findUnique({ where: { id: decoded.id }, include: { user: true } });
    if (!affiliate) return null;

    return { id: affiliate.id, userId: affiliate.userId, email: affiliate.user.email, refCode: affiliate.refCode };
  } catch (e) {
    console.error('Affiliate token verification error:', e);
    return null;
  }
}

 