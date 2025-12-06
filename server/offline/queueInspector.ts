interface OfflineItem {
  id: string;
  company_id: string;
  type: string;
  payload: any;
  status: "pending" | "processing" | "resolved" | "failed";
  attempts: number;
  last_error?: string;
  updated_at: string;
}

const queue: OfflineItem[] = [];
const processedIds = new Set<string>();

function nowIso() {
  return new Date().toISOString();
}

export class QueueInspector {
  addItem(item: Omit<OfflineItem, "updated_at" | "attempts" | "status"> & { status?: OfflineItem["status"] }) {
    const newItem: OfflineItem = {
      ...item,
      status: item.status || "pending",
      attempts: 0,
      updated_at: nowIso(),
    };
    queue.push(newItem);
    return newItem;
  }

  listPendingSyncs(company_id?: string) {
    return queue.filter((q) => q.status === "pending" && (!company_id || q.company_id === company_id));
  }

  reprocessItem(itemId: string) {
    if (processedIds.has(itemId)) {
      return { id: itemId, status: "deduplicated" };
    }
    const item = queue.find((q) => q.id === itemId);
    if (!item) throw new Error("Item not found");
    item.status = "processing";
    item.attempts += 1;
    processedIds.add(itemId);
    // Placeholder: simulate success
    item.status = "resolved";
    item.updated_at = nowIso();
    return item;
  }

  markResolved(itemId: string) {
    const item = queue.find((q) => q.id === itemId);
    if (!item) throw new Error("Item not found");
    item.status = "resolved";
    item.updated_at = nowIso();
    return item;
  }

  metrics() {
    const total = queue.length;
    const resolved = queue.filter((q) => q.status === "resolved").length;
    const failed = queue.filter((q) => q.status === "failed").length;
    return { total, resolved, failed, success_rate: total ? resolved / total : 1 };
  }
}

export const queueInspector = new QueueInspector();
