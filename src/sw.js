const self = this;
const CACHE_NAME = "{{SHA_FROM_PRE_BUILD}}";

self.addEventListener('activate', () => {
  console.log('SW activate');
  clients.claim();
});

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async function () {
      console.log('SW installed');
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      const url = event.request.url;
      if (url.startsWith(self.location.origin)) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;
        const networkResponse = await fetch(event.request);
        event.waitUntil(cache.put(event.request, networkResponse.clone()));
        return networkResponse;
      } else {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      }
    })(),
  );
});
