import React, { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

interface Company {
  id: string;
  name: string;
  status: string;
  owner_email: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const resp = await authedFetch("/api/super-admin/companies");
    if (resp.ok) {
      const data = await resp.json();
      setCompanies(data);
    }
  }

  async function act(companyId: string, action: string) {
    setStatus(`Running ${action}...`);
    const resp = await authedFetch(`/api/super-admin/company/${companyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setStatus(resp.ok ? `${action} done` : "Action failed");
    load();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Super Admin</h1>
        <a href="/super-admin/prelaunch" className="text-blue-600 text-sm">Pre-launch readiness</a>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Companies" value={companies.length} />
        <StatCard label="Active" value={companies.filter((c) => c.status === "active").length} />
        <StatCard label="Suspended" value={companies.filter((c) => c.status === "suspended").length} />
      </div>

      <div className="border rounded">
        <div className="p-3 font-medium flex items-center justify-between">
          <span>Companies</span>
          <div className="space-x-3 text-sm">
            <a href="/super-admin/audit" className="text-blue-600">Audit viewer</a>
            <a href="/super-admin/storage" className="text-blue-600">Storage manager</a>
            <a href="/super-admin/offline" className="text-blue-600">Offline center</a>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Name</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Status</th>
              <th className="p-2">Created</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b">
                <td className="p-2"><a className="text-blue-600" href={`/super-admin/company/${c.id}`}>{c.name}</a></td>
                <td className="p-2">{c.owner_email}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  {c.status === "active" ? (
                    <button className="text-red-600" onClick={() => act(c.id, "suspend")}>Suspend</button>
                  ) : (
                    <button className="text-green-600" onClick={() => act(c.id, "reactivate")}>Reactivate</button>
                  )}
                  <button className="text-sm" onClick={() => act(c.id, "temp_password")}>Temp password</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status && <div className="text-sm text-gray-700">{status}</div>}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
