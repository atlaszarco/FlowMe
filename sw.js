const CACHE_NAME = 'flowme-v1.6.5';
const urlsToCache = ['./', './index.html', './manifest.json'];

// Instala e guarda a versão inicial
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Força o novo SW a assumir o controle imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Limpa os caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Apaga as memórias velhas
          }
        })
      );
    })
  );
});

// Online. Se falhar, usa o cache.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
