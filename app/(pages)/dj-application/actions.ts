/**
 * @fileoverview DJ Application Server Actions
 * @description Server actions for handling DJ application submissions
 * 
 * @author ShutUpNRave Team
 * @version 1.0.0
 * @since 2025-01-08
 */

"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";
import { DjApplication, DJApplicationStatus } from "@prisma/client";

// ===== VALIDATION SCHEMAS =====

const DJApplicationSchema = z.object({
  fullName: z.string().min(4, "Full name must be at least 4 characters"),
  phoneNumber: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(15, "Phone number must be maximum 15 digits"),
  instagramHandle: z.string().min(1, "Instagram handle is required"),
  mixLink: z.string().url("Please enter a valid URL")
});

// ===== TYPE DEFINITIONS =====

interface DJApplicationData {
  fullName: string;
  phoneNumber: string;
  instagramHandle: string;
  mixLink: string;
}

interface DJApplicationResponse {
  success: boolean;
  error?: string;
  applicationId?: string;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Normalizes Instagram handle by removing @ symbol and converting to lowercase
 */
function normalizeInstagramHandle(handle: string): string {
  return handle.replace('@', '').toLowerCase().trim();
}

/**
 * Validates if the mix link is from a supported platform
 */
function validateMixPlatform(url: string): boolean {
  const supportedPlatforms = [
    'spotify.com',
    'audiomack.com', 
    'music.apple.com',
    'soundcloud.com',
    'youtube.com',
    'youtu.be',
    'mixcloud.com',
    'beatport.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return supportedPlatforms.some(platform => 
      urlObj.hostname.includes(platform)
    );
  } catch {
    return false;
  }
}

// ===== MAIN SERVER ACTIONS =====

/**
 * @function submitDJApplication
 * @description Submits a new DJ application to the database
 * @param {DJApplicationData} applicationData - The DJ application form data
 * @returns {Promise<DJApplicationResponse>} Application submission result
 * 
 * @example
 * ```typescript
 * const result = await submitDJApplication({
 *   fullName: "John Doe",
 *   phoneNumber: "08012345678",
 *   instagramHandle: "@johndj",
 *   mixLink: "https://spotify.com/playlist/123"
 * });
 * ```
 */
export async function submitDJApplication(
  applicationData: DJApplicationData
): Promise<DJApplicationResponse> {
  try {
    // Step 1: Validate input data
    const validatedData = DJApplicationSchema.parse(applicationData);
    
    // Step 2: Additional validation for mix platform
    if (!validateMixPlatform(validatedData.mixLink)) {
      return {
        success: false,
        error: "Please provide a link from a supported platform (Spotify, Audiomack, Apple Music, SoundCloud, etc.)"
      };
    }
    
    // Step 3: Normalize Instagram handle
    const normalizedInstagram = normalizeInstagramHandle(validatedData.instagramHandle);
    
    // Step 4: Check for duplicate applications (same Instagram handle or phone)
    const existingApplication = await prisma.djApplication.findFirst({
      where: {
        OR: [
          { instagramHandle: normalizedInstagram },
          { phoneNumber: validatedData.phoneNumber }
        ]
      }
    });
    
    if (existingApplication) {
      return {
        success: false,
        error: "An application with this Instagram handle or phone number already exists"
      };
    }
    
    // Step 5: Create the DJ application
    const djApplication = await prisma.djApplication.create({
      data: {
        fullName: validatedData.fullName.trim(),
        phoneNumber: validatedData.phoneNumber.trim(),
        instagramHandle: normalizedInstagram,
        mixLink: validatedData.mixLink.trim(),
        status: DJApplicationStatus.PENDING, // Default status
        submittedAt: new Date()
      }
    });
    
    console.log(`[DJ Application] New application submitted by ${validatedData.fullName} (ID: ${djApplication.id})`);
    
    return {
      success: true,
      applicationId: djApplication.id
    };
    
  } catch (error) {
    console.error('[DJ Application] Submission error:', error);
    
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
 * @function getDJApplications
 * @description Retrieves all DJ applications (admin use)
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of applications per page
 * @returns {Promise<{success: boolean, applications?: any[], totalCount?: number, error?: string}>}
 */
export async function getDJApplications(
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  applications?: DjApplication[];
  totalCount?: number;
  error?: string;
}> {
  try {
    const validPage = Math.max(1, Math.floor(page));
    const validLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const skip = (validPage - 1) * validLimit;
    
    const [applications, totalCount] = await Promise.all([
      prisma.djApplication.findMany({
        orderBy: { submittedAt: 'desc' },
        skip,
        take: validLimit
      }),
      prisma.djApplication.count()
    ]);
    
    return {
      success: true,
      applications,
      totalCount
    };
  } catch (error) {
    console.error('[DJ Applications] Fetch error:', error);
    return {
      success: false,
      error: "Failed to fetch DJ applications"
    };
  }
}

/**
 * @function updateDJApplicationStatus
 * @description Updates the status of a DJ application (admin use)
 * @param {string} applicationId - The ID of the application
 * @param {string} status - New status ('PENDING', 'APPROVED', 'REJECTED')
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateDJApplicationStatus(
  applicationId: string,
  status: DJApplicationStatus
): Promise<{success: boolean; error?: string}> {
  try {
    await prisma.djApplication.update({
      where: { id: applicationId },
      data: { 
        status,
        reviewedAt: new Date()
      }
    });
    
    console.log(`[DJ Application] Status updated for application ${applicationId}: ${status}`);
    
    return { success: true };
  } catch (error) {
    console.error('[DJ Application] Status update error:', error);
    return {
      success: false,
      error: "Failed to update application status"
    };
  }
}

/**
 * @function getDJApplicationsWithFilters
 * @description Retrieves DJ applications with filtering and pagination for admin
 * @param {string} [statusFilter] - Filter by status ('all', 'PENDING', 'APPROVED', 'REJECTED')
 * @param {number} [page=1] - Page number for pagination
 * @param {number} [limit=20] - Number of applications per page
 * @returns {Promise<{success: boolean, applications?: any[], totalCount?: number, stats?: any, error?: string}>}
 */
export async function getDJApplicationsWithFilters(
  statusFilter: string = 'all',
  page: number = 1,
  limit: number = 20
): Promise<{
  success: boolean;
  applications?: DjApplication[];
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
    const where: { status?: DJApplicationStatus } = {};
    if (statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase() as DJApplicationStatus;
    }
    
    // Get applications and total count
    const [applications, totalCount] = await Promise.all([
      prisma.djApplication.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip,
        take: validLimit
      }),
      prisma.djApplication.count({ where })
    ]);
    
    // Calculate statistics
    const [allApplications, recentApplicationsCount] = await Promise.all([
      prisma.djApplication.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      prisma.djApplication.count({
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
    console.error('[DJ Applications] Fetch with filters error:', error);
    return {
      success: false,
      error: "Failed to fetch DJ applications"
    };
  }
}

/**
 * @function exportDJApplications
 * @description Exports DJ applications to CSV format for download
 * @param {string} [statusFilter] - Status filter to apply
 * @returns {Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}>}
 */
export async function exportDJApplications(
  statusFilter: string = 'all'
): Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}> {
  try {
    // Build filter condition
    const where: { status?: DJApplicationStatus } = {};
    if (statusFilter !== 'all') {
      where.status = statusFilter.toUpperCase() as DJApplicationStatus;
    }
    
    // Get all matching applications
    const applications = await prisma.djApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' }
    });
    
    // Define CSV headers - only essential fields
    const headers = [
      'Full Name',
      'Phone Number',
      'Instagram Handle',
      'Mix Link'
    ];
    
    // Transform applications to CSV rows - only essential fields
    const rows = applications.map(app => [
      app.fullName,
      app.phoneNumber,
      app.instagramHandle,
      app.mixLink
    ]);
    
    // Generate CSV content
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Generate filename
    const filterSuffix = statusFilter !== 'all' ? `_${statusFilter.toLowerCase()}` : '';
    const filename = `shutupnrave_dj_applications${filterSuffix}_${new Date().toISOString().split('T')[0]}.csv`;
    
    return {
      success: true,
      csvContent,
      filename
    };
  } catch (error) {
    console.error('[DJ Applications] Export error:', error);
    return {
      success: false,
      error: 'Failed to export DJ applications. Please try again.'
    };
  }
}
