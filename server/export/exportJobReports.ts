import JSZip from "jszip";
import { createClient } from "@supabase/supabase-js";
import { moveToArchive } from "../storage/archivePlaceholder";

// TODO: replace with real env vars
const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "SUPABASE_SERVICE_ROLE_KEY_PLACEHOLDER";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ExportOptions {
  companyId: string;
  startDate: string;
  endDate: string;
  includePhotos?: boolean;
  archiveAfter?: boolean;
}

export async function exportJobReports(opts: ExportOptions) {
  const zip = new JSZip();
  const reports = await fetchReports(opts.companyId, opts.startDate, opts.endDate);

  for (const report of reports) {
    const folderPath = `${report.company_slug || opts.companyId}/${report.month}/${report.type}`;
    const folder = zip.folder(folderPath);
    if (!folder) continue;

    folder.file("job.json", JSON.stringify(report, null, 2));
    folder.file("report.txt", report.summary || "");

    if (opts.includePhotos && report.beforePhotos) {
      const beforeFolder = folder.folder("before");
      report.beforePhotos.forEach((p: any, idx: number) => {
        beforeFolder?.file(`${idx + 1}.txt`, `TODO: download photo ${p.storage_path}`);
      });
    }
    if (opts.includePhotos && report.afterPhotos) {
      const afterFolder = folder.folder("after");
      report.afterPhotos.forEach((p: any, idx: number) => {
        afterFolder?.file(`${idx + 1}.txt`, `TODO: download photo ${p.storage_path}`);
      });
    }
  }

  const content = await zip.generateAsync({ type: "base64" });

  if (opts.archiveAfter) {
    await moveToArchive(reports.map((r: any) => r.id));
  }

  return {
    base64Zip: content,
    count: reports.length,
  };
}

async function fetchReports(companyId: string, start: string, end: string) {
  // TODO: Replace with real query joining reports and photos
  const { data, error } = await supabase
    .from("job_reports")
    .select("id, company_id, summary, created_at, type, company_slug")
    .eq("company_id", companyId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) {
    console.error("fetchReports error", error);
    return [];
  }

  // Placeholder to attach photos
  return (data || []).map((r: any) => ({
    ...r,
    month: r.created_at?.slice(0, 7) || "unknown",
    beforePhotos: [],
    afterPhotos: [],
    type: r.type || "OneOff",
  }));
}
