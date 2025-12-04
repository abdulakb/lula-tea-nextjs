-- Add transaction_reference column to orders table for STC Pay verification
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);

-- Create index for faster transaction reference lookups
CREATE INDEX IF NOT EXISTS idx_orders_transaction_reference ON orders(transaction_reference);

-- Add comment explaining the column
COMMENT ON COLUMN orders.transaction_reference IS 'Transaction reference number from bank SMS for STC Pay orders. Used to verify payment completion.';
