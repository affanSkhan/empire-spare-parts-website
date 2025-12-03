# Fix: Unable to Place Order Issue

## Problem
Customer orders were failing with error:
```
Failed to load resource: the server responded with a status of 400
Error placing order: Object
```

## Root Cause
The Supabase `.insert()` was passing an array `[{...}]` instead of an object `{...}`, causing incorrect query formatting.

## Solution Applied

### 1. Fixed cart.jsx Insert Statement

**Before:**
```javascript
const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .insert([{
    order_number: orderNumber,
    customer_id: customer.id,
    status: 'pending',
  }])
  .select()
  .single()
```

**After:**
```javascript
const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .insert({
    order_number: orderNumber,
    customer_id: customer.id,
    status: 'pending',
  })
  .select('*')
  .single()
```

### 2. Improved Error Handling
Added better error messages to help debug future issues.

## How to Test

1. **Login as customer**
   - Go to http://localhost:3000/customer/login
   - Login with your test account

2. **Add items to cart**
   - Browse products
   - Add items to cart

3. **Place order**
   - Go to cart
   - Click "Place Order"
   - Should redirect to order details page

4. **Verify in database**
   ```sql
   -- Check orders were created
   SELECT * FROM orders ORDER BY created_at DESC LIMIT 5;
   
   -- Check order items
   SELECT * FROM order_items ORDER BY created_at DESC LIMIT 10;
   ```

## Database Requirements

Make sure these migrations are applied:

### 1. Orders System
Run: `database/phase6_orders_system.sql`

### 2. RLS Policies (CRITICAL!)
Run: `database/phase6_fix_rls_policies.sql`

This fixes Row Level Security policies to allow:
- ✅ Customers can insert orders
- ✅ Customers can insert order_items
- ✅ Customers can view their orders
- ✅ Cart operations work properly

## Verify Database Setup

Run these queries in Supabase SQL Editor:

```sql
-- 1. Check orders table exists
SELECT * FROM orders LIMIT 1;

-- 2. Check RLS policies for orders
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items', 'cart_items')
ORDER BY tablename;

-- 3. Test order creation (as admin)
INSERT INTO orders (order_number, customer_id, status)
VALUES ('TEST-001', (SELECT id FROM customers LIMIT 1), 'pending')
RETURNING *;

-- 4. Clean up test order
DELETE FROM orders WHERE order_number = 'TEST-001';
```

Expected policies:
- orders: "Allow all order reads", "Allow order creation", "Allow order updates"
- order_items: "Allow all order_items reads", "Allow order_items creation"
- cart_items: "Allow all cart operations"

## Common Issues

### Issue: Still getting 400 error
**Solution:** Clear browser cache and restart dev server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Permission denied
**Solution:** Apply RLS policy fix
```sql
-- Run this in Supabase SQL Editor
-- Copy from: database/phase6_fix_rls_policies.sql
```

### Issue: Order number duplicate
**Solution:** Orders table should auto-generate unique order numbers
```sql
-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'generate_order_number';
```

## Notification Integration

Once orders work, notifications will automatically trigger:
- ✅ New order notification created
- ✅ Admin sees bell icon badge
- ✅ Notification links to order details

## Additional Fix Required: Notification Triggers

### Error: "record 'new' has no field 'customer_name'"

If you see this error after fixing the insert statement, it's because the notification triggers are trying to access fields that don't exist in the orders table.

**Solution:** Apply the notification trigger fix

1. Go to Supabase Dashboard → SQL Editor
2. Run the file: `supabase/migrations/fix_order_notification_triggers.sql`
3. This will update the triggers to properly JOIN with the customers table

**What it fixes:**
- `notify_new_order()` - Gets customer name from customers table via JOIN
- `notify_order_status_change()` - Gets customer name from customers table via JOIN
- Uses `NEW.order_number` instead of `NEW.id::TEXT` for better readability

## Status: ✅ FIXED

After applying both fixes:
1. ✅ Corrected insert syntax in cart.jsx
2. ✅ Fixed notification triggers in database

The order placement should now work correctly!
