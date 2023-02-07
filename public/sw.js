const self = this;

console.log('sw.js');
console.log(self);

const CACHE_NAME = 'mysite-site-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      console.log('Service worker installed');
      console.log(event);
      const cache = await caches.open(CACHE_NAME);
      console.log({ cache });
      await cache.addAll([
        '/index.html',
        // '/css/whatever-v3.css',
        // '/css/imgs/sprites-v6.png',
        // '/css/fonts/whatever-v8.woff',
        // '/js/all-min-v4.js',
        // etc
      ]);
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async function () {
      console.log('fetch');
      console.log(event);
      // const cache = await caches.open(CACHE_NAME);
      // const cachedResponse = await cache.match(event.request);
      // if (cachedResponse) return cachedResponse;
      const networkResponse = await fetch(event.request);
      // event.waitUntil(cache.put(event.request, networkResponse.clone()));
      return networkResponse;
    })(),
  );
});