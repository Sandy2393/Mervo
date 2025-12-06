import React, { useState } from "react";
import { authedFetch } from "../../lib/session/companyContext";

type Status = "PASS" | "WARN" | "FAIL";

interface Check {
  name: string;
  status: Status;
  details?: string;
}

interface ReadinessResult {
  status: Status;
  checks: Check[];
  generated_at: string;
}

export default function PreLaunchReadiness() {
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [status, setStatus] = useState<string>("");

  async function run() {
    setStatus("Running suite...");
    const resp = await authedFetch("/api/tests/prelaunch");
    if (resp.ok) {
      setResult(await resp.json());
      setStatus("Done");
    } else {
      setStatus("Run failed");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pre-Launch Readiness</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={run}>
          Run checks
        </button>
      </div>
      {status && <div className="text-sm text-gray-700">{status}</div>}

      {result && (
        <div className="space-y-3">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Overall</div>
            <div className={`text-xl font-semibold ${color(result.status)}`}>{result.status}</div>
            <div className="text-xs text-gray-600">Generated {new Date(result.generated_at).toLocaleString()}</div>
          </div>
          <div className="border rounded">
            <div className="p-3 font-medium">Checks</div>
            <ul className="divide-y">
              {result.checks.map((c) => (
                <li key={c.name} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    {c.details && <div className="text-xs text-gray-600">{c.details}</div>}
                  </div>
                  <span className={`text-sm font-semibold ${color(c.status)}`}>{c.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function color(status: Status) {
  if (status === "PASS") return "text-green-600";
  if (status === "WARN") return "text-yellow-600";
  return "text-red-600";
}
