export function storagePathForPhoto(companyId: string, jobInstanceId: string, type: "before" | "after") {
  const date = new Date().toISOString().slice(0, 10);
  return `company/${companyId}/jobs/${jobInstanceId}/photos/${type}/${date}_${crypto.randomUUID()}.jpg`;
}

export function storagePathForReportPdf(companyId: string, reportId: string) {
  return `company/${companyId}/reports/report_${reportId}.pdf`;
}

export function storagePathForBulkZip(companyId: string, yearMonth: string, zipId: string) {
  return `company/${companyId}/${yearMonth}/reports_${zipId}.zip`;
}
