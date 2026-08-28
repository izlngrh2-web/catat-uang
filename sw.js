const CACHE_NAME = 'catat-uang-dynamic-v2';

// Saat instalasi, langsung aktifkan service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Saat diaktifkan, bersihkan semua cache lama secara otomatis
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategi: Selalu ambil dari internet (Network First), jika offline ambil cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil terhubung ke internet, simpan salinan terbarunya ke cache
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // Jika perangkat offline (tidak ada internet), gunakan data dari cache
        return caches.match(event.request);
      })
  );
});
