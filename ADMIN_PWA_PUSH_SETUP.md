# Admin PWA Push Notifications - Complete Setup Guide

## ✅ What's Already Implemented

Your admin dashboard **already has** push notifications that work even when the PWA is closed! Here's what's working:

1. **Service Worker** (`public/sw.js`) - Listens for push events in background
2. **Auto-subscription** (`components/AdminLayout.jsx`) - Subscribes admin on login
3. **Push API Endpoints** - Sends notifications to admin devices
4. **Vibration & Sound** - Configured in service worker
5. **Background Notifications** - Works when PWA/browser is closed

## 🔧 Required Setup (Do These Now)

### 1. Add Environment Variables to Vercel

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these **3 variables** for all environments (Production, Preview, Development):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BFmMdml3WjSsDXSkRVVcsrFhN6KddpJlrWv7defo9l9WsIKIKVbUWaPZ_DD5os2XVocco7xpysdi44zfDD0D6gk

VAPID_PRIVATE_KEY=Ch4DFwUBJFDJ8OCh-FF8a0g-MtY_Z9iNTjE4f_CxwEk

VAPID_PUBLIC_KEY=BFmMdml3WjSsDXSkRVVcsrFhN6KddpJlrWv7defo9l9WsIKIKVbUWaPZ_DD5os2XVocco7xpysdi44zfDD0D6gk
```

**Then:** Click "Redeploy" button in Vercel dashboard

### 2. Run Database Migrations in Supabase

**Go to:** https://supabase.com/dashboard → Your Project → SQL Editor

**Run these 2 migrations in order:**

#### Migration 1: `010_add_notification_recipients.sql`
```sql
-- Copy and paste the ENTIRE content from:
supabase/migrations/010_add_notification_recipients.sql
```

#### Migration 2: `011_create_push_subscriptions.sql`
```sql
-- Copy and paste the ENTIRE content from:
supabase/migrations/011_create_push_subscriptions.sql
```

Click **RUN** for each one.

### 3. Install PWA on Mobile Device

On your **mobile phone**:

1. Open Chrome/Safari browser
2. Go to: `https://www.empirecarac.in/admin`
3. Login as admin
4. Click browser menu → "Add to Home Screen" or "Install App"
5. Open the installed PWA app
6. **Allow notifications** when prompted (THIS IS CRITICAL!)

### 4. Test Notifications

**In browser console** (on admin dashboard), run:

```javascript
fetch('/api/push/test', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log('Test result:', data))
```

You should receive a push notification **even if you:**
- Close the PWA app
- Lock your phone screen
- Switch to another app

## 📱 How It Works When PWA Is Closed

```
Customer Places Order
       ↓
Database Trigger Creates Notification
       ↓
Server Calls /api/push/send
       ↓
Push notification sent to admin's device
       ↓
Service Worker receives push event (even if app closed)
       ↓
Phone plays sound + vibrates + shows notification
       ↓
Admin taps notification
       ↓
PWA opens to order details page
```

## 🔍 Troubleshooting

### "No notification received"

1. **Check notification permission:**
   ```javascript
   console.log('Permission:', Notification.permission)
   // Should show: "granted"
   ```

2. **Check if subscribed:**
   ```javascript
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('Subscribed:', sub ? 'YES' : 'NO')
     })
   })
   ```

3. **Check environment variables in production:**
   - Go to deployed site
   - Open console
   - Run: `console.log(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length)`
   - Should show: `87` (not `undefined`)

### "Error: VAPID key undefined"

- Environment variables not set in Vercel
- Need to redeploy after adding variables

### "Permission denied"

1. On mobile: Settings → Apps → Your PWA → Notifications → Enable
2. On desktop: Click lock icon in address bar → Site settings → Notifications → Allow

### "Notifications only work when app is open"

- Service worker not registered properly
- Hard refresh browser (Ctrl+Shift+R)
- Reinstall PWA app

## 🎯 What Happens Next

After completing setup:

1. ✅ Admin logs in → Auto-subscribes to push notifications
2. ✅ Customer creates order → Admin gets notification with sound
3. ✅ Works even when:
   - PWA is closed
   - Phone is locked
   - Browser is minimized
   - Admin is using other apps
4. ✅ Tapping notification opens the app to order details

## 🔊 Notification Features

Your push notifications include:

- **Sound**: Device default notification sound
- **Vibration**: Custom pattern (300ms, 100ms pause, 200ms, 100ms pause, 300ms)
- **Badge**: Shows app icon with notification count
- **Actions**: "View" (opens order) and "Dismiss"
- **Persistent**: Stays visible until admin interacts
- **Rich Content**: Order number, customer name, amounts

## 📊 Testing Checklist

- [ ] Environment variables added to Vercel
- [ ] Vercel redeployed
- [ ] Migration 010 run in Supabase
- [ ] Migration 011 run in Supabase
- [ ] PWA installed on mobile device
- [ ] Notification permission granted
- [ ] Test notification received with app closed
- [ ] Sound played
- [ ] Vibration felt
- [ ] Tapping notification opens app

## 🚀 Production Ready!

Once setup is complete, your admin will receive **real-time push notifications with sound and vibration** for:

- New orders
- Order status changes
- Payment confirmations
- Customer messages

All working **even when the PWA is completely closed!**
