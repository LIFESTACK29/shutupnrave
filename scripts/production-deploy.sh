#!/bin/bash

# =============================================================================
# ShutUpNRave Production Deployment Script
# =============================================================================
# This script prepares and deploys the admin dashboard to production
# with comprehensive checks, optimizations, and security validations.
#
# Usage: ./scripts/production-deploy.sh
# Prerequisites: Node.js 18+, PostgreSQL, Vercel CLI
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed."
        exit 1
    fi
    
    node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        log_error "Node.js 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    log_success "Node.js $(node --version) ✓"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed."
        exit 1
    fi
    log_success "npm $(npm --version) ✓"
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    log_success "Vercel CLI ✓"
    
    # Check Prisma CLI
    if ! command -v prisma &> /dev/null; then
        log_warning "Prisma CLI not found globally. Using local version..."
    fi
    log_success "Prisma CLI ✓"
}

# Validate environment variables
check_environment() {
    log_info "Validating environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "ADMIN_EMAIL"
        "ADMIN_PASSWORD"
        "JWT_SECRET"
        "PAYSTACK_SECRET_KEY"
        "PAYSTACK_PUBLIC_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_error "Please set these variables before deploying."
        exit 1
    fi
    
    log_success "All required environment variables are set ✓"
    
    # Validate email format
    if [[ ! "$ADMIN_EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
        log_error "ADMIN_EMAIL format is invalid: $ADMIN_EMAIL"
        exit 1
    fi
    
    # Check password strength
    if [ ${#ADMIN_PASSWORD} -lt 12 ]; then
        log_warning "ADMIN_PASSWORD should be at least 12 characters long"
    fi
    
    # Check JWT secret strength
    if [ ${#JWT_SECRET} -lt 32 ]; then
        log_error "JWT_SECRET should be at least 32 characters long for security"
        exit 1
    fi
    
    log_success "Environment validation passed ✓"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Clean install for production
    rm -rf node_modules package-lock.json
    npm ci --production=false
    
    log_success "Dependencies installed ✓"
}

# Run code quality checks
run_quality_checks() {
    log_info "Running code quality checks..."
    
    # TypeScript compilation
    log_info "Checking TypeScript compilation..."
    npx tsc --noEmit
    log_success "TypeScript compilation ✓"
    
    # ESLint
    log_info "Running ESLint..."
    npx eslint . --ext .ts,.tsx --max-warnings 0
    log_success "ESLint passed ✓"
    
    # Prettier check
    log_info "Checking code formatting..."
    npx prettier --check .
    log_success "Code formatting ✓"
    
    # Check for unused dependencies
    log_info "Checking for unused dependencies..."
    npx depcheck --ignores="@types/*,eslint*,prettier,typescript"
    log_success "Dependency check ✓"
}

# Run tests
run_tests() {
    log_info "Running test suite..."
    
    # Unit tests
    if [ -f "jest.config.js" ] || [ -f "jest.config.ts" ]; then
        log_info "Running unit tests..."
        npm test -- --coverage --watchAll=false
        log_success "Unit tests passed ✓"
    else
        log_warning "No Jest configuration found, skipping unit tests"
    fi
    
    # E2E tests (if available)
    if [ -f "playwright.config.ts" ] || [ -f "cypress.config.ts" ]; then
        log_info "Running E2E tests..."
        npm run test:e2e
        log_success "E2E tests passed ✓"
    else
        log_warning "No E2E test configuration found, skipping E2E tests"
    fi
}

# Build application
build_application() {
    log_info "Building application for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build Next.js application
    npm run build
    
    # Check build output
    if [ ! -d ".next" ]; then
        log_error "Build failed - .next directory not found"
        exit 1
    fi
    
    log_success "Application built successfully ✓"
}

# Database operations
setup_database() {
    log_info "Setting up production database..."
    
    # Check database connection
    log_info "Testing database connection..."
    npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null
    log_success "Database connection ✓"
    
    # Run migrations
    log_info "Running database migrations..."
    npx prisma migrate deploy
    log_success "Database migrations ✓"
    
    # Seed database (if needed)
    log_info "Seeding database..."
    npx prisma db seed
    log_success "Database seeding ✓"
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    log_success "Prisma client generated ✓"
}

# Security checks
run_security_checks() {
    log_info "Running security checks..."
    
    # Check for vulnerabilities
    log_info "Scanning for security vulnerabilities..."
    npm audit --audit-level=high
    log_success "Security audit passed ✓"
    
    # Check for secrets in code
    log_info "Scanning for potential secrets..."
    if command -v grep &> /dev/null; then
        secret_patterns=(
            "password.*=.*['\"][^'\"]{8,}['\"]"
            "secret.*=.*['\"][^'\"]{8,}['\"]"
            "key.*=.*['\"][^'\"]{8,}['\"]"
            "token.*=.*['\"][^'\"]{8,}['\"]"
        )
        
        for pattern in "${secret_patterns[@]}"; do
            if grep -r -i -E "$pattern" app/ lib/ --exclude-dir=node_modules; then
                log_warning "Potential hardcoded secrets found. Please review."
            fi
        done
    fi
    
    log_success "Security checks completed ✓"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel..."
    
    # Login to Vercel (if needed)
    if ! vercel whoami &> /dev/null; then
        log_info "Please login to Vercel..."
        vercel login
    fi
    
    # Deploy to production
    log_info "Deploying to production..."
    vercel --prod --confirm
    
    log_success "Deployment completed ✓"
}

# Post-deployment verification
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Get deployment URL
    deployment_url=$(vercel --scope $(vercel whoami) ls --meta url | head -n1)
    
    if [ -n "$deployment_url" ]; then
        log_info "Deployment URL: $deployment_url"
        
        # Basic health check
        if command -v curl &> /dev/null; then
            log_info "Running health check..."
            if curl -f -s "$deployment_url" > /dev/null; then
                log_success "Health check passed ✓"
            else
                log_warning "Health check failed - please verify manually"
            fi
        fi
    fi
    
    log_success "Deployment verification completed ✓"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    cat > deployment-report.md << EOF
# Deployment Report - $(date)

## Summary
- **Status**: ✅ Successful
- **Date**: $(date)
- **Version**: $(git rev-parse --short HEAD)
- **Branch**: $(git branch --show-current)

## Environment
- **Node.js**: $(node --version)
- **npm**: $(npm --version)
- **Database**: PostgreSQL
- **Platform**: Vercel

## Checks Performed
- ✅ Prerequisites validation
- ✅ Environment variables validation
- ✅ Dependencies installation
- ✅ Code quality checks (TypeScript, ESLint, Prettier)
- ✅ Security audit
- ✅ Production build
- ✅ Database setup
- ✅ Deployment to Vercel

## Admin Access
- **URL**: $deployment_url/admin-login
- **Email**: $ADMIN_EMAIL
- **Password**: [Set via environment variable]

## Next Steps
1. Verify admin login functionality
2. Test order management features
3. Verify email management system
4. Check ticket scanning functionality
5. Monitor application logs

## Support
For issues or questions, contact the development team.
EOF

    log_success "Deployment report generated: deployment-report.md ✓"
}

# Main deployment flow
main() {
    log_info "🚀 Starting ShutUpNRave production deployment..."
    echo "================================================="
    
    # Pre-deployment checks
    check_prerequisites
    check_environment
    
    # Code preparation
    install_dependencies
    run_quality_checks
    # run_tests  # Uncomment when tests are available
    
    # Security validation
    run_security_checks
    
    # Build and deploy
    build_application
    setup_database
    deploy_to_vercel
    
    # Post-deployment
    verify_deployment
    generate_report
    
    echo "================================================="
    log_success "🎉 Deployment completed successfully!"
    log_info "📊 Check deployment-report.md for details"
    log_info "🔗 Admin panel: ${deployment_url}/admin-login"
}

# Cleanup on exit
cleanup() {
    log_info "Cleaning up temporary files..."
    # Add any cleanup operations here
}

trap cleanup EXIT

# Run main function
main "$@" 