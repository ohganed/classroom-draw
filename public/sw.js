const PREFIX = `classroom-draw:${self.registration.scope}:`;
const CACHE = PREFIX + 'v40';
const ASSETS = ['./','./index.html','./style.css','./app.js','./draw.js','./lottery.js','./roulette.js','./ball-race.js','./race-camera.js','./horse-race.js','./pinball.js','./pinball-audio.js','./die-3d.js','./maze.js','./crane.js','./machine.js','./crane-audio.js','./galton.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||!url.href.startsWith(self.registration.scope))return;
 // Prefer fresh pages/modules whenever connected; keep offline fallback.
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try {
   const fresh=await fetch(req);
   if(fresh.ok) await cache.put(req,fresh.clone());
   return fresh;
  }catch(e){
   const cached=await cache.match(req,{ignoreSearch:true});
   if(cached)return cached;
   if(req.mode==='navigate')return cache.match('./index.html');
   throw e;
  }
 })());
});
