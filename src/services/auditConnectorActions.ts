// Placeholder audit helper. TODO: implement backing audit service / DB table.

type AuditEvent = {
  actorId?: string;
  companyId?: string;
  action: string;
  target: string;
  metadata?: Record<string, any>;
};

export async function recordAudit(event: AuditEvent) {
  console.log("audit", event);
}
