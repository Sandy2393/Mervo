import { useEffect, useState } from "react";
import { listAvailable, installConnector } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";

export default function Marketplace() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [companyId] = useState<string>("demo-company");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    listAvailable().then(setConnectors).catch((e) => setMessage(e.message));
  }, []);

  const canInstall = true; // TODO: check user role owner

  const install = async (connectorId: string) => {
    if (!canInstall) {
      setMessage("Insufficient permissions");
      return;
    }
    await installConnector(companyId, connectorId, {});
    await recordAudit({ action: "connector_install", target: connectorId, companyId });
    setMessage("Installed");
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Marketplace</h2>
      {message && <div>{message}</div>}
      <div style={{ display: "grid", gap: 12 }}>
        {connectors.map((c) => (
          <div key={c.id} style={{ border: "1px solid #e5e7eb", padding: 12 }}>
            <h4>{c.name}</h4>
            <p>{c.description}</p>
            <p>Permissions: {c.permissions?.join(", ")}</p>
            <button disabled={!canInstall} onClick={() => install(c.id)}>Install</button>
          </div>
        ))}
      </div>
    </div>
  );
}
