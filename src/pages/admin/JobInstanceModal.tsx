import { useState } from "react";

export default function JobInstanceModal({ job, onClose }: { job: any; onClose: () => void }) {
  const [pay, setPay] = useState(job.payment_cents || 0);
  const [assignee, setAssignee] = useState("");

  const assign = async () => {
    // TODO: call assign endpoint
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full space-y-3">
        <h2 className="text-xl font-semibold">Assign Job Instance</h2>
        <div>
          <label className="text-sm font-semibold">Pay (cents)</label>
          <input className="border px-3 py-2 rounded w-full" type="number" value={pay} onChange={(e) => setPay(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm font-semibold">Assign to</label>
          <input className="border px-3 py-2 rounded w-full" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={assign}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}
