import React, { useEffect, useState } from "react";
import { superAdminFetch } from "../../lib/session/companyContext";

interface CompanyDetail {
  id: string;
  name: string;
  status: string;
  owner_email: string;
  owner_phone?: string;
  created_at: string;
  storage_bytes?: number;
  workforce_count?: number;
  retention_media_days?: number;
}

interface JobRow {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function CompanyDetailPage() {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [status, setStatus] = useState("");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const companyId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";

  useEffect(() => {
    async function load() {
      if (!companyId) return;
      const resp = await superAdminFetch(`/api/super-admin/company/${companyId}`);
      if (resp.ok) {
        setCompany(await resp.json());
      }
      const jobsResp = await superAdminFetch(`/api/super-admin/company/${companyId}/jobs?limit=10`);
      if (jobsResp.ok) {
        const data = await jobsResp.json();
        setJobs(data.items || data || []);
      }
    }
    load();
  }, [companyId]);

  async function exportData() {
    setStatus("Export placeholder queued");
  }

  async function act(action: "suspend" | "reactivate") {
    if (!companyId) return;
    setStatus(`Running ${action}...`);
    await superAdminFetch(`/api/super-admin/company/${companyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setStatus(`${action} requested`);
  }

  if (!company) return <div className="p-6">Loading company...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{company.name}</h1>
          <div className="text-sm text-gray-600">Status: {company.status}</div>
        </div>
        <a href="/super-admin/audit" className="text-blue-600">Audit timeline</a>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Info label="Owner" value={company.owner_email} />
        <Info label="Phone" value={company.owner_phone || "masked"} />
        <Info label="Created" value={new Date(company.created_at).toLocaleString()} />
        <Info label="Storage" value={`${company.storage_bytes || 0} bytes`} />
        <Info label="Workforce" value={`${company.workforce_count || 0} people`} />
        <Info label="Retention" value={`${company.retention_media_days || 0} days media`} />
      </div>

      <div className="space-x-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={exportData}>
          Export data
        </button>
        <a className="text-blue-600" href="/super-admin/storage">Storage manager</a>
        {company.status === "active" ? (
          <button className="text-red-600" onClick={() => act("suspend")}>Suspend</button>
        ) : (
          <button className="text-green-600" onClick={() => act("reactivate")}>Reactivate</button>
        )}
      </div>

      <div className="border rounded">
        <div className="p-3 font-medium">Recent jobs</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-b">
                <td className="p-2 font-mono text-xs">{j.id}</td>
                <td className="p-2">{j.title || "Job"}</td>
                <td className="p-2">{j.status}</td>
                <td className="p-2">{new Date(j.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td className="p-3 text-gray-500" colSpan={4}>No jobs yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status && <div className="text-sm">{status}</div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded p-3">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
