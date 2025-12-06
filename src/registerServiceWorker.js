// Registers the Service Worker and exposes helper to request background sync
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/src/lib/pwa/sw.js').then(reg => {
            console.log('Service Worker registered', reg);
            // Listen for updates
            if (reg.waiting) {
                // There is an update ready
                console.log('Service worker waiting — new SW available');
            }
            reg.addEventListener('updatefound', () => {
                console.log('Service worker update found');
            });
        }).catch(err => console.error('SW registration failed', err));
    }
}
// Request a one-off background sync event if supported
export async function requestBackgroundSync(tag = 'sync-queue') {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
        console.warn('Background Sync not supported');
        return false;
    }
    try {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register(tag);
        return true;
    }
    catch (err) {
        console.error('Failed to register background sync', err);
        return false;
    }
}
