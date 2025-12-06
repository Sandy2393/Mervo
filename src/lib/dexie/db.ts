/**
 * Dexie Database Setup
 * IndexedDB for offline queueing and local caching
 * NOTE: Dexie will be installed in the next phase
 */

// TODO: import Dexie, { type Table } from 'dexie';

export class MervoDatabase {
  queue!: any[];
  cachedJobInstances!: any[];
  cachedTimesheets!: any[];

  constructor() {
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
