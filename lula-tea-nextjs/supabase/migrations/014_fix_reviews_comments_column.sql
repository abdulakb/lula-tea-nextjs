-- Ensure all required columns exist in reviews table
-- This fixes missing columns that weren't applied in production

DO $$ 
BEGIN
    -- Add comments column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'comments'
    ) THEN
        ALTER TABLE reviews ADD COLUMN comments TEXT;
    END IF;

    -- Add language column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'language'
    ) THEN
        ALTER TABLE reviews ADD COLUMN language TEXT DEFAULT 'ar';
    END IF;

    -- Add approved column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'approved'
    ) THEN
        ALTER TABLE reviews ADD COLUMN approved BOOLEAN DEFAULT false;
    END IF;

    -- Add featured column if missing
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'featured'
    ) THEN
        ALTER TABLE reviews ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
