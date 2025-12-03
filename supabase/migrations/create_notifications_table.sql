-- Create notifications table for admin in-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info', -- info, success, warning, error
  category VARCHAR(50) NOT NULL DEFAULT 'general', -- order, product, invoice, customer, general
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500), -- Optional link to related resource
  metadata JSONB, -- Additional data (e.g., order_id, customer_name, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Create function to automatically create notification on new order
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

-- Create trigger for new orders
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Create function to notify on order status change
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

-- Create trigger for order status changes
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Create function to notify on low stock
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity <= 5 AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > 5) THEN
    INSERT INTO notifications (title, message, type, category, link, metadata)
    VALUES (
      'Low Stock Alert',
      'Product "' || NEW.name || '" is running low on stock (' || NEW.stock_quantity || ' remaining)',
      'warning',
      'product',
      '/admin/products/' || NEW.id || '/edit',
      jsonb_build_object(
        'product_id', NEW.id,
        'product_name', NEW.name,
        'stock_quantity', NEW.stock_quantity
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock notifications
CREATE TRIGGER trigger_notify_low_stock
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_low_stock();

-- Create function to notify on new invoice
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

-- Create trigger for new invoices
CREATE TRIGGER trigger_notify_new_invoice
  AFTER INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_invoice();

COMMENT ON TABLE notifications IS 'Stores in-app notifications for admin users';
COMMENT ON COLUMN notifications.type IS 'Notification type: info, success, warning, error';
COMMENT ON COLUMN notifications.category IS 'Notification category: order, product, invoice, customer, general';
COMMENT ON COLUMN notifications.metadata IS 'Additional JSON data related to the notification';
