-- Add city-specific stock columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS riyadh_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS jeddah_stock INTEGER DEFAULT 0;

-- Update existing products to split current stock between cities
-- For now, we'll set each city to half of current stock_quantity
UPDATE products
SET 
  riyadh_stock = FLOOR(stock_quantity / 2),
  jeddah_stock = CEIL(stock_quantity / 2)
WHERE riyadh_stock = 0 AND jeddah_stock = 0;

-- Add city column to orders table to track which city's stock was used
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(50);

-- Add city column to stock_movements table
ALTER TABLE stock_movements
ADD COLUMN IF NOT EXISTS city VARCHAR(50);

-- Create function to deduct city-specific stock
CREATE OR REPLACE FUNCTION deduct_city_product_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_order_id VARCHAR(255),
  p_city VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_movement_id UUID;
BEGIN
  -- Lock the product row for update
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Check if tracking inventory
  IF NOT v_product.track_inventory THEN
    RETURN jsonb_build_object('success', true, 'message', 'Inventory tracking disabled');
  END IF;

  -- Get current stock for the specified city
  IF p_city = 'Riyadh' THEN
    v_current_stock := v_product.riyadh_stock;
  ELSIF p_city = 'Jeddah' THEN
    v_current_stock := v_product.jeddah_stock;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid city. Must be Riyadh or Jeddah');
  END IF;

  -- Calculate new stock
  v_new_stock := v_current_stock - p_quantity;

  -- Check if sufficient stock (unless backorder allowed)
  IF v_new_stock < 0 AND NOT v_product.allow_backorder THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient stock in ' || p_city,
      'city', p_city,
      'available', v_current_stock,
      'requested', p_quantity
    );
  END IF;

  -- Update product stock for the specific city and total stock
  IF p_city = 'Riyadh' THEN
    UPDATE products
    SET 
      riyadh_stock = v_new_stock,
      stock_quantity = riyadh_stock + jeddah_stock,
      available = CASE 
        WHEN (riyadh_stock + jeddah_stock) <= 0 AND NOT allow_backorder THEN false
        ELSE available
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
  ELSIF p_city = 'Jeddah' THEN
    UPDATE products
    SET 
      jeddah_stock = v_new_stock,
      stock_quantity = riyadh_stock + jeddah_stock,
      available = CASE 
        WHEN (riyadh_stock + jeddah_stock) <= 0 AND NOT allow_backorder THEN false
        ELSE available
      END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
  END IF;

  -- Record stock movement
  INSERT INTO stock_movements (
    product_id,
    order_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    city,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_order_id,
    'sale',
    -p_quantity,
    v_current_stock,
    v_new_stock,
    p_city,
    'Stock deducted for order in ' || p_city,
    'system'
  );

  RETURN jsonb_build_object(
    'success', true,
    'city', p_city,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock,
    'quantity_deducted', p_quantity
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to add stock for a specific city
CREATE OR REPLACE FUNCTION add_city_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_city VARCHAR(50),
  p_reason VARCHAR(100),
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
BEGIN
  -- Lock the product row for update
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  -- Check if product exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  -- Get current stock for the specified city
  IF p_city = 'Riyadh' THEN
    v_current_stock := v_product.riyadh_stock;
  ELSIF p_city = 'Jeddah' THEN
    v_current_stock := v_product.jeddah_stock;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid city. Must be Riyadh or Jeddah');
  END IF;

  -- Calculate new stock
  v_new_stock := v_current_stock + p_quantity;

  -- Update product stock for the specific city and total stock
  IF p_city = 'Riyadh' THEN
    UPDATE products
    SET 
      riyadh_stock = v_new_stock,
      stock_quantity = riyadh_stock + jeddah_stock,
      available = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
  ELSIF p_city = 'Jeddah' THEN
    UPDATE products
    SET 
      jeddah_stock = v_new_stock,
      stock_quantity = riyadh_stock + jeddah_stock,
      available = true,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = p_product_id;
  END IF;

  -- Record stock movement
  INSERT INTO stock_movements (
    product_id,
    order_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    city,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    NULL,
    p_reason,
    p_quantity,
    v_current_stock,
    v_new_stock,
    p_city,
    p_notes,
    'admin'
  );

  RETURN jsonb_build_object(
    'success', true,
    'city', p_city,
    'previous_stock', v_current_stock,
    'new_stock', v_new_stock,
    'quantity_added', p_quantity
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing stock_quantity to be sum of city stocks
UPDATE products
SET stock_quantity = riyadh_stock + jeddah_stock;

-- Create index on city stocks for faster queries
CREATE INDEX IF NOT EXISTS idx_products_riyadh_stock ON products(riyadh_stock);
CREATE INDEX IF NOT EXISTS idx_products_jeddah_stock ON products(jeddah_stock);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_city ON orders(delivery_city);
CREATE INDEX IF NOT EXISTS idx_stock_movements_city ON stock_movements(city);
