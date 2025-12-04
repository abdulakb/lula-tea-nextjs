-- Add inventory tracking columns if not exists
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT false;

-- Create stock_movements table to track inventory changes
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id VARCHAR(255),
  movement_type VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return'
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order ON stock_movements(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- Enable Row Level Security
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policy for service role full access
CREATE POLICY "Service role has full access to stock_movements"
  ON stock_movements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to deduct stock and record movement
CREATE OR REPLACE FUNCTION deduct_product_stock(
  p_product_id UUID,
  p_quantity INTEGER,
  p_order_id VARCHAR(255)
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
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

  -- Calculate new stock
  v_new_stock := v_product.stock_quantity - p_quantity;

  -- Check if sufficient stock (unless backorder allowed)
  IF v_new_stock < 0 AND NOT v_product.allow_backorder THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient stock',
      'available', v_product.stock_quantity,
      'requested', p_quantity
    );
  END IF;

  -- Update product stock
  UPDATE products
  SET 
    stock_quantity = v_new_stock,
    available = CASE 
      WHEN v_new_stock <= 0 AND NOT allow_backorder THEN false
      ELSE available
    END,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_product_id;

  -- Record stock movement
  INSERT INTO stock_movements (
    product_id,
    order_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_order_id,
    'sale',
    -p_quantity,
    v_product.stock_quantity,
    v_new_stock,
    'Stock deducted for order ' || p_order_id,
    'system'
  ) RETURNING id INTO v_movement_id;

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', v_product.stock_quantity,
    'new_stock', v_new_stock,
    'movement_id', v_movement_id,
    'low_stock_alert', v_new_stock <= v_product.low_stock_threshold
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to restock product
CREATE OR REPLACE FUNCTION restock_product(
  p_product_id UUID,
  p_quantity INTEGER,
  p_notes TEXT DEFAULT NULL,
  p_created_by VARCHAR(100) DEFAULT 'admin'
)
RETURNS JSONB AS $$
DECLARE
  v_product RECORD;
  v_new_stock INTEGER;
BEGIN
  -- Lock the product row for update
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_new_stock := v_product.stock_quantity + p_quantity;

  -- Update product stock
  UPDATE products
  SET 
    stock_quantity = v_new_stock,
    available = true,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_product_id;

  -- Record stock movement
  INSERT INTO stock_movements (
    product_id,
    movement_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    'restock',
    p_quantity,
    v_product.stock_quantity,
    v_new_stock,
    p_notes,
    p_created_by
  );

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', v_product.stock_quantity,
    'new_stock', v_new_stock
  );
END;
$$ LANGUAGE plpgsql;

-- Insert sample product with inventory (Lula Tea Premium Blend)
INSERT INTO products (
  name,
  name_ar,
  description,
  description_ar,
  price,
  stock_quantity,
  low_stock_threshold,
  available,
  category,
  sku,
  track_inventory,
  allow_backorder
) VALUES (
  'Premium Loose Leaf Blend',
  'خلطة أوراق الشاي الفاخرة',
  'Our signature blend of premium loose leaf tea. Each pack contains 100g of carefully selected tea leaves.',
  'خلطتنا المميزة من أوراق الشاي الفاخرة. كل عبوة تحتوي على 100 جرام من أوراق الشاي المنتقاة بعناية.',
  60.00,
  100,
  20,
  true,
  'Tea',
  'LULA-TEA-001',
  true,
  false
) ON CONFLICT (sku) DO UPDATE SET
  stock_quantity = EXCLUDED.stock_quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  track_inventory = EXCLUDED.track_inventory;
