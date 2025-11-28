-- Add price field to products table
-- This price will be used as default when generating invoices
-- Price is not shown on customer website

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;

-- Add index for price queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Update comment
COMMENT ON COLUMN products.price IS 'Default price for product, used when generating invoices. Not displayed on customer website.';
