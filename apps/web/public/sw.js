const CACHE_STATIC = 'adn-static-v1';
const CACHE_DYNAMIC = 'adn-dynamic-v1';
const STATIC_MAX_AGE = 30 * 24 * 60 * 60; // 30 gün
const SWR_MAX_AGE = 5 * 60; // 5 dakika

const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.woff2', '.woff'];
const SWR_PATHS = ['/profile', '/game/status'];

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_STATIC && k !== CACHE_DYNAMIC).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

function isSWRPath(url) {
  return SWR_PATHS.some(p => url.pathname.startsWith(p));
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth');
}

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Statik varlıklar — Cache-First, 30 gün
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_STATIC).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const res = await fetch(event.request);
        if (res.ok) cache.put(event.request, res.clone());
        return res;
      }).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // SWR paths — Stale-While-Revalidate, 5 dakika
  if (isSWRPath(url)) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC).then(async cache => {
        const cached = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then(res => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // API istekleri — Network-First
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ success: false, message: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503
        })
      )
    );
    return;
  }

  // Diğer — Network-First, offline fallback
  event.respondWith(
    fetch(event.request).catch(() => caches.match('/offline.html'))
  );
});
