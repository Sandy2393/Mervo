import { useMemo } from "react";
import CostChart from "../../components/admin/CostChart";
import BudgetModal from "../../components/admin/BudgetModal";

interface CostPoint { date: string; cost: number; }
interface CompanyCost { company_id: string; cost: number; storage_bytes: number; }

const demoSeries: CostPoint[] = [
  { date: "2025-11-28", cost: 120 },
  { date: "2025-11-29", cost: 130 },
  { date: "2025-11-30", cost: 110 },
  { date: "2025-12-01", cost: 140 },
  { date: "2025-12-02", cost: 150 },
];

const demoCompanies: CompanyCost[] = [
  { company_id: "company-alpha", cost: 420, storage_bytes: 120_000_000_000 },
  { company_id: "company-beta", cost: 310, storage_bytes: 80_000_000_000 },
  { company_id: "company-gamma", cost: 190, storage_bytes: 55_000_000_000 },
];

export default function CostDashboard() {
  const total30d = useMemo(() => demoSeries.reduce((sum, p) => sum + p.cost, 0), []);
  const trend7d = "+6%"; // TODO: compute from backend data
  const trend30d = "+12%"; // TODO

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cost Dashboard</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded">Run cost report</button>
          <button className="px-3 py-1 border rounded">Export CSV</button>
          <BudgetModal triggerLabel="Set budget" />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded p-3">
          <p className="text-sm text-gray-600">Estimated cost (last 30d)</p>
          <p className="text-2xl font-semibold">${total30d.toFixed(2)}</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-sm text-gray-600">Trend 7d</p>
          <p className="text-xl">{trend7d}</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-sm text-gray-600">Trend 30d</p>
          <p className="text-xl">{trend30d}</p>
        </div>
      </section>

      <section className="border rounded p-3">
        <h2 className="font-semibold mb-2">Cost Trend</h2>
        <CostChart series={demoSeries} />
      </section>

      <section className="border rounded p-3">
        <h2 className="font-semibold mb-2">Per-company breakdown (top 20)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Cost (30d)</th>
                <th className="p-2 text-left">Storage (GB)</th>
              </tr>
            </thead>
            <tbody>
              {demoCompanies.map((c) => (
                <tr key={c.company_id} className="border-t">
                  <td className="p-2">{c.company_id}</td>
                  <td className="p-2">${c.cost.toFixed(2)}</td>
                  <td className="p-2">{(c.storage_bytes / 1_000_000_000).toFixed(1)}</td>
                </tr>
              ))}
              {demoCompanies.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-2 text-center text-gray-600">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border rounded p-3">
        <h2 className="font-semibold mb-2">Top cost drivers</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700">
          <li>Storage growth (photos)</li>
          <li>Egress spikes (report downloads)</li>
          <li>Function invocations (webhooks)</li>
        </ul>
      </section>

      <section className="border rounded p-3">
        <h2 className="font-semibold mb-2">Storage usage heatmap (per company)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {demoCompanies.map((c) => (
            <div key={c.company_id} className="p-2 border rounded">
              <p className="font-medium">{c.company_id}</p>
              <p>{(c.storage_bytes / 1_000_000_000).toFixed(1)} GB</p>
            </div>
          ))}
          {demoCompanies.length === 0 && <p>No data available</p>}
        </div>
      </section>
    </div>
  );
}
