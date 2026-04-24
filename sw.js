const CACHE = 'uk-travel-v11';
const STATIC = [
  '/', '/index.html', '/css/style.css',
  '/js/config.js', '/js/app.js', '/manifest.json',
  '/icons/icon.svg', '/icons/icon-maskable.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const isApi = e.request.url.includes('/.netlify/') || e.request.url.includes('api.notion.com');
  if (isApi) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ results: [], object: 'list' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    })
  );
});
