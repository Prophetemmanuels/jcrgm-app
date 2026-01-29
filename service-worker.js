const CACHE_NAME = 'jcrgm-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/icon-512.png'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(cacheNames.map(name => { if(name!==CACHE_NAME) return caches.delete(name); }))
    )
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(response => response || fetch
::contentReference[oaicite:0]{index=0}
