-- Fix notification triggers for orders table
-- Run this in Supabase SQL Editor to fix the "customer_name" field error

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;

-- Drop existing functions
DROP FUNCTION IF EXISTS notify_new_order();
DROP FUNCTION IF EXISTS notify_order_status_change();

-- Recreate function to notify on new order (FIXED)
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  customer_name_var VARCHAR(255);
BEGIN
  -- Get customer name from customers table
  SELECT name INTO customer_name_var
  FROM customers
  WHERE id = NEW.customer_id;

  INSERT INTO notifications (title, message, type, category, link, metadata)
  VALUES (
    'New Order Received',
    'Order #' || NEW.order_number || ' has been placed' || 
    CASE WHEN customer_name_var IS NOT NULL THEN ' by ' || customer_name_var ELSE '' END,
    'info',
    'order',
    '/admin/orders/' || NEW.id,
    jsonb_build_object(
      'order_id', NEW.id,
      'order_number', NEW.order_number,
      'customer_id', NEW.customer_id,
      'customer_name', customer_name_var,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for new orders
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Recreate function to notify on order status change (FIXED)
CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  customer_name_var VARCHAR(255);
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Get customer name from customers table
    SELECT name INTO customer_name_var
    FROM customers
    WHERE id = NEW.customer_id;

    INSERT INTO notifications (title, message, type, category, link, metadata)
    VALUES (
      'Order Status Updated',
      'Order #' || NEW.order_number || ' status changed from ' || OLD.status || ' to ' || NEW.status,
      CASE 
        WHEN NEW.status = 'invoiced' THEN 'success'
        WHEN NEW.status = 'approved' THEN 'info'
        ELSE 'info'
      END,
      'order',
      '/admin/orders/' || NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'customer_id', NEW.customer_id,
        'customer_name', customer_name_var,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for order status changes
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Fix invoice notification trigger (total_amount -> total)
DROP TRIGGER IF EXISTS trigger_notify_new_invoice ON invoices;
DROP FUNCTION IF EXISTS notify_new_invoice();

CREATE OR REPLACE FUNCTION notify_new_invoice()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (title, message, type, category, link, metadata)
  VALUES (
    'New Invoice Created',
    'Invoice #' || NEW.invoice_number || ' has been created' ||
    CASE WHEN NEW.customer_name IS NOT NULL THEN ' for ' || NEW.customer_name ELSE '' END,
    'success',
    'invoice',
    '/admin/invoices/' || NEW.id,
    jsonb_build_object(
      'invoice_id', NEW.id,
      'invoice_number', NEW.invoice_number,
      'customer_name', NEW.customer_name,
      'total', NEW.total
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_invoice
  AFTER INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_invoice();

-- Test the fix by checking if functions exist
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_name IN ('notify_new_order', 'notify_order_status_change', 'notify_new_invoice')
  AND routine_schema = 'public';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Notification triggers fixed successfully!';
  RAISE NOTICE 'Order and invoice notifications are now working.';
END $$;
