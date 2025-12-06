// Minimal IndexedDB-like queue placeholder. Replace with Dexie/real implementation.
const memory = [];
export const offlineQueue = {
    async enqueue(item) {
        const entry = {
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
