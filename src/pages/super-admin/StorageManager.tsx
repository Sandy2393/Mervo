import { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

interface Usage {
  company_id: string;
  total_bytes: number;
  top_folders: Array<{ path: string; bytes: number }>;
  estimated_monthly_cost_usd: number;
}

export default function StorageManager() {
  const [companyId, setCompanyId] = useState("demo");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load(companyId);
  }, [companyId]);

  async function load(id: string) {
    const resp = await authedFetch(`/api/storage/usage?company_id=${id}`);
    if (resp.ok) setUsage(await resp.json());
  }

  function runPreview() {
    setStatus("Cleanup preview queued (placeholder)");
  }

  function triggerArchive() {
    setStatus("Archive scheduled (placeholder)");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Storage Manager</h1>
        <input className="border p-2 rounded" value={companyId} onChange={(e) => setCompanyId(e.target.value)} />
      </div>

      {usage && (
        <div className="grid grid-cols-3 gap-4">
          <Card title="Total" value={`${usage.total_bytes.toLocaleString()} bytes`} />
          <Card title="Est. monthly" value={`$${usage.estimated_monthly_cost_usd.toFixed(2)}`} />
          <Card title="Company" value={usage.company_id} />
        </div>
      )}

      <div className="border rounded">
        <div className="p-3 font-medium flex items-center justify-between">
          <span>Top folders</span>
          <div className="space-x-2 text-sm">
            <button className="text-blue-600" onClick={runPreview}>Run cleanup preview</button>
            <button className="text-blue-600" onClick={triggerArchive}>Trigger archive</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Path</th>
              <th className="p-2">Bytes</th>
            </tr>
          </thead>
          <tbody>
            {usage?.top_folders?.map((f) => (
              <tr key={f.path} className="border-b">
                <td className="p-2 font-mono text-xs">{f.path}</td>
                <td className="p-2">{f.bytes.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status && <div className="text-sm">{status}</div>}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="border rounded p-4">
      <div className="text-xs text-gray-600">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
