/**
 * Offline Queue Service — Dexie-based offline queueing
 * Queues actions when offline, syncs when reconnected
 */
// This will be populated after Dexie DB is created
let db = null;
export const setOfflineDb = (dexieDb) => {
    db = dexieDb;
};
class OfflineQueueService {
    /**
     * Queue an action for offline sync
     */
    async queueAction(type, payload) {
        if (!db) {
            throw new Error('Offline DB not initialized');
        }
        const action = {
            type,
            payload,
            timestamp: Date.now(),
            retries: 0,
            status: 'pending'
        };
        const id = await db.queue.add(action);
        return {
            id: id.toString(),
            ...action
        };
    }
    /**
     * Get pending actions
     */
    async getPendingActions() {
        if (!db)
            return [];
        return db.queue.where('status').equals('pending').toArray();
    }
    /**
     * Mark action as synced
     */
    async markSynced(actionId) {
        if (!db)
            return;
        await db.queue.update(actionId, { status: 'synced' });
    }
    /**
     * Mark action as failed and increment retry counter
     */
    async markFailed(actionId, maxRetries = 3) {
        if (!db)
            return;
        const action = await db.queue.get(actionId);
        if (!action)
            return;
        const newRetries = (action.retries || 0) + 1;
        const status = newRetries >= maxRetries ? 'failed' : 'pending';
        await db.queue.update(actionId, {
            retries: newRetries,
            status
        });
    }
    /**
     * Clear all failed actions
     */
    async clearFailed() {
        if (!db)
            return;
        await db.queue.where('status').equals('failed').delete();
    }
    /**
     * Clear all synced actions
     */
    async clearSynced() {
        if (!db)
            return;
        await db.queue.where('status').equals('synced').delete();
    }
    /**
     * Get queue stats
     */
    async getQueueStats() {
        if (!db) {
            return { pending: 0, synced: 0, failed: 0, total: 0 };
        }
        const pending = await db.queue.where('status').equals('pending').count();
        const synced = await db.queue.where('status').equals('synced').count();
        const failed = await db.queue.where('status').equals('failed').count();
        return {
            pending,
            synced,
            failed,
            total: pending + synced + failed
        };
    }
}
export const offlineQueueService = new OfflineQueueService();
