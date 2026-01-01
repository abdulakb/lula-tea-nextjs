-- Ensure comments column exists in reviews table
-- If it doesn't exist, add it. If it exists with a different name, this will be a no-op

DO $$ 
BEGIN
    -- Check if comments column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'comments'
    ) THEN
        ALTER TABLE reviews ADD COLUMN comments TEXT;
    END IF;
END $$;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
