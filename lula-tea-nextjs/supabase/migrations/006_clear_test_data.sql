-- Clear all test orders and related data
-- Run this migration to clean up test data before going live

-- Delete all order notes (foreign key constraint requires this first)
DELETE FROM order_notes;

-- Delete all orders
DELETE FROM orders;

-- Delete all analytics events
DELETE FROM analytics;

-- Reset sequences if needed (optional)
-- This ensures new orders start from a clean slate

-- Add a comment to track when data was cleared
COMMENT ON TABLE orders IS 'Test data cleared on 2025-12-04. Production ready.';
COMMENT ON TABLE analytics IS 'Test data cleared on 2025-12-04. Production ready.';
COMMENT ON TABLE order_notes IS 'Test data cleared on 2025-12-04. Production ready.';
