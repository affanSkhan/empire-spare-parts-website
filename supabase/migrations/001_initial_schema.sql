-- =====================================================
-- EMPIRE SPARE PARTS - DATABASE SCHEMA
-- Phase 1: Core Tables Migration
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: categories
-- Stores product categories (e.g., Brakes, Filters, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- =====================================================
-- TABLE: products
-- Stores spare parts information
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  car_model TEXT,
  brand TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- =====================================================
-- TABLE: product_images
-- Stores product image URLs from Supabase Storage
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster product image lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- =====================================================
-- TABLE: invoices
-- Stores invoice headers
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subtotal NUMERIC(10, 2),
  tax_percent NUMERIC(5, 2),
  tax_amount NUMERIC(10, 2),
  total NUMERIC(10, 2),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster invoice number lookups
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date DESC);

-- =====================================================
-- TABLE: invoice_items
-- Stores line items for each invoice
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  line_total NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster invoice item lookups
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- =====================================================
-- TABLE: user_roles
-- Stores user role information (admin/staff)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'staff')) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Public read access to categories (for public catalogue)
CREATE POLICY "Public can view categories" ON categories
  FOR SELECT USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Public read access to active products (for public catalogue)
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Public read access to product images
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

-- Admins can manage product images
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Only admins can view/manage invoices
CREATE POLICY "Admins can manage invoices" ON invoices
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Only admins can view/manage invoice items
CREATE POLICY "Admins can manage invoice items" ON invoice_items
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Only admins can view user roles
CREATE POLICY "Admins can view user roles" ON user_roles
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
  ('Engine Parts', 'engine-parts'),
  ('Brake System', 'brake-system'),
  ('Suspension', 'suspension'),
  ('Electrical', 'electrical'),
  ('Filters', 'filters')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                          LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Trigger to auto-generate invoice numbers
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
-- Migration completed successfully!
-- Next steps:
-- 1. Set up Storage buckets (see setup instructions)
-- 2. Create your first admin user
-- 3. Add the user to user_roles table
-- =====================================================
