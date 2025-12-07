-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  order_id TEXT,
  customer_name TEXT,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  taste_rating INTEGER NOT NULL CHECK (taste_rating >= 1 AND taste_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  delivery_rating INTEGER NOT NULL CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  comments TEXT,
  language TEXT DEFAULT 'ar',
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_reviews_approved ON reviews(approved);
CREATE INDEX idx_reviews_featured ON reviews(featured);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Add comment to table
COMMENT ON TABLE reviews IS 'Customer reviews with interactive star ratings';
