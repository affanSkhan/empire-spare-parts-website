-- Migration: Fix RLS Policies for Orders and Customers
-- Description: Adds admin access policies for orders, customers, and order_items
-- Created: 2025-12-03

-- =====================================================
-- CUSTOMERS TABLE - Add Admin Access
-- =====================================================

-- Check if customers table has RLS enabled, if not enable it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'customers'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add admin access policy for customers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'customers' 
        AND policyname = 'Admins can manage all customers'
    ) THEN
        CREATE POLICY "Admins can manage all customers" ON customers
          FOR ALL USING (
            auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
          );
    END IF;
END $$;

-- =====================================================
-- ORDERS TABLE - Add Admin Access
-- =====================================================

-- Check if orders table has RLS enabled, if not enable it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'orders'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add admin access policy for orders
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'orders' 
        AND policyname = 'Admins can manage all orders'
    ) THEN
        CREATE POLICY "Admins can manage all orders" ON orders
          FOR ALL USING (
            auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
          );
    END IF;
END $$;

-- =====================================================
-- ORDER_ITEMS TABLE - Add Admin Access
-- =====================================================

-- Check if order_items table has RLS enabled, if not enable it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add admin access policy for order_items
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'order_items' 
        AND policyname = 'Admins can manage all order items'
    ) THEN
        CREATE POLICY "Admins can manage all order items" ON order_items
          FOR ALL USING (
            auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
          );
    END IF;
END $$;

-- =====================================================
-- CART_ITEMS TABLE - Add Admin Access
-- =====================================================

-- Check if cart_items table has RLS enabled, if not enable it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add admin access policy for cart_items
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cart_items' 
        AND policyname = 'Admins can manage all cart items'
    ) THEN
        CREATE POLICY "Admins can manage all cart items" ON cart_items
          FOR ALL USING (
            auth.uid() IN (SELECT user_id FROM user_roles WHERE role IN ('admin', 'staff'))
          );
    END IF;
END $$;

COMMENT ON POLICY "Admins can manage all customers" ON customers IS 'Allows admin and staff users to view and manage all customers';
COMMENT ON POLICY "Admins can manage all orders" ON orders IS 'Allows admin and staff users to view and manage all orders';
COMMENT ON POLICY "Admins can manage all order items" ON order_items IS 'Allows admin and staff users to view and manage all order items';
COMMENT ON POLICY "Admins can manage all cart items" ON cart_items IS 'Allows admin and staff users to view and manage all cart items';
