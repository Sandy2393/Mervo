import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "offlineQueue";
const MAX_ITEMS = 200;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

type QueueItem = {
  id: string;
  type: string;
  jobId?: string;
  path?: string;
  payload?: any;
  at: string;
  attempts?: number;
};

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function enqueueAction(item: Omit<QueueItem, "id">) {
  const existing = await getQueue();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const next: QueueItem = { ...item, id, attempts: item.attempts ?? 0 };
  const trimmed = gc([...existing, next]);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
}

export async function getQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueueItem[];
  } catch (e) {
    return [];
  }
}

export async function getQueueLength() {
  const q = await getQueue();
  return q.length;
}

export async function popNext(): Promise<QueueItem | undefined> {
  const q = await getQueue();
  const next = q.shift();
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  return next;
}

export async function drainQueueWithBackoff() {
  let delay = 500;
  for (;;) {
    const item = await popNext();
    if (!item) return;
    try {
      await processItem(item);
      delay = 500;
    } catch (e) {
      const attempts = (item.attempts ?? 0) + 1;
      if (attempts > 5) continue;
      await enqueueAction({ ...item, attempts });
      delay = Math.min(delay * 2, 10000);
    }
    await wait(delay);
  }
}

async function processItem(item: QueueItem) {
  // TODO: replace with real SDK calls. For now, log placeholder.
  console.log("Syncing", item.type, item.jobId ?? "");
}

function gc(items: QueueItem[]) {
  const cutoff = Date.now() - RETENTION_MS;
  const filtered = items.filter((i) => new Date(i.at).getTime() >= cutoff).slice(-MAX_ITEMS);
  return filtered;
}