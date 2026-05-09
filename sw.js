const CACHE_NAME = 'vibepass-v2'; // Incrementiamo la versione per forzare l'aggiornamento

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/img/favicon_io/favicon.ico',
  './assets/img/favicon_io/favicon-32x32.png',
  './assets/img/favicon_io/favicon-16x16.png',
  './assets/img/favicon_io/apple-touch-icon.png',
  './assets/img/favicon_io/android-chrome-192x192.png',
  './assets/img/favicon_io/android-chrome-512x512.png'
];

// Installazione: salvataggio file in cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching degli assets universali...');
      return cache.addAll(ASSETS);
    })
  );
});

// Attivazione: pulizia vecchie cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Rimozione vecchia cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Strategia di fetch: Cache first, poi Network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});