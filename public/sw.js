const PREFIX = `classroom-draw:${self.registration.scope}:`;
const CACHE = PREFIX + 'v127';
const ASSETS = ['./','./index.html','./style.css','./app.js','./draw.js','./lottery.js','./roulette.js','./ball-race.js','./race-camera.js','./race-leaderboard.js','./horse-race.js','./pinball.js','./pinball-audio.js','./die-3d.js','./maze.js','./crane.js','./machine.js','./karakuri.js','./trolley.js','./frog-pond.js','./alien-dance.js','./bowling.js','./balloon.js','./penguin.js','./pirate.js','./treasure2.js','./ghost-house.js','./washer.js','./botamochi.js','./detour.js','./monkey.js','./dig-dog.js','./love-dog.js','./dog-stick.js','./kappa.js','./gourd.js','./cat-coin.js','./tortoise-hare.js','./chestnut.js','./star-quintet.js','./star-quintet-audio.js','./drum-arcade.js','./drum-arcade-audio.js','./castle-finale.js','./castle-finale-music.js','./barrel-escape.js','./brick-breaker.js','./brick-breaker-audio.js','./falling-puzzle.js','./falling-puzzle-audio.js','./maze-chase.js','./maze-chase-audio.js','./space-invaders.js','./robot-race.js','./baby-race.js','./crane-audio.js','./galton.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
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
