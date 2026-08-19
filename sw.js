const CACHE_NAME = 'devililia-tarot-v1';

// List of all core files to cache for offline play
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/orb.png',
  './assets/mote.png',
  './assets/ripple.png',
  './assets/day.png',
  './assets/night.png',
  './assets/deskwithorb.png',
  './assets/teacup.png',
  './assets/card-back.png',
  './assets/top-viewoftable.png',
  './assets/gameplay.mp3',
  './assets/cardflip.mp3'
];

// Install the service worker and open the cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Clean up old caches when updating
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
