// Service Worker for Disciplin notifications and background operations
const CACHE_NAME = 'disciplin-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle native notification click events (redirect/focus app)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Focus existing window or open a new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Find open tab
      for (const client of clientList) {
        if (client.url.includes('/overview') && 'focus' in client) {
          return client.focus();
        }
      }
      // If none open, open /overview
      if (self.clients.openWindow) {
        return self.clients.openWindow('/overview');
      }
    })
  );
});
