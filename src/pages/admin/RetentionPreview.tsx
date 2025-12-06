import React, { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId } from "../../lib/session/companyContext";

interface PreviewItem {
  id: string;
  type: string;
  created_at: string;
  category: string;
}

interface PreviewResponse {
  counts: { media: number; metadata: number };
  samples: PreviewItem[];
  cutoff_media: string | null;
  cutoff_meta: string | null;
}

export default function RetentionPreview() {
  const companyId = getActiveCompanyId();
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    async function load() {
      if (!companyId) return;
      const resp = await authedFetch(`/api/retention/preview?company_id=${companyId}`);
      if (resp.ok) {
        const data = await resp.json();
        setPreview(data);
      }
    }
    load();
  }, [companyId]);

  function exportCsv() {
    if (!preview) return;
    const header = "id,type,created_at,category";
    const rows = preview.samples.map((s) => `${s.id},${s.type},${s.created_at},${s.category}`);
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retention_preview_${companyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function runSoftMark() {
    if (!companyId) return;
    if (!window.confirm("Soft-mark items for deletion?")) return;
    const resp = await authedFetch(`/api/retention/run-soft-sweep?company_id=${companyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = await resp.json();
    setStatus(resp.ok ? data.message || "Soft sweep queued" : data.error || "Failed");
  }

  async function runHardDelete() {
    if (!companyId) return;
    if (!window.confirm("Export backups before deleting?")) return;
    if (!window.confirm("This will permanently delete items. Type OK to proceed.")) return;
    const resp = await authedFetch(`/api/retention/run-hard-delete?company_id=${companyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    const data = await resp.json();
    setStatus(resp.ok ? data.message || "Hard delete simulated" : data.error || "Failed");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Retention Preview</h1>
        <button className="text-blue-600 text-sm" onClick={exportCsv} disabled={!preview}>
          Export CSV
        </button>
      </div>

      {preview ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Media to delete</div>
              <div className="text-2xl font-bold">{preview.counts.media}</div>
              <div className="text-xs text-gray-500">Cutoff: {preview.cutoff_media || "n/a"}</div>
            </div>
            <div className="border rounded p-3">
              <div className="text-sm text-gray-600">Metadata to delete</div>
              <div className="text-2xl font-bold">{preview.counts.metadata}</div>
              <div className="text-xs text-gray-500">Cutoff: {preview.cutoff_meta || "n/a"}</div>
            </div>
          </div>

          <div className="border rounded">
            <div className="p-3 font-medium">Sample items (first 50 metadata-only rows)</div>
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">ID</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.samples.map((s) => (
                    <tr key={s.id} className="border-b">
                      <td className="p-2 font-mono text-xs">{s.id}</td>
                      <td className="p-2">{s.type}</td>
                      <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="p-2">{s.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={runSoftMark}>
              Soft-mark
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={runHardDelete}>
              Execute hard delete
            </button>
            {status && <span className="text-sm">{status}</span>}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-600">No preview available.</div>
      )}
    </div>
  );
}
