/**
 * @fileoverview Volunteer Application Server Actions
 * @description Server actions for handling volunteer application submissions
 * 
 * @author ShutUpNRave Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { Gender, VolunteerRole, VolunteerApplication, VolunteerApplicationStatus } from "@prisma/client";

// ===== VALIDATION SCHEMAS =====

const VolunteerApplicationSchema = z.object({
  fullName: z.string().min(4, "Full name must be at least 4 characters"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(15, "Phone number must be maximum 15 digits"),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    errorMap: () => ({ message: "Please select a valid gender option" })
  }),
  role: z.enum([
    'LOGISTICS_SETUP',
    'ASSISTANCE',
    'SOCIAL_MEDIA_SUPPORT',
    'TECH_SUPPORT_STAGE_MANAGEMENT',
    'CONTENT_CREATION',
    'GUEST_REGISTRATION_TICKETING',
    'CROWD_CONTROL',
    'SALES_MARKETING',
    'OFFLINE_PUBLICITY',
    'MEDICALS',
    'GAMES',
    'PR_TEAM'
  ], {
    errorMap: () => ({ message: "Please select a valid volunteer role" })
  })
});

// ===== TYPE DEFINITIONS =====

interface VolunteerApplicationData {
  fullName: string;
  phoneNumber: string;
  gender: string;
  role: string;
}

interface VolunteerApplicationResponse {
  success: boolean;
  error?: string;
  applicationId?: string;
}

// ===== MAIN SERVER ACTIONS =====

/**
 * @function submitVolunteerApplication
 * @description Submits a new volunteer application to the database
 * @param {VolunteerApplicationData} applicationData - The volunteer application form data
 * @returns {Promise<VolunteerApplicationResponse>} Application submission result
 * 
 * @example
 * ```typescript
 * const result = await submitVolunteerApplication({
 *   fullName: "Jane Doe",
 *   phoneNumber: "08012345678",
 *   gender: "FEMALE",
 *   role: "SOCIAL_MEDIA_SUPPORT"
 * });
 * ```
 */
export async function submitVolunteerApplication(
  applicationData: VolunteerApplicationData
): Promise<VolunteerApplicationResponse> {
  try {
    // Step 1: Validate input data using Zod schema
    const validatedData = VolunteerApplicationSchema.parse(applicationData);
    
    // Step 2: Check for duplicate applications (same phone number)
    const existingApplication = await prisma.volunteerApplication.findFirst({
      where: {
        phoneNumber: validatedData.phoneNumber
      }
    });
    
    if (existingApplication) {
      return {
        success: false,
        error: "An application with this phone number already exists"
      };
    }
    
    // Step 3: Create the volunteer application
    const volunteerApplication = await prisma.volunteerApplication.create({
      data: {
        fullName: validatedData.fullName.trim(),
        phoneNumber: validatedData.phoneNumber.trim(),
        gender: validatedData.gender as Gender,
        role: validatedData.role as VolunteerRole,
        status: VolunteerApplicationStatus.PENDING, // Default status
        submittedAt: new Date()
      }
    });
    
    console.log(`[Volunteer Application] New application submitted by ${validatedData.fullName} (ID: ${volunteerApplication.id})`);
    
    return {
      success: true,
      applicationId: volunteerApplication.id
    };
    
  } catch (error) {
    console.error('[Volunteer Application] Submission error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: firstError.message
      };
    }
    
    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return {
          success: false,
          error: "An application with this information already exists"
        };
      }
    }
    
    return {
      success: false,
      error: "Failed to submit application. Please try again."
    };
  }
}

/**
 * @function getVolunteerApplications
 * @description Retrieves all volunteer applications (admin use)
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of applications per page
 * @returns {Promise<{success: boolean, applications?: any[], totalCount?: number, error?: string}>}
 */
export async function getVolunteerApplications(
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  applications?: VolunteerApplication[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;
    
    const [applications, totalCount] = await Promise.all([
      prisma.volunteerApplication.findMany({
        orderBy: { submittedAt: 'desc' },
        skip,
        take: validLimit
      }),
      prisma.volunteerApplication.count()
    ]);
    
    return {
      success: true,
      applications,
      totalCount
    };
  } catch (error) {
    console.error('[Volunteer Applications] Fetch error:', error);
    return {
      success: false,
      error: "Failed to fetch volunteer applications"
    };
  }
}

/**
 * @function updateVolunteerApplicationStatus
 * @description Updates the status of a volunteer application (admin use)
 * @param {string} applicationId - The ID of the application
 * @param {string} status - New status ('PENDING', 'APPROVED', 'REJECTED')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateVolunteerApplicationStatus(
  applicationId: string,
  status: VolunteerApplicationStatus
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.volunteerApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        reviewedAt: new Date()
      }
    });
    
    console.log(`[Volunteer Application] Status updated for application ${applicationId}: ${status}`);
    
    return { success: true };
  } catch (error) {
    console.error('[Volunteer Application] Status update error:', error);
    return {
      success: false,
      error: "Failed to update application status"
    };
  }
}

/**
 * @function getVolunteerApplicationsWithFilters
 * @description Retrieves volunteer applications with filtering and pagination for admin
 * @param {string} [statusFilter] - Filter by status ('all', 'PENDING', 'APPROVED', 'REJECTED')
 * @param {string} [roleFilter] - Filter by role
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of applications per page
 * @returns {Promise<{success: boolean, applications?: any[], totalCount?: number, stats?: any, error?: string}>}
 */
export async function getVolunteerApplicationsWithFilters(
  statusFilter: string = 'all',
  roleFilter: string = 'all',
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  applications?: VolunteerApplication[];
  totalCount?: number;
  stats?: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    recentApplications: number;
  };
  error?: string;
}> {
  try {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;
    
    // Build filter condition
    const where: { status?: VolunteerApplicationStatus; role?: VolunteerRole } = {};
    if (statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase() as VolunteerApplicationStatus;
    }
    if (roleFilter !== 'all') {
      where.role = roleFilter.toUpperCase() as VolunteerRole;
    }
    
    // Get applications and total count
    const [applications, totalCount] = await Promise.all([
      prisma.volunteerApplication.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: validLimit
      }),
      prisma.volunteerApplication.count({ where })
    ]);
    
    // Calculate statistics
    const [allApplications, recentApplicationsCount] = await Promise.all([
      prisma.volunteerApplication.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.volunteerApplication.count({
        where: {
          submittedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);
    
    // Process stats
    const stats = {
      totalApplications: 0,
      pendingApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0,
      recentApplications: recentApplicationsCount
    };
    
    allApplications.forEach(group => {
      const count = group._count.status;
      stats.totalApplications += count;
      
      switch (group.status) {
        case 'PENDING':
          stats.pendingApplications = count;
          break;
        case 'APPROVED':
          stats.approvedApplications = count;
          break;
        case 'REJECTED':
          stats.rejectedApplications = count;
          break;
      }
    });
    
    return {
      success: true,
      applications,
      totalCount,
      stats
    };
  } catch (error) {
    console.error('[Volunteer Applications] Fetch with filters error:', error);
    return {
      success: false,
      error: "Failed to fetch volunteer applications"
    };
  }
}

/**
 * @function exportVolunteerApplications
 * @description Exports volunteer applications to CSV format for download
 * @param {string} [statusFilter] - Status filter to apply
 * @param {string} [roleFilter] - Role filter to apply
 * @returns {Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}>}
 */
export async function exportVolunteerApplications(
  statusFilter: string = 'all',
  roleFilter: string = 'all'
): Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}> {
  try {
    // Build filter condition
    const where: { status?: VolunteerApplicationStatus; role?: VolunteerRole } = {};
    if (statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase() as VolunteerApplicationStatus;
    }
    if (roleFilter !== 'all') {
      where.role = roleFilter.toUpperCase() as VolunteerRole;
    }
    
    // Get all matching applications
    const applications = await prisma.volunteerApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' }
    });
    
    // Define CSV headers - only essential fields
    const headers = [
      'Full Name',
      'Phone Number',
      'Gender',
      'Volunteer Role'
    ];
    
    // Helper function to format role names
    const formatRoleName = (role: string): string => {
      const roleMap: Record<string, string> = {
        'LOGISTICS_SETUP': 'Logistics & Setup',
        'ASSISTANCE': 'General Assistance',
        'SOCIAL_MEDIA_SUPPORT': 'Social Media Support',
        'TECH_SUPPORT_STAGE_MANAGEMENT': 'Tech Support/Stage Management',
        'CONTENT_CREATION': 'Content Creation',
        'GUEST_REGISTRATION_TICKETING': 'Guest Registration/Ticketing',
        'CROWD_CONTROL': 'Crowd Control',
        'SALES_MARKETING': 'Sales/Marketing',
        'OFFLINE_PUBLICITY': 'Offline Publicity',
        'MEDICALS': 'Medical Support',
        'GAMES': 'Games & Activities',
        'PR_TEAM': 'PR Team'
      };
      return roleMap[role] || role;
    };
    
    // Helper function to format gender
    const formatGender = (gender: string): string => {
      const genderMap: Record<string, string> = {
        'MALE': 'Male',
        'FEMALE': 'Female',
        'OTHER': 'Other',
        'PREFER_NOT_TO_SAY': 'Prefer not to say'
      };
      return genderMap[gender] || gender;
    };
    
    // Transform applications to CSV rows - only essential fields
    const rows = applications.map(app => [
      app.fullName,
      app.phoneNumber,
      formatGender(app.gender),
      formatRoleName(app.role)
    ]);
    
    // Generate CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Generate filename
    const filterSuffix = statusFilter !== 'all' ? `_${statusFilter.toLowerCase()}` : '';
    const roleFilterSuffix = roleFilter !== 'all' ? `_${roleFilter.toLowerCase()}` : '';
    const filename = `shutupnrave_volunteers${filterSuffix}${roleFilterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
      success: true,
      csvContent,
      filename
    };
  } catch (error) {
    console.error('[Volunteer Applications] Export error:', error);
    return {
      success: false,
      error: 'Failed to export volunteer applications. Please try again.'
    };
  }
}
