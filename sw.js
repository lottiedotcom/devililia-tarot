const CACHE_NAME = 'devililia-tarot-v11';

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
  './assets/item-hourglass.png',
  './assets/item-polaroid.png',
  './assets/item-moontear.png',
  './assets/item-tv.png',
  './assets/item-letter.png',
  './assets/item-clock.png',
  './assets/item-mirror.png',
  './assets/item-pillow.png',
  './assets/mirrorgirl.png',
  './assets/mirrorpool.png',
  './assets/mirrorhall.png',
  './assets/mirrorchurch.png',
  './assets/tvon.png',
  './assets/tvch1.png',
  './assets/gameplay.mp3',
  './assets/cardflip.mp3',
  './assets/teatimer.mp3',
  './assets/tarotgameplay.mp3',
  './assets/chime.mp3',        
  './assets/tvon.mp3',        
  './assets/tvch1.mp3',        
  './assets/tvdefaulton.mp3',        
  './assets/tvdefaultoff.mp3',        
  './assets/clockbg.png'   
];

self.addEventListener('install', event => {
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

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
    }).then(() => {
      return self.clients.claim();
    })
  );
});
