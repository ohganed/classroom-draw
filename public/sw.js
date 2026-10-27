const PREFIX = `classroom-draw:${self.registration.scope}:`;
const CACHE = PREFIX + 'v10';
const ASSETS = ['./','./index.html','./style.css','./app.js','./draw.js','./lottery.js','./roulette.js','./ball-race.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
// A new version takes over after existing app windows close, avoiding mixed versions.
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
 const url = new URL(event.request.url);
 if (event.request.method !== 'GET' || !url.href.startsWith(self.registration.scope)) return;
 event.respondWith(caches.open(CACHE).then(async cache => {
  const cached = await cache.match(event.request);
  if (cached) return cached;
  try { return await fetch(event.request); }
  catch (error) { if (event.request.mode === 'navigate') return cache.match('./index.html'); throw error; }
 }));
});
