-- Run this script in Supabase SQL Editor to diagnose notification issues

-- 1. Check if trigger function exists
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname = 'notify_new_order';

-- 2. Check if trigger is attached to orders table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname LIKE '%notification%' OR tgname LIKE '%notify%';

-- 3. Check if notifications table is in realtime publication
SELECT 
  schemaname, 
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename IN ('notifications', 'orders');

-- 4. Get recent notifications
SELECT 
  id,
  title,
  message,
  recipient_type,
  recipient_id,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;

-- 5. Get recent orders
SELECT 
  id,
  order_number,
  customer_id,
  status,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 6. Check push subscriptions
SELECT COUNT(*) as total_subscriptions
FROM push_subscriptions;

-- 7. Check admin users with subscriptions
SELECT 
  ur.user_id,
  ur.role,
  COUNT(ps.id) as subscription_count
FROM user_roles ur
LEFT JOIN push_subscriptions ps ON ur.user_id = ps.user_id
WHERE ur.role IN ('admin', 'staff')
GROUP BY ur.user_id, ur.role;

-- If trigger is missing, recreate it:
-- DROP TRIGGER IF EXISTS order_notification_trigger ON orders;
-- CREATE TRIGGER order_notification_trigger
--   AFTER INSERT ON orders
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_new_order();

-- If notifications table is not in realtime, add it:
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
