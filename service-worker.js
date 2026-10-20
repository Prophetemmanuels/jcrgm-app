/* ============================================================
   JCRGM SERVICE WORKER
   Makes the "installed" app open instantly and work offline.
   - Pre-caches the app shell (index.html, icons, install UI)
   - Network-first for pages (so members always get updates)
   - Cache-first for static files (fast + offline)
   - Sends "update available" messages to the page
   Bump CACHE_VERSION whenever you deploy a big change.
   ============================================================ */
'use strict';

const CACHE_VERSION = 'jcrgm-v1.0.0';
const RUNTIME = CACHE_VERSION + '-runtime';

const SHELL = [
  './',
  './index.html',
  './install.html',
  './install.js',
  './manifest.webmanifest',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon-180.png',
  './assets/icons/favicon-32.png'
];

/* ---------- install: pre-cache the shell ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // addAll fails entirely if ONE file 404s — add them one by one instead
    await Promise.all(SHELL.map(async (url) => {
      try { await cache.add(new Request(url, { cache: 'reload' })); } catch (e) { /* skip missing */ }
    }));
    // Don't skipWaiting automatically: the page shows an "Update" button.
  })());
});

/* ---------- activate: clean old caches ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => {
      if (k !== CACHE_VERSION && k !== RUNTIME) return caches.delete(k);
    }));
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.disable(); } catch (e) {}
    }
    await self.clients.claim();
  })());
});

/* ---------- message: page asks us to take over ---------- */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'PING') {
    if (event.source) event.source.postMessage({ type: 'PONG', version: CACHE_VERSION });
  }
});

/* ---------- fetch ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only GET, only http(s)
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never touch other origins (WhatsApp, YouTube, payment links…)
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first, fall back to cache (offline)
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', fresh.clone()).catch(() => {});
        return fresh;
      } catch (e) {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match(req, { ignoreSearch: true })) ||
               (await cache.match('./index.html')) ||
               new Response(
                 '<h1 style="font-family:system-ui;padding:24px">You are offline</h1>' +
                 '<p style="font-family:system-ui;padding:0 24px">Reconnect to the internet and reopen JCRGM.</p>',
                 { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
               );
      }
    })());
    return;
  }

  // Static same-origin assets: cache-first, refresh in background
  event.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    const network = fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        caches.open(RUNTIME).then((c) => c.put(req, res.clone())).catch(() => {});
      }
      return res;
    }).catch(() => null);
    return cached || (await network) || new Response('', { status: 504 });
  })());
});
