# shutupnrave

**shutupnrave** is a ticketing platform built for tech raves.

## 🌐 Visit Us At

[https://shutupnrave.com.ng](https://shutupnrave.com.ng)

## About

shutupnrave is designed to make ticketing for tech events easy, fast, and reliable. Whether you're an attendee looking to secure your spot or an organizer managing entries, shutupnrave offers a smooth, user-friendly interface.

## Features

- Online ticket purchase and management
- Secure and fast checkout (Paystack)
- Mobile-friendly design
- Real-time updates and notifications
- Admin dashboard: orders, emails, DJ/volunteer applications
- Affiliates program: manual link creation, attribution, commissions, portal
- Branded email notifications via Resend + React Email

## Tech Stack

- **Framework:** Next.js (React 19)
- **Styling:** Tailwind CSS + shadcn/ui + Radix UI
- **Language:** TypeScript
- **DB/ORM:** MongoDB + Prisma
- **Payments:** Paystack
- **Email:** Resend + @react-email/components

## Getting Started (Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/shutupnrave.git
   cd shutupnrave
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Environment Variables

Create `.env.local` with at least:

```bash
DATABASE_URL="mongodb://localhost:27017/shutupnrave"
JWT_SECRET="replace-with-strong-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PAYSTACK_SECRET_KEY="sk_test_xxx"
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="no-reply@yourdomain.com"
CLOUDINARY_CLOUD_NAME="xxx"
CLOUDINARY_API_KEY="xxx"
CLOUDINARY_API_SECRET="xxx"
```

## Prisma

Regenerate client after schema changes:

```bash
npx prisma generate
npx prisma db push
```

## Admin Dashboard

- URL: `/admin-page`
- Features: orders, ticket verification, email management, DJ/volunteer applications, affiliates

## Affiliates Program

- Admin can create affiliates manually from `/admin-page/affiliates` (modal with email/name/phone/password)
- System generates a unique `refCode` and shares link: `${NEXT_PUBLIC_APP_URL}/tickets?ref=REFCODE`
- Orders from referral links are attributed to the affiliate
- Commissions: flat 10% per order item recorded as `AffiliateCommission`
- Emails:
  - Affiliate welcome (credentials and portal links)
  - Affiliate sale notification on each attributed purchase
  - Admin order notification on every successful order

## Affiliate Portal (Sub-Admin)

- Login: `/affiliate/login`
- Dashboard: `/affiliate`
- Shows only self stats: successful orders, tickets sold, subtotal, commission, per-ticket-type breakdown, recent orders
- Copy referral link with success toast

## Emails

- React Email templates (branded):
  - `emails/order-confirmation.tsx` (customer)
  - `emails/affiliate-welcome.tsx` (affiliate welcome)
  - `emails/affiliate-sale-notification.tsx` (affiliate sale)
  - `emails/admin-order-notification.tsx` (admin)

## Notes

- For Paystack redirect, ensure `NEXT_PUBLIC_APP_URL` is set to a public URL in production.
- To attribute sales, use ticket links with `?ref=REFCODE`.

## License

This project is private and not open for redistribution.
