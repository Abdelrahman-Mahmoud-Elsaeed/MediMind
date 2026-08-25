const CACHE_NAME = 'medimind-cache-v1';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MediMind Reminder';
  const options = {
    body: data.message || 'It is time for your medication.',
    icon: '/icon.png',
    badge: '/icon.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
