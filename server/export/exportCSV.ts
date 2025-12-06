import { createClient } from "@supabase/supabase-js";
import { Parser } from "json2csv";

// TODO: replace with real env vars
const SUPABASE_URL = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "SUPABASE_SERVICE_ROLE_KEY_PLACEHOLDER";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ExportCSVOptions {
  companyId: string;
  startDate: string;
  endDate: string;
  includeMedia?: boolean;
}

export async function exportJobsCSV(opts: ExportCSVOptions) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, company_id, created_at, status, assigned_to, total_price")
    .eq("company_id", opts.companyId)
    .gte("created_at", opts.startDate)
    .lte("created_at", opts.endDate)
    .limit(5000);

  if (error) {
    console.error("exportJobsCSV error", error);
    return { csv: "", count: 0 };
  }

  const parser = new Parser({ fields: ["id", "company_id", "created_at", "status", "assigned_to", "total_price"] });
  const csv = parser.parse(data || []);

  return {
    csv,
    count: data?.length || 0,
  };
}
