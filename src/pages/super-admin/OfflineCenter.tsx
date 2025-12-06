import React, { useEffect, useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

interface PendingItem {
  id: string;
  company_id: string;
  type: string;
  status: string;
  attempts: number;
  updated_at: string;
}

export default function OfflineCenter() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const resp = await authedFetch("/api/offline/pending");
    if (resp.ok) {
      const data = await resp.json();
      setItems(data.pending || []);
      setStatus(`Success rate ${(data.metrics?.success_rate ?? 1) * 100}%`);
    }
  }

  async function reprocess(id: string) {
    setStatus("Reprocessing...");
    const resp = await authedFetch("/api/offline/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reprocess", item_id: id }),
    });
    setStatus(resp.ok ? "Reprocessed" : "Failed");
    load();
  }

  async function resolve(id: string) {
    setStatus("Resolving...");
    const resp = await authedFetch("/api/offline/pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve", item_id: id }),
    });
    setStatus(resp.ok ? "Resolved" : "Failed");
    load();
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Offline Resilience Center</h1>
        <span className="text-sm text-gray-600">{status}</span>
      </div>

      <div className="border rounded">
        <div className="p-3 font-medium">Pending sync items</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">ID</th>
              <th className="p-2">Company</th>
              <th className="p-2">Type</th>
              <th className="p-2">Attempts</th>
              <th className="p-2">Updated</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="p-2 font-mono text-xs">{i.id}</td>
                <td className="p-2">{i.company_id}</td>
                <td className="p-2">{i.type}</td>
                <td className="p-2">{i.attempts}</td>
                <td className="p-2">{new Date(i.updated_at).toLocaleString()}</td>
                <td className="p-2 space-x-2">
                  <button className="text-blue-600" onClick={() => reprocess(i.id)}>Retry</button>
                  <button className="text-green-600" onClick={() => resolve(i.id)}>Resolve</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
