# Push Notifications - Background Requirements

## Why Notifications May Not Work When PWA is Closed

Push notifications are delivered by the **browser's push service** (Firebase Cloud Messaging for Chrome), not by your website. When the PWA is closed, the service worker must remain active to receive these push messages from the browser.

## Platform Support

### ✅ **Full Support (Notifications work when closed):**
- **Desktop Chrome/Edge (Windows/Mac/Linux)**
- **Android Chrome/Edge**

### ⚠️ **Limited Support:**
- **iOS Safari/Chrome** - Apple does NOT support background push notifications when browser is completely closed
- **iOS PWA** - Only works when app is in background (not terminated)

### ❌ **No Support:**
- **Browsers in Private/Incognito mode**
- **Browsers with site data cleared on exit**

## Requirements for Background Notifications

### 1. Service Worker Must Be Registered
- Go to `chrome://serviceworker-internals/`
- Find your site URL
- Check Status should be "ACTIVATED"
- Check "Start worker" button appears (means it can be started)

### 2. Push Subscription Must Be Valid
- Visit `/admin/notification-setup`
- Check "Subscription: Active"
- If inactive, click "Enable Push Notifications"

### 3. Browser Permissions
- Notifications: **Allowed** (not blocked)
- Site Data: **Allowed to persist**
- Background Sync: **Allowed** (automatic)

### 4. Android-Specific Settings

**Battery Optimization:**
1. Open Android Settings
2. Apps → Chrome (or your browser)
3. Battery → **Unrestricted**
4. Background data: **Allowed**

**Notifications:**
1. Settings → Apps → Chrome
2. Notifications → **Enabled**
3. All notification categories → **Enabled**

**Do Not Disturb:**
- Make sure DND mode allows priority notifications
- Or disable DND completely for testing

### 5. Desktop-Specific Settings

**Windows:**
- Settings → System → Notifications → Enable notifications
- Settings → System → Notifications → Chrome → **ON**

**Mac:**
- System Preferences → Notifications → Chrome → **Allow Notifications**

## Testing Procedure

### Test 1: Browser Open
1. Go to `/admin/notification-setup`
2. Click "Send Test"
3. ✅ Notification should appear immediately

### Test 2: Browser Minimized
1. Click "Send Test"
2. Minimize browser (don't close)
3. ✅ Notification should appear

### Test 3: Browser Closed (Critical Test)
1. Click "Test Order Flow"
2. **IMMEDIATELY close the browser completely**
3. Wait 2-3 seconds
4. ✅ Notification should appear even with browser closed

**If Test 3 fails:**
- Check `chrome://serviceworker-internals/` - service worker should restart automatically
- Check Android battery settings - must be "Unrestricted"
- Check if browser allows background processes
- On iOS: **This will NOT work** - known platform limitation

## Common Issues

### "Notifications work when testing but not from real orders"

**Possible causes:**
1. **Timing issue** - Order completes too fast, push sent before SW ready
2. **Different user** - Customer places order, but admin isn't subscribed
3. **Multiple devices** - Subscribed on device A, testing on device B

**Solutions:**
- Check admin is subscribed: `/api/push/health`
- Check subscriptions in database match your current device
- Click "Test Order Flow" to simulate exact order process

### "Service worker stops working after a while"

**Possible causes:**
1. Browser kills inactive service workers (normal behavior)
2. Push subscription expired (auto-renewed on next visit)
3. Battery optimization killed the process

**Solutions:**
- Service workers are designed to wake up when push arrives
- If it doesn't wake up, check battery optimization settings
- Re-enable push notifications to refresh subscription

### "Works on Desktop but not Android"

This is usually **battery optimization**:
1. Settings → Apps → Chrome → Battery → **Unrestricted**
2. Disable "Adaptive Battery" for Chrome
3. Some Android manufacturers (Xiaomi, Oppo, etc.) have aggressive battery saving - disable it

## Verification Checklist

- [ ] Service Worker Status: **ACTIVATED**
- [ ] Push Subscription: **Active**  
- [ ] Notification Permission: **Granted**
- [ ] Battery Optimization (Android): **OFF** (Unrestricted)
- [ ] Browser can run in background: **YES**
- [ ] DND/Focus Mode: **OFF** (or allows notifications)
- [ ] Test 1 (Browser Open): **✅ PASS**
- [ ] Test 2 (Browser Minimized): **✅ PASS**
- [ ] Test 3 (Browser Closed): **✅ PASS** (Not on iOS)

## Advanced Debugging

### Check Push Endpoint
```javascript
// In browser console
navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.getSubscription().then(sub => 
    console.log(sub.endpoint)
  )
)
```

### Check Service Worker Events
```javascript
// In service worker console (chrome://serviceworker-internals/)
// Look for push events in the log
```

### Force Service Worker Restart
1. Go to `chrome://serviceworker-internals/`
2. Click "Stop" on your service worker
3. Send a test notification
4. Service worker should automatically start and receive push

## Platform Limitations Summary

| Platform | Browser Open | Browser Minimized | Browser Closed |
|----------|-------------|-------------------|----------------|
| Desktop Chrome | ✅ | ✅ | ✅ |
| Android Chrome | ✅ | ✅ | ✅* |
| iOS Safari | ✅ | ⚠️ | ❌ |
| iOS Chrome | ✅ | ⚠️ | ❌ |

*Requires battery optimization disabled

## Getting Help

If notifications still don't work after following this guide:

1. Visit `/api/push/health` to check system status
2. Visit `/admin/notification-setup` and click "Test Order Flow"
3. Check browser console for errors
4. Check service worker console at `chrome://serviceworker-internals/`
5. Verify VAPID keys match between server and client
6. Test on a different device/browser to isolate the issue
