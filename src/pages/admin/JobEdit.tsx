import { useEffect, useState } from "react";
import { RecurringSchedulerEditor } from "../../components/jobs/RecurringSchedulerEditor";

export default function JobEdit() {
  const jobId = "job_placeholder"; // replace with router param
  const [form, setForm] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then(setForm);
  }, [jobId]);

  if (!form) return <div className="p-6">Loading...</div>;

  const submit = async () => {
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMessage(res.ok ? "Saved" : "Failed");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Job</h1>
      <input className="border px-3 py-2 rounded w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea className="border px-3 py-2 rounded w-full" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} />
        <span>Recurring</span>
      </label>
      {form.is_recurring && (
        <RecurringSchedulerEditor value={form.recurrence} onChange={(v) => setForm({ ...form, recurrence: v })} />
      )}
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={submit}>
        Save
      </button>
      {message && <div>{message}</div>}
    </div>
  );
}
