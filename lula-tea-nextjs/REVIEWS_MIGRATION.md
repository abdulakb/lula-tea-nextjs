# Reviews Table Migration Instructions

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com
2. Select your Lula Tea project
3. Navigate to **SQL Editor** in the left sidebar

## Step 2: Create Reviews Table

1. Click **New Query**
2. Copy the entire content from `supabase/migrations/004_create_reviews_table.sql`
3. Paste it into the SQL editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

## Step 3: Verify Table Creation

After running the migration, verify by running this query:

```sql
SELECT * FROM reviews LIMIT 1;
```

You should see an empty result set (no errors).

## What This Migration Does

Creates a `reviews` table with:
- **Star ratings** for: overall, taste, quality, delivery (1-5)
- **Customer details**: name, order ID, language
- **Optional comments**: text field for additional feedback
- **Approval system**: `approved` and `featured` flags for admin moderation
- **Indexes**: for fast queries on approved/featured reviews

## Table Structure

```
reviews
├── id (PRIMARY KEY)
├── order_id (TEXT)
├── customer_name (TEXT)
├── overall_rating (1-5)
├── taste_rating (1-5)
├── quality_rating (1-5)
├── delivery_rating (1-5)
├── comments (TEXT, optional)
├── language (ar/en)
├── approved (BOOLEAN, default false)
├── featured (BOOLEAN, default false)
└── created_at (TIMESTAMP)
```

## Important Notes

- All ratings are validated to be between 1-5
- Reviews are NOT auto-approved (admin must approve)
- Featured flag allows you to highlight best reviews
- Language field stores whether review was in Arabic or English
- Indexes optimize queries for displaying approved/featured reviews

## Next Steps

After migration:
1. Test the review submission by marking an order as "delivered"
2. Customer will receive WhatsApp message with review link
3. Customer submits interactive star ratings
4. Admin can approve/feature reviews in admin panel (to be built next)
