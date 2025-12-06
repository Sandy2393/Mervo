import React, { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId, setActiveCompanyId } from "../../lib/session/companyContext";

export interface CompanySummary {
  id: string;
  name: string;
  logoUrl?: string;
  tag?: string;
}

interface Props {
  companies?: CompanySummary[];
}

export function CompanySwitcher({ companies: initialCompanies = [] }: Props) {
  const [companies, setCompanies] = useState<CompanySummary[]>(initialCompanies);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const activeCompanyId = getActiveCompanyId();

  useEffect(() => {
    // Placeholder: fetch linked companies if API exists; otherwise use provided list
    async function load() {
      if (initialCompanies.length) return;
      // In a real app call /api/linked-companies for master user
      setCompanies([
        { id: activeCompanyId || "demo", name: "Demo Company", tag: "Primary" },
      ]);
    }
    load();
  }, [activeCompanyId, initialCompanies.length]);

  async function handleSwitch(companyId: string) {
    setStatus("Switching...");
    try {
      setActiveCompanyId(companyId);
      await authedFetch("/api/switch-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_company_id: companyId }),
      });
      setStatus("Switched");
      setOpen(false);
    } catch (err) {
      console.error(err);
      setStatus("Failed to switch");
    }
  }

  return (
    <div className="relative inline-block">
      <button className="border px-3 py-2 rounded flex items-center space-x-2" onClick={() => setOpen((o) => !o)}>
        <span>{companies.find((c) => c.id === activeCompanyId)?.name || "Select company"}</span>
        <span className="text-xs text-gray-600">▼</span>
      </button>
      {open && (
        <div className="absolute mt-2 bg-white border rounded shadow-md w-64 z-10">
          <div className="p-2 text-xs text-gray-600">Linked companies</div>
          <ul>
            {companies.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center space-x-2">
                  {c.logoUrl ? <img src={c.logoUrl} alt={c.name} className="w-6 h-6 rounded" /> : <div className="w-6 h-6 bg-gray-200 rounded" />}
                  <div>
                    <div className="text-sm">{c.name}</div>
                    {c.tag && <div className="text-xs text-gray-500">{c.tag}</div>}
                  </div>
                </div>
                <button
                  className="text-blue-600 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwitch(c.id);
                  }}
                >
                  Switch
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t p-2 text-sm">
            <a href="/profile/linked-companies" className="text-blue-600">
              Manage links
            </a>
          </div>
          {status && <div className="p-2 text-xs text-gray-600">{status}</div>}
        </div>
      )}
    </div>
  );
}

export default CompanySwitcher;
