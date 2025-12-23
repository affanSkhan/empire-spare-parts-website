import '@/styles/globals.css'
import { useEffect } from 'react'

/**
 * Main App Component
 * This wraps all pages in the application
 */
export default function App({ Component, pageProps }) {
  // Register service workers on app load for background push notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register main service worker with root scope
      const registerServiceWorkers = async () => {
        try {
          // First, register the main SW
          const mainReg = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });
          console.log('[App] Main Service Worker registered:', mainReg.scope);

          // Also register Firebase messaging SW for better FCM compatibility
          const fcmReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/firebase-cloud-messaging-push-scope'
          });
          console.log('[App] FCM Service Worker registered:', fcmReg.scope);

          // Ensure the service worker is activated
          if (mainReg.waiting) {
            console.log('[App] SW waiting, sending skip waiting message');
            mainReg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }

          // Check for updates periodically
          setInterval(() => {
            mainReg.update().catch(err => console.warn('[App] SW update check failed:', err));
          }, 60000);

          // Log active subscription status
          const subscription = await mainReg.pushManager.getSubscription();
          console.log('[App] Push subscription active:', !!subscription);
          if (subscription) {
            console.log('[App] Subscription endpoint:', subscription.endpoint.substring(0, 50) + '...');
          }

        } catch (error) {
          console.error('[App] Service Worker registration failed:', error);
        }
      };

      registerServiceWorkers();

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[App] Service Worker controller changed');
      });

      // Listen for push messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[App] Message from SW:', event.data);
        if (event.data?.type === 'PUSH_RECEIVED') {
          console.log('[App] Push notification received:', event.data.notification);
        }
      });
    }
  }, []);

  return <Component {...pageProps} />
}
