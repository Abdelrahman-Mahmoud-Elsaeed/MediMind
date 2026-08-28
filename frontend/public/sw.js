const CACHE_NAME = 'medimind-cache-v1';

const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          urlsToCache.map((url) => cache.add(url).catch((err) => console.warn('[SW] Cache add failed:', url, err)))
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch((err) => {
          console.warn('[SW] Network fetch failed:', event.request.url);
          return new Response('Network offline or resource unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MediMind Reminder';
  const options = {
    body: data.message || 'It is time for your medication.',
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    sound: '/sounds/mixkit-long-pop-2358.wav'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

