// The North Hills Brief app: keeps the app opening without a connection.
const CACHE = 'nhb-app-20261108';
const SHELL = ['./', 'index.html', 'data.json', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  // Newest copy first. Only a good response is saved. Offline, use the saved copy;
  // only a page load falls back to the app page, so a missing data file is never answered with a web page.
  e.respondWith(fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
    .catch(() => caches.match(req).then(m => m || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
