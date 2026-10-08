const CACHE_NAME = "jcrgm-master-study-shell-v3";
const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  // Keep first install small and fast; the lesson MP3s are deliberately not precached.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith("jcrgm-master-study-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function makeRangeResponse(fullResponse, rangeHeader) {
  const bytes = await fullResponse.arrayBuffer();
  const total = bytes.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader || "");
  if (!match || !total) return new Response(bytes, { status: 200, headers: fullResponse.headers });
  let start, end;
  if (match[1] === "") {
    const suffix = Math.max(1, Number(match[2]) || total);
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : total - 1;
  }
  if (start >= total || end < start) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
  }
  end = Math.min(end, total - 1);
  const headers = new Headers(fullResponse.headers);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Range", `bytes ${start}-${end}/${total}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(bytes.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
}

async function cachedAudioResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  const key = new Request(request.url, { method: "GET" });
  const range = request.headers.get("range");
  const cached = await cache.match(key);
  if (cached) return range ? makeRangeResponse(cached.clone(), range) : cached;

  // Audio elements often request a byte range. Fetch the selected small MP3 in full,
  // cache that one lesson only, and return the requested bytes to the player.
  if (range) {
    const headers = new Headers(request.headers);
    headers.delete("range");
    const fullRequest = new Request(request.url, {
      method: "GET", headers, mode: request.mode, credentials: request.credentials,
      redirect: request.redirect, referrer: request.referrer
    });
    const full = await fetch(fullRequest);
    if (full.ok && full.status === 200 && full.type === "basic") {
      await cache.put(key, full.clone());
      return makeRangeResponse(full, range);
    }
    return fetch(request);
  }

  const response = await fetch(request);
  if (response.ok && response.status === 200 && response.type === "basic") {
    await cache.put(key, response.clone());
  }
  return response;
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Leave external Bible APIs and research sites to their normal network behavior.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (url.pathname.toLowerCase().endsWith(".mp3")) {
    event.respondWith(cachedAudioResponse(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok && response.status === 200 && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
