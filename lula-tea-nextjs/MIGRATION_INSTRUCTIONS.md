# Database Migration Instructions

## Run this SQL in Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: ktvbmxliscwhmlxlfyly
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the SQL below
6. Click "Run" or press Ctrl+Enter

```sql
-- Add new columns to orders table for enhanced tracking
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS gps_coordinates VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_address_formatted TEXT,
ADD COLUMN IF NOT EXISTS delivery_time_preference VARCHAR(100),
ADD COLUMN IF NOT EXISTS quantity_ordered INTEGER,
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add index for order_date for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);

-- Add comments to describe the new columns
COMMENT ON COLUMN public.orders.customer_email IS 'Customer email address for order confirmation';
COMMENT ON COLUMN public.orders.gps_coordinates IS 'GPS coordinates from customer location sharing (latitude, longitude)';
COMMENT ON COLUMN public.orders.delivery_address_formatted IS 'Human-readable formatted address from reverse geocoding';
COMMENT ON COLUMN public.orders.delivery_time_preference IS 'Customer preferred delivery time (Morning/Afternoon/Evening/Anytime)';
COMMENT ON COLUMN public.orders.quantity_ordered IS 'Total quantity of items ordered';
COMMENT ON COLUMN public.orders.order_date IS 'Date and time when order was placed';
```

## What This Migration Does

This adds the following columns to track all customer form data:

1. **customer_email** - Customer's email address (optional)
2. **gps_coordinates** - GPS location (e.g., "24.872135, 46.625636")
3. **delivery_address_formatted** - Human-readable address from reverse geocoding
4. **delivery_time_preference** - Selected delivery time (Morning/Afternoon/Evening/Anytime)
5. **quantity_ordered** - Total number of items in the order
6. **order_date** - Timestamp when order was placed

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

This will show all columns in the orders table including the new ones.
