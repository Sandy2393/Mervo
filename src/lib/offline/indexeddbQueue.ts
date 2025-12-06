// Minimal IndexedDB-like queue placeholder. Replace with Dexie/real implementation.

type QueueItem = { id: string; type: string; payload: any; created_at: string; idempotency_key?: string };
const memory: QueueItem[] = [];

export const offlineQueue = {
  async enqueue(item: Omit<QueueItem, "id" | "created_at">) {
    const entry: QueueItem = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...item,
    };
    memory.push(entry);
    return entry;
  },
  async all() {
    return memory.slice();
  },
  async clear() {
    memory.length = 0;
  },
};
