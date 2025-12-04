-- Set actual inventory for Lula Tea Premium Blend
-- Starting inventory: 20 bags
-- Promotional distribution: 10 bags
-- Sold to Rawan: 2 bags
-- Current stock should be: 8 bags

-- Step 1: Find the product ID for "Premium Loose Leaf Blend"
DO $$
DECLARE
  v_product_id UUID;
BEGIN
  -- Get the product ID
  SELECT id INTO v_product_id
  FROM products
  WHERE sku = 'LULA-TEA-001';

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Product with SKU LULA-TEA-001 not found';
  END IF;

  -- Step 2: Set initial stock to 20 bags
  UPDATE products
  SET stock_quantity = 20,
      low_stock_threshold = 5,
      available = true
  WHERE id = v_product_id;

  RAISE NOTICE 'Product stock set to 20 bags';

  -- Step 3: Record promotional distribution (10 bags)
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
    v_product_id,
    'PROMO-2024-12',
    'adjustment',
    -10,
    20,
    10,
    'Promotional distribution - 10 bags given away for marketing campaign',
    'admin'
  );

  RAISE NOTICE 'Recorded promotional distribution: 10 bags';

  -- Step 4: Update stock after promotion
  UPDATE products
  SET stock_quantity = 10
  WHERE id = v_product_id;

  -- Step 5: Record sale to Rawan (2 bags) - if not already recorded
  -- Check if this order already has a stock movement
  IF NOT EXISTS (
    SELECT 1 FROM stock_movements 
    WHERE order_id = 'LT1764855293254'
  ) THEN
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
      v_product_id,
      'LT1764855293254',
      'sale',
      -2,
      10,
      8,
      'Stock deducted for order LT1764855293254 (Rawan)',
      'system'
    );

    RAISE NOTICE 'Recorded sale to Rawan: 2 bags';

    -- Update final stock
    UPDATE products
    SET stock_quantity = 8
    WHERE id = v_product_id;

    RAISE NOTICE 'Final stock: 8 bags';
  ELSE
    RAISE NOTICE 'Sale to Rawan already recorded, skipping';
    
    -- Just make sure stock is correct
    UPDATE products
    SET stock_quantity = 8
    WHERE id = v_product_id;
  END IF;

END $$;

-- Verify the results
SELECT 
  name,
  stock_quantity as "Current Stock",
  low_stock_threshold as "Low Stock Alert At",
  available as "Available for Sale"
FROM products
WHERE sku = 'LULA-TEA-001';

-- Show stock movement history
SELECT 
  movement_type as "Type",
  quantity as "Quantity Change",
  previous_stock as "Before",
  new_stock as "After",
  order_id as "Order/Reference",
  notes as "Notes",
  created_at as "Date",
  created_by as "By"
FROM stock_movements
WHERE product_id = (SELECT id FROM products WHERE sku = 'LULA-TEA-001')
ORDER BY created_at DESC;
