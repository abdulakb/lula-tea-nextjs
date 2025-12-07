-- Restore deleted order LT1764769936825
-- Customer: Abdullah Alamoudi
-- 3 bags @ 60 SAR each = 180 SAR
-- Payment: Cash on Delivery
-- NOTE: Stock already deducted in migration 009, this just adds the order record

DO $$
DECLARE
  v_product_id UUID;
BEGIN
  -- Get product ID
  SELECT id INTO v_product_id
  FROM products
  WHERE sku = 'LULA-TEA-001';

  IF v_product_id IS NULL THEN
    RAISE EXCEPTION 'Product with SKU LULA-TEA-001 not found';
  END IF;

  -- Check if order already exists
  IF EXISTS (SELECT 1 FROM orders WHERE order_id = 'LT1764769936825') THEN
    RAISE NOTICE 'Order LT1764769936825 already exists, skipping restoration';
  ELSE
    -- Restore the order (stock already deducted in migration 009)
    INSERT INTO orders (
      order_id,
      customer_name,
      customer_phone,
      customer_address,
      delivery_notes,
      items,
      subtotal,
      delivery_fee,
      total,
      payment_method,
      status,
      created_at
    ) VALUES (
      'LT1764769936825',
      'Abdullah Alamoudi',
      '0500003055',
      'StreetNameAl-Qataar, Al Nada District, 11652',
      'Preferred time: Evening (4 PM - 8 PM). GPS: 24.812050, 46.682392. Email: a.alamoudi1@gmail.com',
      '[{"id":"lula-tea","name":"Premium Loose Leaf Blend","nameAr":"مزيج أوراق الشاي المميز","price":60,"quantity":3,"image":"/images/Product Image2.jpg"}]'::jsonb,
      180.00,
      0,
      180.00,
      'cod',
      'processing',
      '2025-12-04T00:00:00Z'::timestamp
    );

    RAISE NOTICE 'Order LT1764769936825 restored successfully (stock already deducted)';
  END IF;

END $$;

-- Verify the restored order
SELECT 
  order_id as "Order ID",
  customer_name as "Customer",
  customer_phone as "Phone",
  total as "Total (SAR)",
  payment_method as "Payment",
  status as "Status",
  created_at as "Created"
FROM orders
WHERE order_id = 'LT1764769936825';
