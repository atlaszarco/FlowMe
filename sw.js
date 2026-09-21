const CACHE_NAME = 'flowme-v4.3.6';
const urlsToCache = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Instala e guarda a versão inicial
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// Limpa os caches antigos e assume o controle das abas abertas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Apaga as memórias velhas
          }
        })
      ))
      .then(() => self.clients.claim()) // Assume o controle sem precisar recarregar
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isHTML) {
    // Network-first para HTML: garante que o usuário sempre vê a versão mais recente quando online
    event.respondWith(
      fetch(req)
        .then((response) => {
          // Guarda uma cópia no cache
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => cached); // Se offline, retorna o que tem (ou undefined)

      return cached || networkFetch;
    })
  );
});
