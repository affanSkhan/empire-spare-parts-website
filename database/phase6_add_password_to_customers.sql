-- Add password column to customers table for simplified auth
-- Run this in Supabase SQL Editor

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Make user_id nullable since we're not using Supabase Auth
ALTER TABLE customers 
ALTER COLUMN user_id DROP NOT NULL;

-- Add unique constraint on phone
ALTER TABLE customers 
DROP CONSTRAINT IF EXISTS customers_phone_key;

ALTER TABLE customers 
ADD CONSTRAINT customers_phone_key UNIQUE (phone);
