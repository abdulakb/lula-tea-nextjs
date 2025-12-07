-- Set actual inventory for Lula Tea Premium Blend
-- Starting inventory: 20 bags
-- Sold to Rawan: 2 bags
-- Sold to Abdullah: 3 bags
-- Promotional distribution: 10 bags (6 given + 4 expected)
-- Subtotal after initial sales: 5 bags
-- New stock received: 41 bags
-- Final available stock: 46 bags

-- Step 1: Find the product ID for "Premium Loose Leaf Blend"
DO $$
DECLARE
  v_product_id UUID;
  v_current_stock INTEGER;
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

  -- Step 3: Record sale to Rawan (2 bags)
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
      20,
      18,
      'Stock deducted for order LT1764855293254 (Rawan)',
      'system'
    );

    UPDATE products SET stock_quantity = 18 WHERE id = v_product_id;
    RAISE NOTICE 'Recorded sale to Rawan: 2 bags (Stock: 18)';
  ELSE
    UPDATE products SET stock_quantity = 18 WHERE id = v_product_id;
    RAISE NOTICE 'Sale to Rawan already recorded';
  END IF;

  -- Step 4: Record sale to Abdullah (3 bags)
  IF NOT EXISTS (
    SELECT 1 FROM stock_movements 
    WHERE order_id = 'LT1764769936825'
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
      'LT1764769936825',
      'sale',
      -3,
      18,
      15,
      'Stock deducted for order LT1764769936825 (Abdullah)',
      'system'
    );

    UPDATE products SET stock_quantity = 15 WHERE id = v_product_id;
    RAISE NOTICE 'Recorded sale to Abdullah: 3 bags (Stock: 15)';
  ELSE
    UPDATE products SET stock_quantity = 15 WHERE id = v_product_id;
    RAISE NOTICE 'Sale to Abdullah already recorded';
  END IF;

  -- Step 5: Record promotional distribution (10 bags: 6 given + 4 expected)
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
    15,
    5,
    'Promotional distribution - 10 bags (6 distributed + 4 reserved for promotion)',
    'admin'
  );

  UPDATE products SET stock_quantity = 5 WHERE id = v_product_id;
  RAISE NOTICE 'Recorded promotional distribution: 10 bags (Stock: 5)';

  -- Step 6: Add new inventory (41 bags)
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
    'RESTOCK-' || TO_CHAR(NOW(), 'YYYYMMDD'),
    'restock',
    41,
    5,
    46,
    'New inventory received - 41 bags added to stock',
    'admin'
  );

  UPDATE products SET stock_quantity = 46 WHERE id = v_product_id;
  RAISE NOTICE 'Added new inventory: 41 bags (Final Stock: 46)';

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
