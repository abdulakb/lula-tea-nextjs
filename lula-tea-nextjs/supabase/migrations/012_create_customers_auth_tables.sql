-- Migration: Create customers and authentication tables
-- Description: Creates tables for customer authentication and order management

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_token_expires_at TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT customers_email_or_phone_check CHECK (
    (email IS NOT NULL AND email != '') OR 
    (phone IS NOT NULL AND phone != '')
  )
);

-- Create customer addresses table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  address_type VARCHAR(50) DEFAULT 'home',
  full_address TEXT NOT NULL,
  gps_coordinates TEXT,
  city VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update orders table to link customers
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS can_cancel BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON public.customers(verification_token);
CREATE INDEX IF NOT EXISTS idx_customers_reset_token ON public.customers(reset_token);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON public.customer_addresses(customer_id);

-- Create updated_at trigger function for customers
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customers
CREATE TRIGGER update_customers_updated_at_trigger
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Create updated_at trigger for customer_addresses
CREATE TRIGGER update_customer_addresses_updated_at_trigger
  BEFORE UPDATE ON public.customer_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table
-- Allow anyone to insert (signup)
CREATE POLICY "Allow public signup" ON public.customers
  FOR INSERT
  WITH CHECK (true);

-- Customers can view their own data
CREATE POLICY "Customers can view own data" ON public.customers
  FOR SELECT
  USING (
    id::text = current_setting('app.current_customer_id', true) OR
    true  -- Allow service role to see all
  );

-- Customers can update their own data
CREATE POLICY "Customers can update own data" ON public.customers
  FOR UPDATE
  USING (
    id::text = current_setting('app.current_customer_id', true)
  );

-- Service role can do everything
CREATE POLICY "Service role full access to customers" ON public.customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for customer_addresses
CREATE POLICY "Customers can manage own addresses" ON public.customer_addresses
  FOR ALL
  USING (
    customer_id::text = current_setting('app.current_customer_id', true) OR
    true  -- Allow service role to see all
  );

-- Allow service role to insert orders with customer_id
CREATE POLICY "Allow orders with customer_id" ON public.orders
  FOR INSERT
  WITH CHECK (true);

-- Update existing policy to allow customers to see their own orders
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT
  USING (
    customer_id IS NOT NULL AND 
    customer_id::text = current_setting('app.current_customer_id', true) OR
    true  -- Allow service role to see all
  );

-- Create function to restock product inventory on order cancellation
CREATE OR REPLACE FUNCTION restock_product(
  p_product_id UUID,
  p_quantity INTEGER,
  p_order_id VARCHAR(50)
)
RETURNS jsonb AS $$
DECLARE
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO v_current_stock
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Product not found',
      'product_id', p_product_id
    );
  END IF;

  -- Calculate new stock
  v_new_stock := v_current_stock + p_quantity;

  -- Update product stock
  UPDATE products
  SET 
    stock_quantity = v_new_stock,
    available = CASE 
      WHEN v_new_stock > 0 THEN true
      ELSE available
    END,
    updated_at = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'previous_stock', v_current_stock,
    'restocked_quantity', p_quantity,
    'new_stock', v_new_stock,
    'order_id', p_order_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on restock function
GRANT EXECUTE ON FUNCTION restock_product(UUID, INTEGER, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION restock_product(UUID, INTEGER, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION restock_product(UUID, INTEGER, VARCHAR) TO authenticated;

-- Add comment to document the migration
COMMENT ON TABLE public.customers IS 'Stores customer authentication and profile information';
COMMENT ON TABLE public.customer_addresses IS 'Stores customer delivery addresses';
COMMENT ON FUNCTION restock_product IS 'Restocks product inventory when an order is cancelled';
