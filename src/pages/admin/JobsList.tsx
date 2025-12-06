import { useEffect, useState } from "react";

export default function JobsList() {
  const [jobs, setJobs] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/jobs").then((r) => r.json()).then(setJobs);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <a className="px-4 py-2 bg-blue-600 text-white rounded" href="/admin/jobs/new">
          New Job
        </a>
      </div>
      <div className="grid gap-3">
        {jobs.map((j) => (
          <div key={j.id} className="border rounded p-4 flex justify-between">
            <div>
              <div className="font-semibold">{j.name}</div>
              <div className="text-sm text-gray-600">{j.status}</div>
            </div>
            <div className="flex gap-2">
              <a className="text-blue-600 underline" href={`/admin/jobs/${j.id}`}>
                Edit
              </a>
              <button
                className="px-3 py-1 border rounded"
                onClick={() => fetch(`/api/jobs/${j.id}/publish`, { method: "POST" })}
              >
                Publish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
