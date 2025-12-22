-- Add building_number column to orders table

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS building_number VARCHAR(50);

-- Add comment
COMMENT ON COLUMN public.orders.building_number IS 'Building number to help delivery drivers locate the address';
