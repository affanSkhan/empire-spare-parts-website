# 🔔 Notification System - Critical Fixes Applied

## Problems Identified & Fixed

### 1. ❌ **NotificationBell Not Filtering Admin Notifications**
**Problem:** The `NotificationBell.jsx` component was subscribing to ALL notifications in the database, including customer notifications.

**Fix Applied:**
- Added `filter: 'recipient_type=eq.admin'` to real-time subscription
- Changed channel name from `'notifications'` to `'admin-notifications'`
- Added console logging for debugging
- Now only admin notifications appear in the admin bell

### 2. ❌ **API Endpoint Not Filtering by Recipient Type**
**Problem:** The `/api/notifications` endpoint was returning ALL notifications regardless of recipient_type.

**Fix Applied:**
- Added `recipientType` query parameter (defaults to 'admin')
- Added `.eq('recipient_type', recipientType)` filter to both queries
- Unread count now properly filters by recipient type

### 3. ❌ **Missing gcm_sender_id for Push Notifications**
**Problem:** Chrome/Android requires `gcm_sender_id` in manifest.json for push notifications to work.

**Fix Applied:**
- Added `"gcm_sender_id": "103953800507"` to both manifest files
- This is a standard value required for Chrome push notifications

### 4. ✅ **Push Notification System (Already Fixed)**
- Service Worker properly configured with push event handler
- VAPID keys configured
- RLS bypass using admin client in send.js
- Subscription persistence working

---

## How the System Works Now

### Real-Time In-App Notifications
1. **Order Created** → Database trigger creates TWO notifications:
   - One with `recipient_type='admin'` for admins
   - One with `recipient_type='customer'` for the specific customer

2. **Supabase Real-time** broadcasts the INSERT event

3. **Admin Dashboard** (NotificationBell.jsx):
   - Subscribes to: `filter: 'recipient_type=eq.admin'`
   - Only receives admin notifications
   - Updates bell icon and count instantly

4. **Customer Dashboard** (CustomerNotificationBell.jsx):
   - Subscribes to: `filter: 'recipient_type=eq.customer,recipient_id=eq.{customerId}'`
   - Only receives their own notifications
   - Updates bell icon and count instantly

### Push Notifications (Background/Closed App)
1. **Notification Created** → Triggers also call `/api/push/send`

2. **Push API** (`/api/push/send.js`):
   - Uses `supabaseAdmin` to bypass RLS
   - Queries `push_subscriptions` table for admin users
   - Sends push notification via web-push library
   - Uses VAPID authentication

3. **Service Worker** (`/sw.js`):
   - Receives push event even when app is closed
   - Displays notification with sound and vibration
   - Handles click to open/focus the app

---

## Database Requirements

### Required Tables
1. **notifications** - With `recipient_type` and `recipient_id` columns
2. **push_subscriptions** - Stores push subscription endpoints
3. **user_roles** - Links users to admin/staff roles
4. **customers** - Links customers to auth users

### Required Migrations
✅ Run these in Supabase SQL Editor (in order):

```sql
-- 1. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- 2. Add recipient columns (010_add_notification_recipients.sql)
-- Already in your migrations folder - run this

-- 3. Create push_subscriptions table (011_create_push_subscriptions.sql)
-- Already in your migrations folder - run this
```

### Verify Realtime is Working
```sql
-- Check if notifications is in realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'notifications';
```
**Expected:** Should return 1 row

---

## Environment Variables Required

### Development (.env.local) ✅
Already configured in your file

### Production (Vercel) ⚠️
Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tjitbybznlpdiqbbgqif.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXRieWJ6bmxwZGlxYmJncWlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODEsImV4cCI6MjA3OTM3NTM4MX0.Hj36IYLAB5PwZlad8leBfreh9TQqpwNnm3yBJvJBqjI
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqaXRieWJ6bmxwZGlxYmJncWlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzc5OTM4MSwiZXhwIjoyMDc5Mzc1MzgxfQ.lmjAoldAKoYqhxieHJotYjth9RJutd6jXX-46d643M4

VAPID_PUBLIC_KEY=BFmMdml3WjSsDXSkRVVcsrFhN6KddpJlrWv7defo9l9WsIKIKVbUWaPZ_DD5os2XVocco7xpysdi44zfDD0D6gk
VAPID_PRIVATE_KEY=Ch4DFwUBJFDJ8OCh-FF8a0g-MtY_Z9iNTjE4f_CxwEk
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFmMdml3WjSsDXSkRVVcsrFhN6KddpJlrWv7defo9l9WsIKIKVbUWaPZ_DD5os2XVocco7xpysdi44zfDD0D6gk
```

---

## Testing Checklist

### ✅ Local Testing

#### 1. Test Real-Time In-App Notifications
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Open browser console
# Visit http://localhost:3000/admin
```

In Browser Console:
```javascript
// Check subscription status
const channel = supabase.channel('test');
console.log('Supabase client:', channel);

// Manually create a test admin notification
fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Notification',
    message: 'This is a test',
    type: 'info',
    category: 'test',
    recipient_type: 'admin',
    recipient_id: null
  })
})
```

**Expected Result:** Notification bell updates immediately without refresh

#### 2. Test Push Notifications (Requires HTTPS or localhost)
```bash
# 1. Visit http://localhost:3000/admin/notifications
# 2. Toggle "Enable Notifications" ON
# 3. Grant permission when prompted
# 4. Click "Test Notification" button

# Expected: Should see notification even with browser minimized
```

#### 3. Test Background Push (Most Important)
```bash
# 1. Enable notifications in admin dashboard
# 2. Close browser completely
# 3. Open another browser/device
# 4. Visit /admin/push-test page
# 5. Click "Direct Send" button

# Expected: First device receives notification even though app was closed!
```

### ✅ Production Testing

#### 1. Verify Environment Variables
```bash
# Visit: https://your-domain.com/admin/diagnostics
# All checks should show green ✓
```

#### 2. Verify Database Migrations
```sql
-- In Supabase SQL Editor, run:
SELECT 'Table Check:' as check_type,
       tablename,
       '✅ Exists' as status
FROM information_schema.tables 
WHERE table_name IN ('notifications', 'push_subscriptions', 'orders', 'customers');

-- Should return 4 rows
```

#### 3. Test Real-Time
```bash
# 1. Login as admin
# 2. Open browser console
# 3. Create a test order from another device
# 4. Check if notification appears instantly
```

#### 4. Test Push in Background
```bash
# 1. Install PWA on mobile device
# 2. Enable notifications in settings
# 3. Close PWA completely
# 4. Create test order from computer
# 5. Mobile should receive push notification with sound
```

---

## Troubleshooting

### Issue: "No notifications appearing in real-time"
**Check:**
1. Run realtime verification query in Supabase
2. Check browser console for subscription status
3. Verify `recipient_type='admin'` in database notifications

**Fix:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER TABLE notifications REPLICA IDENTITY FULL;
```

### Issue: "Push toggle keeps disabling"
**Check:**
1. Verify VAPID keys in Vercel environment variables
2. Check browser console for errors
3. Visit `/admin/diagnostics` to verify configuration

**Fix:** Redeploy after adding environment variables

### Issue: "Push notifications not appearing in background"
**Check:**
1. Service worker registered? (Check console)
2. Notification permission granted? (Check browser settings)
3. Subscription exists in database? (Check `push_subscriptions` table)
4. VAPID keys match between frontend and backend?

**Fix:** 
```javascript
// Test in console:
navigator.serviceWorker.getRegistration().then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub ? 'Active' : 'None');
  });
});
```

### Issue: "Getting customer notifications in admin bell"
**Check:**
```sql
-- Verify notifications have correct recipient_type
SELECT id, title, recipient_type, recipient_id, created_at 
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

**Fix:** Re-run migration `010_add_notification_recipients.sql` to update triggers

---

## File Changes Summary

### Modified Files
1. ✅ `components/NotificationBell.jsx` - Added admin filter to real-time subscription
2. ✅ `pages/api/notifications/index.js` - Added recipient_type filtering
3. ✅ `public/manifest.json` - Added gcm_sender_id
4. ✅ `public/admin-manifest.json` - Added gcm_sender_id

### Already Fixed (Previous Work)
1. ✅ `pages/api/push/send.js` - Uses admin client to bypass RLS
2. ✅ `utils/pushNotifications.js` - Subscription persistence
3. ✅ `public/sw.js` - Push event handler with sound
4. ✅ `components/AdminLayout.jsx` - Removed auto-subscribe

---

## Next Steps

### For Deployment
1. ✅ Commit and push changes
   ```bash
   git add -A
   git commit -m "FIX: Add recipient filtering for admin notifications + gcm_sender_id for push"
   git push
   ```

2. ⚠️ **Add environment variables to Vercel** (CRITICAL)
3. ⚠️ **Redeploy application**
4. ⚠️ **Run database migrations in Supabase SQL Editor**
5. ✅ Test on production domain
6. ✅ Test PWA install and push notifications on mobile

### For Testing
1. Test real-time notifications (in-app, no refresh needed)
2. Test push notifications (background, with app closed)
3. Test filtering (admin only sees admin notifications)
4. Test mobile PWA (install and receive push on phone)

---

## Success Criteria

✅ **Real-Time In-App Working:**
- New order creates notification
- Admin bell updates instantly (no refresh)
- Count badge updates in real-time
- Only admin notifications appear in admin bell
- Only customer notifications appear in customer bell

✅ **Push Notifications Working:**
- Toggle stays enabled after page refresh
- Test notification appears with sound
- Notifications work when app is minimized
- Notifications work when app is closed completely
- Vibration pattern works on mobile
- Click opens the app to correct page

✅ **PWA Working:**
- PWA installs on mobile device
- Icon appears on home screen
- Runs in standalone mode
- Service worker registered
- Push notifications work in PWA mode

---

## Architecture Summary

```
User Action (Order Created)
    ↓
Database Trigger (notify_new_order)
    ↓
Two Notifications Created:
    ├── recipient_type='admin', recipient_id=null
    └── recipient_type='customer', recipient_id={customerId}
    ↓
Supabase Real-time Broadcasts
    ↓
Components Subscribe with Filters:
    ├── NotificationBell: filter='recipient_type=eq.admin'
    └── CustomerNotificationBell: filter='recipient_type=eq.customer,recipient_id=eq.{id}'
    ↓
Push API Called (/api/push/send)
    ↓
Uses supabaseAdmin (bypasses RLS)
    ↓
Queries push_subscriptions table
    ↓
Sends via web-push to all admin subscriptions
    ↓
Service Worker receives push event
    ↓
Displays notification with sound + vibration
```

---

## Support Resources

- **Supabase Dashboard:** https://supabase.com/dashboard/project/tjitbybznlpdiqbbgqif
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Push Test Page:** `/admin/push-test`
- **Diagnostics Page:** `/admin/diagnostics`
- **Notification Settings:** `/admin/notifications`

---

**Last Updated:** December 23, 2025
**Status:** Ready for deployment and testing
