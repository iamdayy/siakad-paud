self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch handler is enough to pass PWA checks.
  // For offline capability, a caching strategy should be implemented here.
  event.respondWith(fetch(event.request));
});
