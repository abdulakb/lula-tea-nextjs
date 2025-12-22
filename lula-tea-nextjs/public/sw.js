// Service Worker for Lula Tea PWA
const CACHE_NAME = 'lula-tea-v1';
const STATIC_CACHE = 'lula-tea-static-v1';
const DYNAMIC_CACHE = 'lula-tea-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/images/logo.jpg',
  '/images/Product%20Image2.jpg',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls for fresh data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache-first strategy for static assets
  if (
    url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|avif|ico|css|js)$/) ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((fetchResponse) => {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
    return;
  }

  // Network-first strategy for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          return (
            response ||
            caches.match('/').then((homeResponse) => {
              return homeResponse || new Response('Offline - Please check your connection', {
                status: 503,
                statusText: 'Service Unavailable',
              });
            })
          );
        });
      })
  );
});

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update from Lula Tea',
      icon: '/images/logo.jpg',
      badge: '/images/logo.jpg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'notification',
      requireInteraction: false,
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Lula Tea', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
