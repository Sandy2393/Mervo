import React, { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

interface AuditRow {
  id: string;
  action: string;
  actor?: string;
  target?: string;
  created_at: string;
}

export default function AuditViewer() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [filters, setFilters] = useState({ company_id: "", actor: "", action: "" });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && qs.append(k, v));
    const resp = await authedFetch(`/api/audit/logs?${qs.toString()}`);
    if (resp.ok) setRows(await resp.json());
  }

  function exportCsv() {
    const header = "id,action,actor,target,created_at";
    const body = rows.map((r) => `${r.id},${r.action},${r.actor || ""},${r.target || ""},${r.created_at}`);
    const blob = new Blob([header + "\n" + body.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Viewer</h1>
        <button className="text-blue-600 text-sm" onClick={exportCsv} disabled={!rows.length}>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <input className="border p-2 rounded" placeholder="Company ID" value={filters.company_id} onChange={(e) => setFilters({ ...filters, company_id: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Actor" value={filters.actor} onChange={(e) => setFilters({ ...filters, actor: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={load}>Apply</button>
      </div>

      <div className="border rounded">
        <div className="p-3 font-medium">Timeline</div>
        <div className="max-h-96 overflow-auto">
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs">{r.id}</div>
                  <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm">{r.action}</div>
                <div className="text-xs text-gray-600">actor: {r.actor || "n/a"} — target: {r.target || "n/a"}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
