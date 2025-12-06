import { useState } from "react";
import { RecurringSchedulerEditor } from "../../components/jobs/RecurringSchedulerEditor";

export default function JobCreate() {
  const [form, setForm] = useState({ name: "", description: "", payment_cents: 0, is_recurring: false, recurrence: {} as any });
  const [message, setMessage] = useState("");

  const submit = async () => {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage(res.ok ? "Created" : "Failed");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create Job</h1>
      <input
        className="border px-3 py-2 rounded w-full"
        placeholder="Job name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <textarea
        className="border px-3 py-2 rounded w-full"
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} />
        <span>Recurring</span>
      </label>
      {form.is_recurring && (
        <RecurringSchedulerEditor value={form.recurrence} onChange={(v) => setForm({ ...form, recurrence: v })} />
      )}
      <div>
        <label className="text-sm font-semibold">Payment (cents)</label>
        <input
          type="number"
          className="border px-3 py-2 rounded w-full"
          value={form.payment_cents}
          onChange={(e) => setForm({ ...form, payment_cents: Number(e.target.value) })}
        />
      </div>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>
        Create
      </button>
      {message && <div>{message}</div>}
    </div>
  );
}
