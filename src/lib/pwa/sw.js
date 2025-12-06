"use strict";
// @ts-nocheck
/*
  Minimal Service Worker for Mervo (placeholder)
  - Precaches a small list of assets
  - Network-first for /api/* (attempt remote then fallback)
  - Cache-first for static assets
  - Implements 'sync' event to notify client-side sync worker

  TODO: Do not store long-lived auth tokens in SW; obtain short-lived tokens server-side or via secure messaging.
*/
const CACHE_NAME = 'mervo-static-v1';
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/src/main.js',
    '/assets/index.css'
];
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    // Clean up old caches if necessary
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve(true)))));
    self.clients.claim();
});
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    // Network-first for API calls
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/src/services/')) {
        event.respondWith(fetch(req).catch(() => caches.match(req)));
        return;
    }
    // Cache-first for static assets
    event.respondWith(caches.match(req).then(res => res || fetch(req)));
});
// Background sync events — trigger client-side sync worker via client messaging
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-queue') {
        event.waitUntil(doBackgroundSync());
    }
});
async function doBackgroundSync() {
    try {
        // Find all clients and postMessage to trigger client-side sync worker
        const allClients = await self.clients.matchAll({ includeUncontrolled: true });
        for (const client of allClients) {
            client.postMessage({ type: 'RUN_QUEUE_SYNC' });
        }
    }
    catch (err) {
        // logging only
        console.error('Background sync run failed', err);
    }
}
// Message handler from client for one-off tasks
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data && data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
// Security note: Service Workers run in a secure context (HTTPS) and are not suitable for storing
// long-lived secrets. Authentication tokens should be short-lived or exchanged server-side where possible.
