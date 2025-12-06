import { useEffect, useState } from "react";

export default function ReportsReview() {
  const [reports, setReports] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch("/api/reports?status=submitted").then((r) => r.json()).then(setReports);
  }, []);

  const review = async (status: "approved" | "rejected") => {
    if (!selected) return;
    await fetch(`/api/reports/${selected.id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSelected(null);
    setReports((prev) => prev.filter((r) => r.id !== selected.id));
  };

  const downloadPdf = async () => {
    if (!selected) return;
    const res = await fetch(`/api/reports/${selected.id}/pdf`);
    const data = await res.json();
    window.alert(`PDF at ${data.url}`);
  };

  return (
    <div className="p-6 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-1 space-y-2">
        <h1 className="text-2xl font-bold">Reports</h1>
        {reports.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className={`w-full text-left border rounded p-3 ${selected?.id === r.id ? "border-blue-600" : ""}`}
          >
            <div className="font-semibold">{r.job_name || "Job"}</div>
            <div className="text-sm text-gray-600">Status: {r.status}</div>
          </button>
        ))}
      </div>
      <div className="md:col-span-2 border rounded p-4 min-h-[300px]">
        {selected ? (
          <div className="space-y-3">
            <div className="text-xl font-semibold">{selected.job_name}</div>
            <div>{selected.description}</div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => review("approved")}>
                Approve
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => review("rejected")}>
                Reject
              </button>
              <button className="px-4 py-2 border rounded" onClick={downloadPdf}>
                PDF
              </button>
            </div>
          </div>
        ) : (
          <div>Select a report</div>
        )}
      </div>
    </div>
  );
}
