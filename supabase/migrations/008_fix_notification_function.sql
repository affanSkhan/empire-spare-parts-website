-- Quick fix for notification function - removes user_id column reference
-- Run this in Supabase SQL Editor to fix the "column user_id does not exist" error

CREATE OR REPLACE FUNCTION notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_type VARCHAR(50);
  notification_title VARCHAR(255);
  notification_message TEXT;
BEGIN
  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Determine notification details based on new status
    CASE NEW.status
      WHEN 'pending' THEN
        notification_type := 'info';
        notification_title := 'Order Received';
        notification_message := 'Order #' || NEW.order_number || ' is pending review';
      WHEN 'quotation_sent' THEN
        notification_type := 'info';
        notification_title := 'Quotation Sent';
        notification_message := 'Quotation sent for Order #' || NEW.order_number;
      WHEN 'quote_approved' THEN
        notification_type := 'success';
        notification_title := 'Quote Approved';
        notification_message := 'Customer approved quote for Order #' || NEW.order_number;
      WHEN 'payment_pending' THEN
        notification_type := 'warning';
        notification_title := 'Payment Pending';
        notification_message := 'Payment pending for Order #' || NEW.order_number;
      WHEN 'payment_received' THEN
        notification_type := 'success';
        notification_title := 'Payment Received';
        notification_message := 'Payment confirmed for Order #' || NEW.order_number;
      WHEN 'processing' THEN
        notification_type := 'info';
        notification_title := 'Order Processing';
        notification_message := 'Order #' || NEW.order_number || ' is being processed';
      WHEN 'ready_for_pickup' THEN
        notification_type := 'success';
        notification_title := 'Order Ready';
        notification_message := 'Order #' || NEW.order_number || ' is ready for pickup';
      WHEN 'completed' THEN
        notification_type := 'success';
        notification_title := 'Order Completed';
        notification_message := 'Order #' || NEW.order_number || ' has been completed';
      WHEN 'cancelled' THEN
        notification_type := 'error';
        notification_title := 'Order Cancelled';
        notification_message := 'Order #' || NEW.order_number || ' has been cancelled';
      WHEN 'reviewed' THEN
        notification_type := 'info';
        notification_title := 'Order Reviewed';
        notification_message := 'Order #' || NEW.order_number || ' has been reviewed';
      WHEN 'approved' THEN
        notification_type := 'success';
        notification_title := 'Order Approved';
        notification_message := 'Order #' || NEW.order_number || ' has been approved';
      WHEN 'invoiced' THEN
        notification_type := 'success';
        notification_title := 'Invoice Generated';
        notification_message := 'Invoice generated for Order #' || NEW.order_number;
      ELSE
        notification_type := 'info';
        notification_title := 'Order Status Updated';
        notification_message := 'Order #' || NEW.order_number || ' status changed to ' || NEW.status;
    END CASE;

    -- Insert admin notification (notifications table is admin-only)
    -- Note: Customer notifications would need a separate customer_notifications table
    INSERT INTO notifications (
      title,
      message,
      type,
      category,
      link,
      metadata
    )
    VALUES (
      notification_title,
      notification_message,
      notification_type,
      'order',
      '/admin/orders/' || NEW.id,
      jsonb_build_object(
        'order_id', NEW.id,
        'order_number', NEW.order_number,
        'customer_id', NEW.customer_id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger is properly set up
DROP TRIGGER IF EXISTS trigger_notify_order_status_change ON orders;
CREATE TRIGGER trigger_notify_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_order_status_change();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Notification function updated successfully!';
END $$;
