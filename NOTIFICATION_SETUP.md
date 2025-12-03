# Database Migration Instructions for Notifications System

## ⚠️ IMPORTANT: Apply Fixes in Order

### Step 1: Create Notifications Table (First Time Only)
1. Go to your Supabase project dashboard at https://supabase.com
2. Navigate to **SQL Editor** from the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/create_notifications_table.sql`
5. Click **Run** to execute the migration
6. Verify the table was created by going to **Table Editor** > Look for `notifications` table

### Step 2: Fix Notification Triggers (REQUIRED!)
1. In **SQL Editor**, create another **New Query**
2. Copy and paste the contents of `supabase/migrations/fix_order_notification_triggers.sql`
3. Click **Run** to apply the fix
4. This fixes multiple field errors:
   - ✅ Orders: "customer_name" field error
   - ✅ Invoices: "total_amount" field error

## Quick Apply (Recommended)

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run the SQL file directly
supabase db execute -f supabase/migrations/create_notifications_table.sql
```

## Option 3: Manual SQL Execution

1. Open your Supabase project
2. Go to Settings > Database
3. Copy the connection string
4. Use a SQL client (like pgAdmin, DBeaver, or psql) to connect
5. Execute the SQL from `supabase/migrations/create_notifications_table.sql`

## What This Migration Does

✅ Creates `notifications` table with columns:
   - id, title, message, type, category
   - is_read, link, metadata
   - created_at, updated_at

✅ Creates indexes for performance optimization

✅ Sets up automatic triggers for:
   - New orders → Creates notification
   - Order status changes → Creates notification
   - Low stock alerts (≤ 5 items) → Creates notification
   - New invoices → Creates notification

✅ Creates helper functions for automated notifications

## Verify Installation

After running the migration, check:
1. Table `notifications` exists
2. Test by creating a new order - should automatically create a notification
3. Check admin dashboard - notification bell should appear in top navbar

## Test the System

Create a test notification manually:
```sql
INSERT INTO notifications (title, message, type, category)
VALUES (
  'Test Notification',
  'This is a test notification to verify the system is working',
  'info',
  'general'
);
```

Then refresh the admin dashboard and click the bell icon!
