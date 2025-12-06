import { useEffect, useState } from "react";
import { listFeedback, markResolved, submitFeedback, Feedback, FeedbackStatus, FeedbackType } from "../../services/feedbackService";

// Simple admin dashboard for feedback. Uses stubbed service until backend is wired.

const statuses: FeedbackStatus[] = ["open", "resolved", "archived"];
const types: FeedbackType[] = ["bug", "idea", "praise", "other"];

export default function FeedbackDashboard() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "">("");
  const companyId = "company-1"; // TODO: replace with real company context

  const load = async () => {
    const data = await listFeedback(companyId, {
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    });
    setItems(data);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, typeFilter]);

  const resolve = async (id: string) => {
    await markResolved(id, "admin-1"); // TODO: use real resolver id
    await load();
  };

  const quickAdd = async () => {
    await submitFeedback(companyId, "admin-1", "idea", "Placeholder admin-created feedback", { source: "admin-ui" });
    await load();
  };

  return (
    <div className="p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Feedback Dashboard</h1>
        <div className="space-x-2">
          <button className="px-3 py-1 border rounded" onClick={quickAdd}>Add Test Feedback</button>
          <button className="px-3 py-1 border rounded" onClick={load}>Refresh</button>
        </div>
      </header>

      <section className="flex space-x-3">
        <label className="flex flex-col text-sm">
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | "")}> 
            <option value="">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          Type
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FeedbackType | "")}> 
            <option value="">All</option>
            {types.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </section>

      <div className="grid gap-3">
        {items.map((fb) => (
          <div key={fb.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{fb.type.toUpperCase()} — {fb.status}</p>
                <p className="text-sm text-gray-700">{fb.message}</p>
                <p className="text-xs text-gray-500">{fb.created_at}</p>
              </div>
              {fb.status !== "resolved" && (
                <button className="px-2 py-1 border rounded" onClick={() => void resolve(fb.id)}>
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-600">No feedback yet.</p>}
      </div>
    </div>
  );
}
