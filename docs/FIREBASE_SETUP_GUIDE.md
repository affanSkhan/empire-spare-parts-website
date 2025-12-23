# 🔥 Firebase Setup - Step by Step Guide

## Step 1: Go to Firebase Console
🌐 Open: **https://console.firebase.google.com/**
- Click **"Add project"** or **"Create a project"**

## Step 2: Create Project
1. **Project name:** `Empire Admin` (or any name you want)
2. Click **Continue**
3. **Google Analytics:** Toggle OFF (not needed for push notifications)
4. Click **Create project**
5. Wait for setup (~30 seconds)
6. Click **Continue**

## Step 3: Add Android App
1. On the project homepage, click the **Android icon** (robot icon)
   - Or go to **Project Settings** (⚙️ gear icon) → **Your apps** → **Add app** → **Android**

2. Fill in the form:
   - **Android package name:** `com.empire.admin` ⚠️ **MUST MATCH EXACTLY**
   - **App nickname (optional):** `Empire Admin`
   - **Debug signing certificate SHA-1:** Leave blank (not needed for FCM)

3. Click **Register app**

## Step 4: Download google-services.json
1. You'll see a button: **"Download google-services.json"**
2. Click it to download the file (it's a small JSON file)
3. **IMPORTANT:** Save it to this EXACT location on your computer:
   ```
   C:\Users\USER\Empire_spare_parts\android\app\google-services.json
   ```

## Step 5: Skip the remaining steps
Firebase will show you additional setup steps. You can click:
- **Next**
- **Next**  
- **Continue to console**

You don't need to follow those steps - Capacitor already configured everything!

## Step 6: Verify FCM is Enabled
1. In Firebase Console, click **Build** (left sidebar)
2. Click **Cloud Messaging**
3. You should see "Cloud Messaging API (Legacy)" - this means FCM is ready!

---

## ✅ That's it! Firebase is configured.

**What you just did:**
- Created a Firebase project
- Registered your Android app with package name `com.empire.admin`
- Downloaded the credentials file (`google-services.json`)

**What Firebase will do:**
- Allow your app to receive push notifications from Google's servers
- Wake up your app even when it's completely closed
- Handle message delivery automatically

---

## 🎯 Next: Build the APK

Now that Firebase is ready, follow these commands:

```bash
cd C:\Users\USER\Empire_spare_parts

# Sync the Android project (copies google-services.json)
npx cap sync android

# Open Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync (~2 minutes first time)
2. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build (~3-5 minutes)
4. Click **locate** in the notification popup
5. Copy the APK to your phone and install!

---

## 🐛 Troubleshooting

### "File google-services.json is missing"
**Solution:** Make sure you placed the file in:
```
C:\Users\USER\Empire_spare_parts\android\app\google-services.json
```
Then run: `npx cap sync android`

### "Package name mismatch"
**Solution:** The package name in Firebase MUST be exactly: `com.empire.admin`
If you used a different name, delete the app in Firebase and add it again.

### "Cloud Messaging not enabled"
**Solution:** 
1. Go to Firebase Console → Build → Cloud Messaging
2. If you see a button to enable, click it
3. The "Legacy" API should be enabled by default

---

## 📱 After Building the APK

1. **Install** the APK on your Android phone
2. **Open** the Empire Admin app
3. **Login** with your admin credentials
4. The app will automatically register for FCM push notifications
5. **Test:** Close/kill the app, then send a test notification from the web dashboard
6. **Result:** You should receive the notification even with the app closed! 🎉

---

## 🎓 Understanding What Happened

**Before (PWA):**
- Your "app" was actually just a Chrome browser shortcut
- When you killed Chrome, the app died too
- No way to wake it up for notifications

**After (Native App):**
- Your app is a real Android app (APK file)
- It uses Google Play Services to stay connected
- Even when killed, Google wakes it up when notifications arrive
- Works exactly like WhatsApp, Instagram, etc.

**The Cost:**
- You needed a Firebase account (free forever for your usage)
- You needed to download one file (`google-services.json`)
- You need to build an APK file (one-time, then you can update online)

**The Benefit:**
- 100% reliable push notifications
- Works on ALL Android phones (even aggressive Chinese brands)
- Professional native app experience
