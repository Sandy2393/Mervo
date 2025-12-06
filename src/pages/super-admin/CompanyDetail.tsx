import React, { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

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

export default function CompanyDetailPage() {
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [status, setStatus] = useState("");
  const companyId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() || "" : "";

  useEffect(() => {
    async function load() {
      if (!companyId) return;
      const resp = await authedFetch(`/api/super-admin/company/${companyId}`);
      if (resp.ok) {
        setCompany(await resp.json());
      }
    }
    load();
  }, [companyId]);

  async function exportData() {
    setStatus("Export placeholder queued");
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
