/* DigiTour lightweight offline shell — network-first for HTML/JS so map updates aren't stuck */
const CACHE = 'digitour-shell-v5';
const SHELL = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/css/nav-mobile.css',
  '/assets/css/chatbot.css',
  '/assets/css/responsive.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const path = url.pathname;
  // Always prefer fresh map + scripts/styles so localhost/Netlify updates show immediately
  const networkFirst =
    path.endsWith('.html') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.startsWith('/data/') ||
    path.includes('map');

  if (networkFirst) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
