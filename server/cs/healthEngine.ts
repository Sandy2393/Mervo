import rules from "./healthRules.json" assert { type: "json" };
import { CrmSyncService } from "./crmSyncService";

// Health scoring engine (stub). Replace in-memory data with DB queries.

type CompanyMetrics = {
  company_id: string;
  jobs_per_week: number;
  overdue_approvals: number;
  storage_growth_pct: number;
};

type Alert = { id: string; company_id: string; ruleId: string; severity: string; message: string; resolved?: boolean };

const activeAlerts: Alert[] = [];

export class HealthEngine {
  constructor(private crmSync = new CrmSyncService()) {}

  computeHealthScore(company_id: string, metrics: CompanyMetrics) {
    let score = 100;
    rules.forEach((rule: any) => {
      const val = (metrics as any)[rule.metric];
      if (this.violates(rule.op, val, rule.threshold)) {
        score -= rule.severity === "high" ? 30 : rule.severity === "medium" ? 20 : 10;
        const alert: Alert = {
          id: `${company_id}-${rule.id}`,
          company_id,
          ruleId: rule.id,
          severity: rule.severity,
          message: `${rule.metric} ${rule.op} ${rule.threshold}`,
        };
        activeAlerts.push(alert);
        this.crmSync.syncHealthSignal(company_id, { type: rule.id, severity: rule.severity, details: alert.message });
      }
    });
    return Math.max(score, 0);
  }

  listActiveHealthAlerts() {
    return activeAlerts.filter((a) => !a.resolved);
  }

  markAlertResolved(alertId: string, resolverId: string) {
    const alert = activeAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.message += ` (resolved by ${resolverId})`;
    }
    return alert;
  }

  private violates(op: string, value: number, threshold: number) {
    if (value === undefined || value === null) return false;
    switch (op) {
      case "<":
        return value < threshold;
      case ">":
        return value > threshold;
      case "<=":
        return value <= threshold;
      case ">=":
        return value >= threshold;
      default:
        return false;
    }
  }
}
