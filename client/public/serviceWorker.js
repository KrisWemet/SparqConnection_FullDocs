// Simple service worker for basic caching
const CACHE_NAME = 'sparq-connection-v1';

// Assets to cache when the service worker is installed
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png', 
  '/logo512.png',
  '/offline.html'
];

// Install handler: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate handler: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('sparq-connection-') && 
                  cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Simple network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If we get a valid response, clone it and cache it
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If request is for a page, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Otherwise just return a 404-like response
            return new Response('Not found', {
              status: 404,
              statusText: 'Not found'
            });
          });
      })
  );
}); 