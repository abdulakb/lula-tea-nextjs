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

-- Add comment to describe the new columns
COMMENT ON COLUMN public.orders.customer_email IS 'Customer email address for order confirmation';
COMMENT ON COLUMN public.orders.gps_coordinates IS 'GPS coordinates from customer location sharing (latitude, longitude)';
COMMENT ON COLUMN public.orders.delivery_address_formatted IS 'Human-readable formatted address from reverse geocoding';
COMMENT ON COLUMN public.orders.delivery_time_preference IS 'Customer preferred delivery time (Morning/Afternoon/Evening/Anytime)';
COMMENT ON COLUMN public.orders.quantity_ordered IS 'Total quantity of items ordered';
COMMENT ON COLUMN public.orders.order_date IS 'Date and time when order was placed';
