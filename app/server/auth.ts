"use server";

import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const TOKEN_EXPIRES_IN = '1d'; // 1 day

export interface LoginResponse {
  success: boolean;
  error?: string;
}

export interface AdminUser {
  id: string;
  email: string;
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

 