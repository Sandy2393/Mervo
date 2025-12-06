import { useState } from "react";
import Workforce from "./Workforce";

export default function CompanyDetail() {
  const [tab, setTab] = useState<"overview" | "workforce" | "settings">("overview");
  const companyId = "company_placeholder"; // replace with router param

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Company Detail</h1>
        <a className="text-blue-600 underline" href="/admin/billing">
          Billing
        </a>
      </div>
      <div className="flex gap-3 border-b">
        {[
          { key: "overview", label: "Overview" },
          { key: "workforce", label: "Workforce" },
          { key: "settings", label: "Settings" },
        ].map((t) => (
          <button
            key={t.key}
            className={`px-3 py-2 ${tab === t.key ? "border-b-2 border-blue-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setTab(t.key as any)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <div className="text-gray-700">Company overview content placeholder.</div>}
      {tab === "workforce" && <Workforce companyId={companyId} />}
      {tab === "settings" && <div className="text-gray-700">Settings placeholder.</div>}
    </div>
  );
}
