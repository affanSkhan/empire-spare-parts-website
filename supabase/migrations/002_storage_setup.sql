-- =====================================================
-- STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor after main migration
-- OR create manually via Supabase Dashboard > Storage
-- =====================================================

-- Create product-images bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create branding bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Allow public read access to product-images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Allow admins to update product images
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
  );

-- Public read access to branding
CREATE POLICY "Public can view branding" ON storage.objects
  FOR SELECT USING (bucket_id = 'branding');

-- Admins can manage branding
CREATE POLICY "Admins can manage branding" ON storage.objects
  FOR ALL USING (
    bucket_id = 'branding' AND
    auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
  );
