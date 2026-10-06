const CACHE_NAME = 'shortstube-pro-cache-v1';

// Install hobar somoy main UI gulo cache korbe
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Net na thakle eikhan theke offline video dibe
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'video' || event.request.url.includes('cloudinary')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          // Limit cache to avoid crashing phone storage
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  }
});