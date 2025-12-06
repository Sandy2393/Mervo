import { useEffect, useState } from "react";
import { listInstalled } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";

export default function InstalledConnectors() {
  const [companyId] = useState("demo-company");
  const [installed, setInstalled] = useState<any[]>([]);

  const load = async () => {
    const data = await listInstalled(companyId);
    setInstalled(data);
  };

  useEffect(() => {
    load();
  }, []);

  const disable = async (id: string) => {
    // TODO: call service to disable
    await recordAudit({ action: "connector_disable", target: id, companyId });
    setInstalled((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: false } : c)));
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Installed Connectors</h2>
      {installed.map((c) => (
        <div key={c.id} style={{ border: "1px solid #e5e7eb", padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{c.name}</strong> ({c.enabled ? "enabled" : "disabled"})
            </div>
            <div>
              <button onClick={() => disable(c.id)}>Disable</button>
            </div>
          </div>
          <div>Events: {c.permissions?.join(", ")}</div>
          <div>Installed at: {c.created_at}</div>
        </div>
      ))}
    </div>
  );
}
