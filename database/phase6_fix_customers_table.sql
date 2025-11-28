-- Fix customers table - Remove email column
-- Run this in Supabase SQL Editor

-- Drop the email column from customers table
ALTER TABLE customers DROP COLUMN IF EXISTS email;

-- Drop the email index if it exists
DROP INDEX IF EXISTS idx_customers_email;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
