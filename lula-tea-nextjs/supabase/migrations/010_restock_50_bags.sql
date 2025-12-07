-- Restock 50 bags to Lula Tea inventory
-- Current stock: 8 bags
-- Adding: 50 bags
-- New total: 58 bags

DO $$
DECLARE
  v_product_id UUID;
  v_current_stock INTEGER;
BEGIN
  -- Get the product ID and current stock
  SELECT id, stock_quantity INTO v_product_id, v_current_stock
  FROM products
  WHERE sku = 'LULA-TEA-001';

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Product with SKU LULA-TEA-001 not found';
  END IF;

  RAISE NOTICE 'Current stock: % bags', v_current_stock;

  -- Record the restock in stock_movements
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
    50,
    v_current_stock,
    v_current_stock + 50,
    'Inventory restock - Added 50 bags to inventory',
    'admin'
  );

  RAISE NOTICE 'Recorded restock: +50 bags';

  -- Update product stock
  UPDATE products
  SET stock_quantity = v_current_stock + 50,
      available = true
  WHERE id = v_product_id;

  RAISE NOTICE 'New stock: % bags', v_current_stock + 50;

END $$;

-- Verify the results
SELECT 
  name,
  stock_quantity as "Current Stock",
  low_stock_threshold as "Low Stock Alert At",
  available as "Available for Sale"
FROM products
WHERE sku = 'LULA-TEA-001';

-- Show recent stock movement history
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
ORDER BY created_at DESC
LIMIT 10;
