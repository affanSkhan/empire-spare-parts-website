// Firebase Cloud Messaging Service Worker for Background Push Notifications
// This file MUST be named exactly 'firebase-messaging-sw.js' for FCM compatibility
// VERSION 1.0.0

const SW_VERSION = '1.0.0';

console.log('[FCM-SW] Firebase Messaging Service Worker loaded, version:', SW_VERSION);

// Push notification handler - This is what receives background pushes
self.addEventListener('push', function(event) {
  console.log('[FCM-SW] ===== PUSH EVENT RECEIVED =====');
  console.log('[FCM-SW] Time:', new Date().toISOString());
  console.log('[FCM-SW] Has data:', !!event.data);

  // Default notification data
  let notificationData = {
    title: 'Empire Car A/C',
    body: 'You have a new notification',
    url: '/admin'
  };

  // Try to parse push data
  if (event.data) {
    try {
      const text = event.data.text();
      console.log('[FCM-SW] Raw data:', text);
      notificationData = JSON.parse(text);
      console.log('[FCM-SW] Parsed data:', notificationData);
    } catch (e) {
      console.error('[FCM-SW] Parse error:', e);
    }
  }

  // Notification options
  const options = {
    body: notificationData.body || notificationData.message || 'New notification',
    icon: '/Empire Car Ac  Logo Design.jpg',
    badge: '/favicon-32x32.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: notificationData.tag || 'empire-notification-' + Date.now(),
    requireInteraction: true,
    renotify: true,
    data: {
      url: notificationData.url || notificationData.link || '/admin',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  console.log('[FCM-SW] Showing notification:', notificationData.title);

  // CRITICAL: Use waitUntil to keep SW alive until notification is shown
  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'Empire Car A/C', options)
      .then(() => {
        console.log('[FCM-SW] ✅ Notification shown successfully');
      })
      .catch((error) => {
        console.error('[FCM-SW] ❌ Error showing notification:', error);
      })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[FCM-SW] Notification clicked');
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let client of clientList) {
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus().then(() => client.navigate(urlToOpen));
          }
        }
        // Open new window if none exists
        return clients.openWindow(urlToOpen);
      })
  );
});

// Handle subscription changes
self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[FCM-SW] Subscription changed');
  // The main SW will handle resubscription
});

// Install and activate
self.addEventListener('install', function(event) {
  console.log('[FCM-SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[FCM-SW] Activating...');
  event.waitUntil(self.clients.claim());
});

console.log('[FCM-SW] Ready for push notifications');
