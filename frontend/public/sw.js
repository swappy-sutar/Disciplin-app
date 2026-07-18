// Service Worker for Disciplin notifications and background operations
const CACHE_NAME = 'disciplin-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.log('Pre-caching skipped: ', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event listener to satisfy PWA criteria and handle basic cache/network fallbacks
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and local/http schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version but fetch update in background (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch((err) => {
        // Fallback for document request when offline
        const acceptHeader = event.request.headers.get('accept');
        if (acceptHeader && acceptHeader.includes('text/html')) {
          return caches.match('/index.html');
        }
        throw err;
      });
    })
  );
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
