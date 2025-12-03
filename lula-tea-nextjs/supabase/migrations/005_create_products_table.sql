-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  description TEXT,
  description_ar TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  category VARCHAR(100),
  sku VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on SKU for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Create index on available status
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view available products"
  ON products FOR SELECT
  TO public
  USING (available = true);

-- Create policy for service role full access (for admin)
CREATE POLICY "Service role has full access to products"
  ON products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Insert sample products (adjust to your actual products)
INSERT INTO products (name, name_ar, description, description_ar, price, stock_quantity, category, sku, available)
VALUES
  ('Premium Green Tea', 'شاي أخضر فاخر', 'High-quality green tea from the finest gardens', 'شاي أخضر عالي الجودة من أفضل الحدائق', 45.00, 100, 'Green Tea', 'TEA-GREEN-001', true),
  ('Black Tea Classic', 'شاي أسود كلاسيكي', 'Rich and bold black tea blend', 'مزيج شاي أسود غني وجريء', 40.00, 150, 'Black Tea', 'TEA-BLACK-001', true),
  ('Herbal Mint Tea', 'شاي النعناع العشبي', 'Refreshing mint tea blend', 'مزيج شاي النعناع المنعش', 35.00, 80, 'Herbal Tea', 'TEA-HERB-001', true),
  ('Earl Grey Premium', 'إيرل جراي فاخر', 'Classic Earl Grey with bergamot', 'إيرل جراي كلاسيكي مع البرغموت', 50.00, 60, 'Black Tea', 'TEA-EARL-001', true),
  ('Jasmine White Tea', 'شاي الياسمين الأبيض', 'Delicate white tea with jasmine flowers', 'شاي أبيض رقيق مع زهور الياسمين', 55.00, 45, 'White Tea', 'TEA-WHITE-001', true)
ON CONFLICT (sku) DO NOTHING;
