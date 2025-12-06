import React, { useState } from "react";
import { authedFetch, setActiveCompanyId } from "../../lib/session/companyContext";

interface LinkedCompany {
  id: string;
  name: string;
  linked_at: string;
}

export default function LinkedCompanies() {
  const [linked, setLinked] = useState<LinkedCompany[]>([]);
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [status, setStatus] = useState("");

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!companyIdInput) return;
    setStatus("Linking...");
    try {
      // Using switch-company endpoint to seed a link in this demo
      const resp = await authedFetch("/api/switch-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_company_id: companyIdInput, verification_code: verificationCode }),
      });
      if (!resp.ok) throw new Error("Failed to link");
      setLinked((prev) => [...prev, { id: companyIdInput, name: `Company ${companyIdInput.slice(0, 4)}`, linked_at: new Date().toISOString() }]);
      setStatus("Linked");
      setActiveCompanyId(companyIdInput);
    } catch (err) {
      console.error(err);
      setStatus("Link failed (requires verification/2FA)");
    }
  }

  function removeLink(id: string) {
    if (!verificationCode) {
      setStatus("Enter verification code to remove");
      return;
    }
    setLinked((prev) => prev.filter((c) => c.id !== id));
    setStatus("Link removed (server enforcement TODO)");
  }

  return (
    <div className="max-w-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Linked Companies</h1>
      <p className="text-sm text-gray-600">Master accounts can pivot between companies. Removal requires verification code and 2FA (placeholder).</p>

      <form className="space-y-2" onSubmit={addLink}>
        <input
          className="border p-2 rounded w-full"
          placeholder="Target company ID"
          value={companyIdInput}
          onChange={(e) => setCompanyIdInput(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Verification code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add link
        </button>
      </form>

      <div className="border rounded">
        <div className="p-3 font-medium">Existing links</div>
        {linked.length === 0 && <div className="p-3 text-sm text-gray-600">None linked yet.</div>}
        {linked.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-3 py-2 border-t">
            <div>
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-gray-600">Linked {new Date(c.linked_at).toLocaleString()}</div>
            </div>
            <button className="text-red-600 text-sm" onClick={() => removeLink(c.id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {status && <div className="text-sm text-gray-700">{status}</div>}
    </div>
  );
}
