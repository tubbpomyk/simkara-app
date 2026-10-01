const CACHE_NAME = 'simkara-pwa-v5';
const urlsToCache = [
  './',
  './index.html',
  './app.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Memaksa Service Worker baru untuk langsung aktif
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Menghapus cache versi lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Strategi: Network First (Utamakan Internet, jika gagal/offline baru pakai Cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika internet jalan, simpan data terbaru ke cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request);
      })
  );
});
