# Environment Variables Setup

To run the shutupnrave application with full checkout functionality, you need to configure the following environment variables in your `.env.local` file:

## Database Configuration

```
DATABASE_URL="mongodb://localhost:27017/shutupnrave"
```

Or for MongoDB Atlas:

```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/shutupnrave"
```

## Paystack Configuration

Get your API keys from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)

```
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key_here"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key_here"
```

For production, use live keys:

```
PAYSTACK_PUBLIC_KEY="pk_live_your_paystack_public_key_here"
PAYSTACK_SECRET_KEY="sk_live_your_paystack_secret_key_here"
```

## Resend Configuration

Get your API key from [Resend Dashboard](https://resend.com/api-keys)

```
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@shutupnrave.com.ng"
```

**Note**: For production, ensure your sending domain is verified in Resend.

## Cloudinary Configuration

Get your credentials from [Cloudinary Dashboard](https://cloudinary.com/console)

```
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**Used for**: QR code hosting for order confirmation emails (Gmail compatibility)

## Application Configuration

```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production:

```
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Setup Instructions

1. **Create `.env.local` file** in your project root
2. **Copy the variables above** and replace with your actual values
3. **Set up Paystack account** and get your API keys
4. **Set up Resend account** and get your API key
5. **Set up Cloudinary account** and get your credentials
6. **Set up MongoDB** (local or Atlas)
7. **Run database migrations**:
   ```bash
   npm run prismaGenerate
   npm run prismaDev
   ```

## Testing the Integration

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Test the checkout flow**:
   - Navigate to `/tickets`
   - Select ticket quantity
   - Fill in the checkout form
   - Complete payment with Paystack test card
   - Verify email receipt

## Test Card Numbers for Paystack

Use these test card numbers for development:

- **Successful Payment**: 4084084084084081
- **Insufficient Funds**: 4094940000000002
- **Invalid CVV**: 4084084084084081 (use CVV 000)

## Email Template Customization

The order confirmation email template is located in `emails/order-confirmation.tsx` using React Email components. The email includes:

- **Brand logo** (hosted on Cloudinary)
- **Order details** with custom Order ID
- **Ticket information** and pricing breakdown
- **QR code** with admin verification link (hosted on Cloudinary for Gmail compatibility)
- **Event information** and next steps

You can customize the template by editing the React components and styles in the file.

## Production Checklist

- [ ] Replace test API keys with live keys (Paystack)
- [ ] Set up custom domain for callback URLs
- [ ] Configure proper CORS settings
- [ ] Set up MongoDB Atlas for production
- [ ] Configure email sender domain with Resend
- [ ] Set up Cloudinary account for QR code hosting
- [ ] Test payment flow with real transactions
- [ ] Test QR code generation and email delivery
- [ ] Set up admin page for order verification
- [ ] Configure proper error monitoring
- [ ] Test email delivery across different clients (Gmail, Outlook, etc.)

## New Features

### QR Code Integration

- Each order generates a unique QR code
- QR codes link to admin verification page: `/admin-page/{orderId}`
- QR codes are hosted on Cloudinary for email compatibility
- Perfect for event check-in and order verification

### Custom Order IDs

- Human-readable order IDs (e.g., `ORD-2025-ABC123`)
- Used for customer reference and QR code links
- Separate from internal MongoDB IDs

## Complete .env.local Template

```bash
# Database Configuration
DATABASE_URL="mongodb://localhost:27017/shutupnrave"
# OR for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/shutupnrave"

# Paystack Configuration
PAYSTACK_PUBLIC_KEY="pk_test_your_paystack_public_key_here"
PAYSTACK_SECRET_KEY="sk_test_your_paystack_secret_key_here"

# Resend Configuration
RESEND_API_KEY="re_your_resend_api_key_here"
RESEND_FROM_EMAIL="noreply@shutupnrave.com.ng"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
