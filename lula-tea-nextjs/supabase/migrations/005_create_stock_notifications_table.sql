-- Create stock_notifications table
CREATE TABLE IF NOT EXISTS stock_notifications (
  id SERIAL PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notify_via TEXT NOT NULL CHECK (notify_via IN ('email', 'whatsapp')),
  language TEXT DEFAULT 'en',
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_stock_notifications_product ON stock_notifications(product_id);
CREATE INDEX idx_stock_notifications_notified ON stock_notifications(notified);
CREATE INDEX idx_stock_notifications_created_at ON stock_notifications(created_at DESC);

-- Add comment to table
COMMENT ON TABLE stock_notifications IS 'Customer notifications for when out-of-stock products become available';
