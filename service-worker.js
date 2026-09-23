/* JCRGM shared workspace: network-first PUBLIC static assets only.
   Never cache cross-origin Supabase/API/auth traffic, POSTs, private JSON/API responses,
   signed-in data, or URLs containing auth query parameters.
   Bump VERSION when deploying changes. Back up any prior custom worker. */
const VERSION='jcrgm-shared-static-v2';
const START_ASSETS=['./','./index.html','./crossover.html','./manifest.json','./apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(VERSION);
 await Promise.all(START_ASSETS.map(async path=>{try{const request=new Request(new URL(path,self.location.href));const response=await fetch(request,{cache:'no-store'});if(response.ok&&response.type==='basic')await cache.put(request,response);}catch(e){/* An unavailable optional static asset must not prevent the update. */}}));
 await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if((key.startsWith('jcrgm-shared-static-')&&key!==VERSION)||key==='jcrgm-v4')await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Returning without respondWith leaves these requests network-only.
 if(request.method!=='GET'||url.origin!==self.location.origin||url.search||request.headers.has('authorization'))return;
 const isPublicAsset=/\.(html?|css|js|png|jpe?g|svg|ico|woff2?)$/i.test(url.pathname)||url.pathname.endsWith('/')||url.pathname.endsWith('/manifest.json');
 if(!isPublicAsset)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION);
  try{const response=await fetch(request,{cache:'no-store'});if(response.ok&&response.type==='basic')await cache.put(request,response.clone());return response;}
  catch(error){const stored=await cache.match(request);if(stored)return stored;throw error;}
 })());
});
