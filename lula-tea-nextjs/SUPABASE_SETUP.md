# Supabase Setup Instructions

This document explains how to set up the Supabase database for the Lula Tea e-commerce platform.

## Prerequisites

- A Supabase account (free tier is sufficient)
- Access to your Supabase project dashboard

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: Lula Tea (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., Middle East if serving Saudi Arabia)
5. Wait for project to be created (takes 1-2 minutes)

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhb...`)
3. Update your `.env.local` file with these values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Create the Orders Table

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_create_orders_table.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- ✅ `orders` table with all required fields
- ✅ Indexes for fast queries
- ✅ Row Level Security (RLS) policies
- ✅ Automatic `updated_at` trigger

### 4. Verify the Table

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the `orders` table with these columns:
   - `id` (UUID, primary key)
   - `order_id` (string, unique)
   - `customer_name` (string)
   - `customer_phone` (string)
   - `customer_address` (text)
   - `delivery_notes` (text, nullable)
   - `items` (JSONB)
   - `subtotal` (decimal)
   - `delivery_fee` (decimal)
   - `total` (decimal)
   - `payment_method` (string: 'cod' or 'whatsapp')
   - `invoice_base64` (text)
   - `status` (string: 'pending', 'confirmed', etc.)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

### 5. Test the Setup

1. Start your Next.js development server: `npm run dev`
2. Add a product to cart
3. Go to checkout
4. Select "Cash on Delivery"
5. Fill in customer information
6. Submit the order
7. Check your Supabase dashboard - you should see the order in the `orders` table!

## Database Schema

```sql
orders (
  id UUID PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_notes TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cod', 'whatsapp')),
  invoice_base64 TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## Security Notes

- **Row Level Security (RLS)** is enabled
- Service role has full access (used by API routes)
- Public anon key is safe to expose (has limited permissions)
- Never commit your `.env.local` file to git (it's in `.gitignore`)

## Future Enhancements

- Add customer authentication (magic link already implemented)
- Track order history per user
- Add admin dashboard to manage orders
- Send email/SMS notifications for order updates
- Add shipping/tracking integration

## Troubleshooting

### Orders not saving?

1. Check your `.env.local` has correct Supabase credentials
2. Verify the orders table exists in Supabase
3. Check browser console for API errors
4. Look at Vercel deployment logs

### Can't run migration?

1. Make sure you're in the SQL Editor (not Table Editor)
2. Paste the entire SQL file contents
3. Click Run - you should see "Success" message

## Support

For issues or questions:
- Check [Supabase Documentation](https://supabase.com/docs)
- Contact via WhatsApp: +966 53 966 6654
