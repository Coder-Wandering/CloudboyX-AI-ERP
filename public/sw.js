/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CloudboyX Enterprise Suite - Progressive Web App Service Worker
 * Optimized for ChromeOS / Chromebook native installation, offline caching, and desktop shelf launch.
 */

const CACHE_NAME = 'cloudboyx-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/CloudboyX_Enterprise_Platform_Guide.pdf'
];

// Install event: Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[CloudboyX SW] Pre-caching offline app shell for Chromebook / ChromeOS');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[CloudboyX SW] Pre-cache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event: Clean up stale caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[CloudboyX SW] Clearing deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: Network-first with cache fallback for offline resilience
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip chrome-extension / non-http schemes
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // API endpoints are network-authoritative
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for offline use
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback to cache when offline
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to an HTML page while offline, return the cached index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html') || caches.match('/');
        }
        return new Response('Network connection offline', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
