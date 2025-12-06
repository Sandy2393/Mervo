# PWA and Background Sync (Mervo)

This guide describes how the PWA and background sync are intended to work in the Mervo app.

## What is included

- `public/manifest.webmanifest` — PWA metadata for installability
- `src/registerServiceWorker.ts` — client-side helper to register the service worker and request background sync
- `src/lib/pwa/sw.js` — service worker (precaching and simple fetch strategy)
- `src/lib/dexie/syncWorker.ts` — background sync implementation that drains the offline queue

## Behavior

- The service worker precaches core assets and uses a network-first strategy for API calls and cache-first for static assets.
- When background sync triggers (`sync` event) the SW posts a message to clients to run queue synchronization.
- Client-side `syncWorker` reads queued offline actions from Dexie and attempts to replay them to the server via existing services.
- A simple exponential backoff strategy is used for retries. After repeated failures, items are marked failed for manual review.

## Testing

- To test offline behavior locally, you can use browser devtools:
  1. Open DevTools > Application > Service Workers and register the service worker.
  2. Use DevTools > Network > Offline to simulate offline mode.
  3. Attempt actions in the app (e.g., upload photos, clock in/out) and confirm they appear in the offline queue (Dexie stub) and send sync when going back online.

## Limitations

- Browser support for background sync varies. Test on real browsers (Chrome/Edge) — Safari has limited support.
- Credentials & long-lived secrets should not be stored inside the service worker. Implement server-side token handling and refresh.
- For large uploads (photos) the SW can trigger a message to clients to flush uploads; actual upload must be done server-side with signed URLs when possible.

## TODO

- Add server-side endpoints (Edge Functions) to accept uploads and return signed URLs, then update DB records.
- Implement more robust queue storage (real Dexie DB) and visibility into failed items for Operations team.
