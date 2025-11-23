# Admin Dashboard & Email Notifications Setup

This guide explains how to use the admin dashboard and configure email notifications for your Lula Tea e-commerce platform.

## Admin Dashboard Overview

The admin dashboard provides a complete order management system with real-time statistics and order tracking.

### Features

✅ **Dashboard Statistics**
- Total orders count
- Pending orders count
- Total revenue tracking
- Today's orders count

✅ **Order Management**
- View all orders in a sortable table
- Filter orders by status (pending, confirmed, processing, shipped, delivered, cancelled)
- Search orders by ID, customer name, or phone
- Update order status with one click
- View detailed order information

✅ **Order Details**
- Full customer information
- Itemized order breakdown
- Payment method information
- Download customer invoices
- Direct WhatsApp contact link

## Accessing the Admin Dashboard

### 1. Navigate to Admin Portal

Visit: `https://your-domain.vercel.app/admin`

### 2. Default Login Credentials

- **Password**: `lulatea2024`

> **Important**: Change the default password in your environment variables!

### 3. Change Admin Password

Update your `.env.local` file:

\`\`\`env
ADMIN_PASSWORD=your_secure_password_here
\`\`\`

Then redeploy to Vercel with the new environment variable.

## Using the Admin Dashboard

### Dashboard Home (`/admin`)

1. **View Statistics**: See real-time metrics for your business
2. **Quick Actions**: Click "Manage Orders" to access the orders page

### Orders Management (`/admin/orders`)

1. **Search Orders**: Use the search bar to find specific orders
2. **Filter by Status**: Select a status from the dropdown to filter orders
3. **Update Status**: Use the dropdown in the Actions column to change order status
4. **View Details**: Click "View" to see full order information

### Order Detail Page (`/admin/orders/[id]`)

1. **Customer Information**: View complete customer details
2. **Order Items**: See all products and quantities ordered
3. **Download Invoice**: Click to download the PDF invoice
4. **Contact Customer**: Click WhatsApp button to message directly

### Order Status Workflow

Recommended order progression:

1. **Pending** → Customer just placed order
2. **Confirmed** → You've confirmed the order with customer
3. **Processing** → Preparing the tea/packaging
4. **Shipped** → Order is out for delivery
5. **Delivered** → Customer received the order
6. **Cancelled** → Order was cancelled

## Email Notifications Setup

### Why Email Notifications?

- Automatic order confirmations for customers
- Professional branded emails
- Status update notifications
- Builds customer trust

### Email Service: Resend

We use [Resend](https://resend.com) for email delivery:
- ✅ **FREE Tier**: 3,000 emails/month
- ✅ **100 emails/day** limit
- ✅ Beautiful HTML emails
- ✅ Easy setup

### Setup Instructions

#### 1. Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

#### 2. Add Your Domain (Recommended)

For professional emails from `orders@lulatee.com`:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `lulatee.com`)
4. Add the DNS records to your domain provider:
   - **MX Record**
   - **TXT Record (SPF)**
   - **TXT Record (DKIM)**
5. Wait for verification (usually 5-10 minutes)

#### 3. Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Lula Tea Production")
4. Copy the API key (starts with `re_...`)

#### 4. Add to Environment Variables

Update your `.env.local` file:

\`\`\`env
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_SITE_URL=https://lula-tea-nextjs.vercel.app
\`\`\`

#### 5. Update Sender Email

Edit `app/api/emails/send/route.ts`:

\`\`\`typescript
from: "Lula Tea <orders@lulatee.com>", // Replace with your verified domain
\`\`\`

If you don't have a custom domain yet, you can use:

\`\`\`typescript
from: "Lula Tea <onboarding@resend.dev>", // Resend test domain
\`\`\`

#### 6. Deploy to Vercel

Add the environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - `RESEND_API_KEY`: Your Resend API key
   - `ADMIN_PASSWORD`: Your admin password
   - `NEXT_PUBLIC_SITE_URL`: Your site URL

4. Redeploy your app

## Email Templates

### Order Confirmation Email

Sent automatically when a customer places an order:

- ✅ Bilingual (English/Arabic)
- ✅ Order summary with items
- ✅ Total amount
- ✅ Order number
- ✅ Next steps information
- ✅ Contact information

### Order Status Update Email

Sent when you update an order status from the admin dashboard:

- ✅ Bilingual (English/Arabic)
- ✅ Order status message
- ✅ Order number
- ✅ Contact button

## Testing Email Notifications

### 1. Test Locally

1. Add your Resend API key to `.env.local`
2. Start dev server: `npm run dev`
3. Place a test order with your email address
4. Check your inbox for confirmation email

### 2. Test on Vercel

1. Deploy with environment variables configured
2. Place a real order through your live site
3. Verify email delivery

### 3. Check Resend Dashboard

Monitor email delivery:
- Go to Resend dashboard → **Logs**
- See all sent emails
- Check delivery status
- View any errors

## Troubleshooting

### Emails Not Sending?

**Check 1**: Verify API key is set correctly
\`\`\`bash
echo $RESEND_API_KEY  # Should show your key
\`\`\`

**Check 2**: Verify customer provided email
- Email field is optional in checkout
- Only customers who provide email will receive confirmations

**Check 3**: Check Resend logs
- Go to Resend dashboard
- Check for failed deliveries
- Review error messages

**Check 4**: Verify sender domain
- If using custom domain, ensure DNS is verified
- Or use `onboarding@resend.dev` for testing

### Admin Dashboard Not Loading?

**Check 1**: Verify you're authenticated
- Clear browser localStorage
- Re-enter admin password

**Check 2**: Check Supabase connection
- Ensure Supabase credentials are correct in `.env.local`
- Verify orders table exists

**Check 3**: Check browser console
- Open Developer Tools (F12)
- Look for error messages

### Can't Update Order Status?

**Check 1**: Verify Supabase permissions
- Check RLS policies on orders table
- Ensure service role has UPDATE permission

**Check 2**: Check network tab
- Open Developer Tools → Network
- Look for failed API requests

## Security Best Practices

### 1. Change Default Password

⚠️ **Critical**: Change from `lulatea2024` immediately!

\`\`\`env
ADMIN_PASSWORD=SuperSecurePassword123!
\`\`\`

### 2. Use Strong Passwords

- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't share the password

### 3. Secure Your Environment Variables

- Never commit `.env.local` to git (already in `.gitignore`)
- Store Vercel environment variables securely
- Rotate API keys periodically

### 4. Monitor Access

- Check admin access logs regularly
- Be alert for suspicious activity
- Change password if compromised

## Advanced: Future Enhancements

### Role-Based Access Control

Consider implementing NextAuth.js for:
- Multiple admin users
- Different permission levels
- Session management
- OAuth login

### Email Improvements

- Attach PDF invoice to email
- Send SMS notifications via Twilio
- Add email templates for:
  - Order shipped
  - Order delivered
  - Delivery delays
- Customer feedback requests

### Dashboard Features

- Sales charts and analytics
- Inventory tracking
- Customer database
- Export orders to CSV
- Automated reporting

## Cost Breakdown

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Resend** | 3,000 emails/month | $20/month for 50,000 |
| **Supabase** | 500MB database | $25/month unlimited |
| **Vercel** | Unlimited hobby projects | $20/month Pro |
| **Domain** | N/A | ~$12/year |

**Total FREE**: $0/month (within limits)
**Total Paid**: ~$66/month + domain

## Support

For issues or questions:
- Check [Resend Documentation](https://resend.com/docs)
- Check [Supabase Documentation](https://supabase.com/docs)
- Contact via WhatsApp: +966 53 966 6654

## Quick Reference

### Admin URLs
- Dashboard: `/admin`
- Orders List: `/admin/orders`
- Order Detail: `/admin/orders/[id]`

### API Endpoints
- Create Order: `/api/orders/create`
- Send Email: `/api/emails/send`

### Environment Variables
\`\`\`env
# Admin Access
ADMIN_PASSWORD=your_password

# Email Service
RESEND_API_KEY=re_your_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
\`\`\`

---

**Ready to manage your orders!** 🎉

Visit `/admin` to get started with your new admin dashboard.
