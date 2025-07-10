# ShutUpNRave Admin Dashboard Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Security](#security)
5. [Getting Started](#getting-started)
6. [API Reference](#api-reference)
7. [Components](#components)
8. [Database Schema](#database-schema)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)

## Overview

The ShutUpNRave Admin Dashboard is a comprehensive event management system built for the shutupnraveee 2025 event. It provides complete order management, ticket verification, customer communication, and real-time analytics capabilities.

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, React Server Components
- **UI**: Tailwind CSS with shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Deployment**: Vercel (recommended)

### Key Capabilities
- **Order Management**: View, search, filter, and manage all ticket orders
- **Ticket Verification**: QR code scanning and ticket deactivation
- **Customer Management**: Email list management and customer analytics
- **Real-time Statistics**: Live event metrics and revenue tracking
- **Responsive Design**: Mobile-first design that works on all devices

## Features

### 🎫 Order Management
- **Advanced Search**: Search by order ID, customer name, email, or phone number
- **Smart Filtering**: Filter by order status (Pending, Confirmed, Cancelled, Refunded)
- **Ticket Status**: Track active vs used tickets in real-time
- **Bulk Operations**: Pagination and bulk data management
- **Export Capabilities**: CSV export for offline analysis

### 📊 Analytics Dashboard
- **Live Statistics**: Real-time order counts, ticket sales, and revenue
- **Ticket Breakdown**: Solo Vibes vs Geng Energy ticket analytics
- **Financial Tracking**: Processing fees, subtotals, and total revenue
- **Customer Metrics**: Active vs inactive customer tracking

### 🔍 Ticket Verification
- **QR Code Integration**: Scan tickets for instant verification
- **Deactivation System**: Mark tickets as used to prevent re-entry
- **Security Validation**: Cryptographic validation of ticket authenticity

### 📧 Email Management
- **Unified Contacts**: Combined newsletter subscribers and customers
- **Deduplication**: Smart handling of users with multiple touchpoints
- **Export Features**: CSV export for email marketing campaigns
- **Privacy Compliant**: Secure handling of customer data

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin-only access controls
- **Session Management**: Automatic session expiration and renewal
- **Input Validation**: Comprehensive data validation and sanitization

## Architecture

### Directory Structure
```
app/(pages)/admin-page/
├── components/              # Reusable admin components
│   ├── AdminHeader.tsx      # Navigation and logout
│   ├── AdminOrderSearch.tsx # Search and filtering
│   ├── AdminOrdersTable.tsx # Order display table
│   ├── AdminEmailList.tsx   # Email management
│   ├── AdminEmailStats.tsx  # Email statistics
│   ├── AdminStatsCards.tsx  # Dashboard statistics
│   ├── OrderDetailsModal.tsx # Order detail popup
│   └── Pagination.tsx       # Pagination controls
├── [orderId]/               # Individual order pages
├── emails/                  # Email management section
├── actions.ts               # Server actions
├── layout.tsx               # Admin layout wrapper
└── page.tsx                 # Main dashboard
```

### Component Architecture

#### Server Components
- **AdminPage**: Main dashboard with statistics and order management
- **OrderDetailsPage**: Individual order detail views
- **EmailsPage**: Email management and customer analytics

#### Client Components
- **AdminOrderSearch**: Real-time search with debouncing
- **AdminOrdersTable**: Responsive table with pagination
- **AdminEmailList**: Customer and subscriber management

### Data Flow
1. **Client Interaction**: User interacts with UI components
2. **Server Actions**: Actions called via Next.js server actions
3. **Database Queries**: Prisma queries to PostgreSQL
4. **Data Transformation**: Type-safe data mapping
5. **UI Updates**: Real-time UI updates with optimistic rendering

## Security

### Authentication System
```typescript
// JWT Token Structure
{
  "adminId": "uuid",
  "email": "admin@shutupnrave.com",
  "iat": 1704672000,
  "exp": 1704758400  // 24 hour expiration
}
```

### Security Measures
- **JWT Tokens**: 24-hour expiration with HTTP-only cookies
- **Input Validation**: Zod schemas for all data validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie configuration

### Environment Variables
```bash
# Required for admin authentication
ADMIN_EMAIL=admin@shutupnrave.com
ADMIN_PASSWORD=secure_password_here
JWT_SECRET=your_jwt_secret_key_here

# Database connection
DATABASE_URL=postgresql://...

# Paystack integration
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/shutupnrave

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma migrate deploy
npx prisma db seed

# Start development server
npm run dev
```

### First Time Setup
1. Configure environment variables in `.env.local`
2. Run database migrations: `npx prisma migrate deploy`
3. Seed the database: `npx prisma db seed`
4. Access admin panel: `http://localhost:3000/admin-login`

### Default Admin Credentials
- **Email**: As defined in `ADMIN_EMAIL` environment variable
- **Password**: As defined in `ADMIN_PASSWORD` environment variable

## API Reference

### Server Actions

#### Order Management
```typescript
// Get orders with filtering and pagination
getOrdersWithFilters(
  searchQuery?: string,
  statusFilter?: string,
  activeFilter?: string,
  page: number = 1,
  limit: number = 20
): Promise<OrderFiltersResult>

// Deactivate a ticket
deactivateTicketAction(orderId: string): Promise<{success: boolean, error?: string}>
```

#### Email Management
```typescript
// Get all emails with deduplication
getAllEmails(
  searchQuery?: string,
  sourceFilter?: string,
  activeFilter?: string,
  page: number = 1,
  limit: number = 50
): Promise<EmailManagementResult>

// Export emails to CSV
exportEmails(
  searchQuery?: string,
  sourceFilter?: string,
  activeFilter?: string
): Promise<{success: boolean, csvContent?: string, filename?: string, error?: string}>
```

#### Authentication
```typescript
// Admin login
loginAdmin(email: string, password: string): Promise<{success: boolean, error?: string}>

// Admin logout
logoutAdmin(): Promise<{success: boolean}>

// Verify admin token
verifyAdminToken(): Promise<{success: boolean, admin?: AdminUser}>
```

### Response Types
```typescript
interface OrderFiltersResult {
  success: boolean;
  orders?: Order[];
  allOrders?: Order[];
  pagination?: PaginationParams;
  ticketStats?: Record<string, TicketStatistics>;
  error?: string;
}

interface EmailManagementResult {
  success: boolean;
  emails?: EmailData[];
  allEmails?: EmailData[];
  pagination?: PaginationParams;
  stats?: EmailStatistics;
  error?: string;
}
```

## Components

### AdminOrderSearch
Advanced search and filtering component with auto-search capabilities.

**Props:**
- `onSearch`: Callback for search/filter changes
- `isLoading`: Loading state for UI feedback
- `autoSearch`: Enable real-time search with debouncing

**Features:**
- 300ms debounced auto-search
- Order status filtering
- Ticket status filtering
- Responsive design

### AdminOrdersTable
Responsive table component for order display and management.

**Props:**
- `orders`: Array of orders to display
- `total`: Total number of orders for pagination
- `currentPage`: Current page number
- `itemsPerPage`: Items per page
- `loading`: Loading state
- `onPageChange`: Page navigation callback
- `onOrderClick`: Order selection callback

**Features:**
- Desktop table + mobile cards
- Column sorting capabilities
- Advanced pagination
- Currency formatting
- Status badges

### AdminEmailList
Customer and subscriber management component.

**Props:**
- `emails`: Array of email data
- `onEmailClick`: Email selection callback
- `isLoading`: Loading state

**Features:**
- Deduplication handling
- Customer statistics
- Export capabilities
- Source identification

## Database Schema

### Key Tables
```sql
-- Orders table
CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL,
  "total" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  "processingFee" INTEGER NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "fullName" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter subscribers
CREATE TABLE "NewsletterSubscriber" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Relationships
- `Order` belongs to `User`
- `OrderItem` belongs to `Order` and `TicketType`
- `NewsletterSubscriber` is independent

## Deployment

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
vercel env add JWT_SECRET
vercel env add DATABASE_URL
```

### Environment Configuration
```bash
# Production environment variables
ADMIN_EMAIL=admin@shutupnrave.com
ADMIN_PASSWORD=production_secure_password
JWT_SECRET=production_jwt_secret_key
DATABASE_URL=postgresql://production_db_url
NODE_ENV=production
```

### Database Setup
```bash
# Run migrations in production
npx prisma migrate deploy

# Seed production database
npx prisma db seed
```

### Performance Considerations
- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Connection Pooling**: Configure PostgreSQL connection pooling
- **Caching**: Implement Redis caching for frequently accessed data
- **CDN**: Use Vercel's edge network for static assets

## Troubleshooting

### Common Issues

#### Authentication Problems
```typescript
// Token verification fails
Problem: "Invalid or expired token"
Solution: Check JWT_SECRET environment variable, ensure token hasn't expired

// Login fails
Problem: "Invalid credentials"
Solution: Verify ADMIN_EMAIL and ADMIN_PASSWORD environment variables
```

#### Database Issues
```sql
-- Connection failures
Problem: "Can't reach database server"
Solution: Check DATABASE_URL and network connectivity

-- Migration issues
Problem: "Migration failed"
Solution: npx prisma migrate reset (development only)
```

#### Performance Issues
```typescript
// Slow queries
Problem: Dashboard loads slowly
Solution: Add database indexes, implement pagination, optimize queries

// Memory issues
Problem: High memory usage
Solution: Implement proper data pagination, limit query results
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev

# Database query logging
PRISMA_DEBUG=true npm run dev
```

### Monitoring
- **Error Tracking**: Implement Sentry or similar error tracking
- **Performance Monitoring**: Use Vercel Analytics
- **Database Monitoring**: Monitor query performance and connection usage

## Contributing

### Code Standards
- **TypeScript**: Strict mode enabled, comprehensive type definitions
- **ESLint**: Follow project ESLint configuration
- **Prettier**: Consistent code formatting
- **Commit Messages**: Use conventional commit format

### Development Workflow
1. Create feature branch from `main`
2. Implement changes with proper documentation
3. Add tests for new functionality
4. Update documentation as needed
5. Submit pull request with detailed description

### Testing
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### Documentation Updates
- Update JSDoc comments for new functions
- Add examples for complex functionality
- Update API documentation for new endpoints
- Include migration guides for breaking changes

---

**Last Updated**: January 8, 2025  
**Version**: 1.0.0  
**Maintainer**: ShutUpNRave Admin Team 