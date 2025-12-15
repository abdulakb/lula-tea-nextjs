-- Migration: Add email/password authentication to customers table
-- This extends the existing phone-based OTP authentication

-- Add email and password columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Make email unique when set
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique 
ON customers(email) 
WHERE email IS NOT NULL;

-- Add index for reset token lookups
CREATE INDEX IF NOT EXISTS idx_customers_reset_token 
ON customers(reset_token) 
WHERE reset_token IS NOT NULL;

-- Update existing constraint to allow either phone or email
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS customers_phone_key;

-- Add new constraint: at least one of phone or email must be provided
ALTER TABLE customers 
ADD CONSTRAINT customers_contact_check 
CHECK (phone IS NOT NULL OR email IS NOT NULL);

-- Create unique index for phone when set
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_phone_unique 
ON customers(phone) 
WHERE phone IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN customers.email_verified IS 'Whether the email address has been verified';
COMMENT ON COLUMN customers.password_hash IS 'Bcrypt hash of customer password (for email/password auth)';
COMMENT ON COLUMN customers.reset_token IS 'Token for password reset requests';
COMMENT ON COLUMN customers.reset_token_expires IS 'Expiration timestamp for reset token';
