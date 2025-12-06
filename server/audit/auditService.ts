export interface AuditLogEntry {
  id: string;
  action: string;
  actor?: string;
  target?: string;
  meta?: any;
  created_at: string;
}

export interface AuditFilters {
  company_id?: string;
  actor?: string;
  action?: string;
  from?: string;
  to?: string;
}

export interface Pagination {
  limit?: number;
  offset?: number;
}

const auditStore: AuditLogEntry[] = [];

function nowIso() {
  return new Date().toISOString();
}

export function addAudit(entry: Omit<AuditLogEntry, "id" | "created_at">) {
  auditStore.push({ ...entry, id: `${auditStore.length + 1}`, created_at: nowIso() });
}

export class AuditService {
  queryAuditLogs(filters: AuditFilters = {}, pagination: Pagination = {}) {
    let items = auditStore;
    if (filters.company_id) items = items.filter((a) => a.meta?.company_id === filters.company_id || a.target === filters.company_id);
    if (filters.actor) items = items.filter((a) => a.actor === filters.actor);
    if (filters.action) items = items.filter((a) => a.action === filters.action);
    if (filters.from) items = items.filter((a) => new Date(a.created_at) >= new Date(filters.from!));
    if (filters.to) items = items.filter((a) => new Date(a.created_at) <= new Date(filters.to!));
    const start = pagination.offset || 0;
    const end = pagination.limit ? start + pagination.limit : undefined;
    return items.slice(start, end);
  }

  exportAuditCsv(filters: AuditFilters = {}) {
    const rows = this.queryAuditLogs(filters, {});
    const header = "id,action,actor,target,created_at";
    const body = rows.map((r) => `${r.id},${r.action},${r.actor || ""},${r.target || ""},${r.created_at}`);
    return [header, ...body].join("\n");
  }
}

export const auditService = new AuditService();
