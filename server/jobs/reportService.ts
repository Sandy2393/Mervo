import { v4 as uuid } from "uuid";

const reports: any[] = [];
const photos: any[] = [];

function nowIso() {
  return new Date().toISOString();
}

export class ReportService {
  constructor(private audit: (entry: any) => void = () => {}) {}

  async submitReport(jobInstanceId: string, reporterId: string, description: string, photosInput: any[], checklist: any, answers: any) {
    const report = {
      id: uuid(),
      job_instance_id: jobInstanceId,
      reporter_user_id: reporterId,
      description,
      checklist,
      answers,
      status: "submitted",
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    reports.push(report);

    photosInput.forEach((p) => {
      photos.push({ id: uuid(), job_instance_id: jobInstanceId, type: p.type, storage_path: p.path, metadata: p.meta });
    });

    this.audit({ action: "report.submit", report_id: report.id, job_instance_id: jobInstanceId });
    return report;
  }

  async reviewReport(reportId: string, approverId: string, status: "approved" | "rejected", comment?: string) {
    const report = reports.find((r) => r.id === reportId);
    if (!report) throw new Error("report not found");
    report.status = status;
    report.approver_user_id = approverId;
    report.approval_comment = comment;
    report.approved_at = status === "approved" ? nowIso() : null;
    report.updated_at = nowIso();
    this.audit({ action: "report.review", report_id: reportId, status, approverId });
    return report;
  }
}
