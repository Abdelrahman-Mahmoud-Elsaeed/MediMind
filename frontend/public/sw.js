/* ============================================
   وفاء (Wafa) Service Worker
   - Push notifications (FCM/VAPID)
   - Background sync
   - Offline caching
   - Notification action handlers
   ============================================ */

const CACHE_VERSION = 'wafa-v2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Files to cache immediately on install
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/auth',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'
];

// ===== INSTALL: pre-cache static files =====
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_FILES))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache failed:', err))
  );
});

// ===== ACTIVATE: clean old caches =====
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('wafa-') && !name.startsWith(CACHE_VERSION))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ===== FETCH: cache-first for static, network-first for API =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except our API)
  if (url.origin !== self.location.origin && !url.pathname.startsWith('/api/')) return;

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return;

  // API requests: network-first (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static files: cache-first (with network fallback)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If navigation fails, show offline page
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// ===== PUSH: receive push notifications =====
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (err) {
    payload = { body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'وفاء 💊';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: payload.badge || '/badge-72.png',
    tag: payload.tag || 'wafa-notification',
    data: payload.data || {},
    requireInteraction: payload.requireInteraction || false,
    vibrate: [100, 50, 100],
    actions: payload.actions || [],
    dir: 'rtl',
    lang: 'ar'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ===== NOTIFICATION CLICK: handle action buttons =====
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action, event.notification.data);

  const action = event.action;
  const data = event.notification.data || {};
  event.notification.close();

  let urlToOpen = '/dashboard';

  // Handle action buttons
  if (action === 'taken' && data.doseEventId) {
    // Confirm dose via API
    urlToOpen = `/dashboard?taken=${data.doseEventId}`;
    // Fire-and-forget API call
    fetch(`/api/v1/doses/${data.doseEventId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ takenVia: 'NOTIFICATION_ACTION' })
    }).catch(err => console.warn('[SW] Confirm dose failed:', err));
  } else if (action === 'skip' && data.doseEventId) {
    urlToOpen = `/dashboard?skipped=${data.doseEventId}`;
    fetch(`/api/v1/doses/${data.doseEventId}/skip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    }).catch(err => console.warn('[SW] Skip dose failed:', err));
  } else if (action === 'taken_all') {
    urlToOpen = '/dashboard?batch=taken';
  } else if (action === 'view') {
    if (data.medicationId) urlToOpen = `/medications/${data.medicationId}`;
    else if (data.patientId) urlToOpen = `/companion`;
  } else if (data.action === 'REFILL_REMINDER' && data.medicationId) {
    urlToOpen = `/medications/${data.medicationId}`;
  } else if (data.action === 'CAREGIVER_ALERT' && data.patientId) {
    urlToOpen = `/companion`;
  }

  // Focus existing window or open new one
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus an existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open a new window
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ===== NOTIFICATION CLOSE: track dismissal =====
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
  // Could log to analytics
});

// ===== MESSAGE: communicate with the page =====
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'GET_SUBSCRIPTION') {
    // Return current push subscription to the page
    self.registration.pushManager.getSubscription()
      .then((subscription) => {
        event.ports[0].postMessage({
          type: 'SUBSCRIPTION',
          subscription: subscription ? subscription.toJSON() : null
        });
      });
  }
});

// ===== PERIODIC SYNC (future: background dose sync) =====
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-doses') {
    event.waitUntil(syncDoses());
  }
});

async function syncDoses() {
  // TODO: fetch latest doses from API in background
  console.log('[SW] Periodic sync: doses');
}

// ===== BACKGROUND SYNC (retry failed API calls) =====
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-confirm-dose') {
    event.waitUntil(retryConfirmDose());
  }
});

async function retryConfirmDose() {
  // TODO: read pending confirmations from IndexedDB and retry
  console.log('[SW] Background sync: retry confirm dose');
}

console.log('[SW] وفاء Service Worker loaded ✅');
