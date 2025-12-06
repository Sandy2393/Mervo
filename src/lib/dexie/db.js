/**
 * Dexie Database Setup
 * IndexedDB for offline queueing and local caching
 * NOTE: Dexie will be installed in the next phase
 */
// TODO: import Dexie, { type Table } from 'dexie';
export class MervoDatabase {
    constructor() {
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cachedJobInstances", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cachedTimesheets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // TODO: Connect to real Dexie instance
        this.queue = [];
        this.cachedJobInstances = [];
        this.cachedTimesheets = [];
    }
}
export const db = new MervoDatabase();
// Initialize offline service with DB
import { setOfflineDb } from '../../services/offlineQueueService';
setOfflineDb(db);
export default db;
