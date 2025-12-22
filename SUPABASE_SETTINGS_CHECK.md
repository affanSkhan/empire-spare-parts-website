# Supabase Settings Configuration for Push Notifications

## ✅ Required Supabase Settings

After running the migrations, verify/configure these settings in your Supabase dashboard:

### 1. **Realtime Settings** (CRITICAL for notifications)

**Go to:** Supabase Dashboard → Database → Replication

1. Click on **"supabase_realtime"** publication
2. Ensure the **"notifications"** table is listed
3. If not listed, add it:
   - Run this SQL in SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ALTER TABLE notifications REPLICA IDENTITY FULL;
   ```

### 2. **API Settings**

**Go to:** Supabase Dashboard → Settings → API

Verify you have these keys (should already be in your `.env.local`):

- ✅ **Project URL**: `https://tjitbybznlpdiqbbgqif.supabase.co`
- ✅ **anon/public key**: Already in your `.env.local`
- ✅ **service_role key**: Already in your `.env.local` (NEVER expose this publicly)

**No changes needed** - just verify they match your `.env.local` file.

### 3. **Authentication Settings**

**Go to:** Supabase Dashboard → Authentication → Providers

**No changes needed** - Email provider should already be enabled.

### 4. **Database Replication Check**

Run this query in **SQL Editor** to verify realtime is properly configured:

```sql
-- Check if notifications table is in realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'notifications';
```

**Expected Result:** Should return 1 row showing `notifications` table.

If it returns **empty**, run:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### 5. **Table Permissions Check**

Run this to verify RLS policies are active:

```sql
-- Check notifications table RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('notifications', 'push_subscriptions');
```

**Expected Result:** Both tables should show `rowsecurity = true`

### 6. **Verify Triggers are Active**

Run this to check order notification triggers:

```sql
-- List all triggers on orders table
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname LIKE '%notify%';
```

**Expected Result:** Should show triggers for:
- `notify_new_order_trigger`
- `notify_order_status_change_trigger`

If missing, the triggers from migration 010 need to be run.

## 🔧 Quick Verification Script

Run this **complete check** in Supabase SQL Editor:

```sql
-- COMPLETE VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor

-- 1. Check Realtime Publication
SELECT 'Realtime Check:' as check_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_publication_tables 
         WHERE pubname = 'supabase_realtime' 
         AND tablename = 'notifications'
       ) THEN '✅ Notifications in realtime' 
       ELSE '❌ Notifications NOT in realtime' 
       END as status;

-- 2. Check RLS is enabled
SELECT 'RLS Check:' as check_type,
       tablename,
       CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as status
FROM pg_tables 
WHERE tablename IN ('notifications', 'push_subscriptions');

-- 3. Check notification triggers
SELECT 'Trigger Check:' as check_type,
       tgname as trigger_name,
       CASE WHEN tgenabled = 'O' THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM pg_trigger 
WHERE tgrelid = 'orders'::regclass 
AND tgname LIKE '%notify%';

-- 4. Check tables exist
SELECT 'Table Check:' as check_type,
       tablename,
       '✅ Exists' as status
FROM information_schema.tables 
WHERE table_name IN ('notifications', 'push_subscriptions', 'orders', 'customers');

-- 5. Check new columns exist
SELECT 'Column Check:' as check_type,
       column_name,
       '✅ Exists' as status
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND column_name IN ('recipient_type', 'recipient_id');
```

**Expected Results:**
- ✅ Notifications in realtime
- ✅ RLS Enabled on both tables
- ✅ All triggers active
- ✅ All tables exist
- ✅ New columns exist

## ❌ Common Issues & Fixes

### Issue: "Notifications not in realtime"
**Fix:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

### Issue: "No triggers found"
**Fix:** Re-run migration `010_add_notification_recipients.sql`

### Issue: "Columns recipient_type not found"
**Fix:** Re-run migration `010_add_notification_recipients.sql`

### Issue: "push_subscriptions table does not exist"
**Fix:** Run migration `011_create_push_subscriptions.sql`

## 🎯 Production Checklist

After verifying all settings:

- [ ] Realtime enabled for notifications table
- [ ] RLS enabled on notifications and push_subscriptions
- [ ] All triggers active on orders table
- [ ] recipient_type and recipient_id columns exist
- [ ] push_subscriptions table exists
- [ ] Environment variables added to Vercel
- [ ] Application redeployed

## 🚀 Test Everything Works

1. **Login as admin** on the deployed site
2. **Open browser console**, should see:
   - "Service Worker registered successfully"
   - "Successfully subscribed to push notifications"
3. **Check subscription** in console:
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscription:', sub ? '✅ Active' : '❌ None')
     })
   })
   ```
4. **Test push notification:**
   ```javascript
   fetch('/api/push/test', { method: 'POST' })
     .then(r => r.json())
     .then(d => console.log(d))
   ```
5. **Close PWA** and create a test order
6. **Should receive notification** with sound!

## 📝 Summary

**Most critical setting:** Ensure notifications table is in the `supabase_realtime` publication. Everything else should be configured by the migrations.
