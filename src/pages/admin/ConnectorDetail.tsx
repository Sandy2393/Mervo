import { useEffect, useState } from "react";
import { listAvailable, installConnector } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";

export default function ConnectorDetail({ connectorId }: { connectorId: string }) {
  const [connector, setConnector] = useState<any>();
  const [companyId] = useState("demo-company");
  const [status, setStatus] = useState("");

  useEffect(() => {
    listAvailable().then((all) => setConnector(all.find((c: any) => c.id === connectorId)));
  }, [connectorId]);

  const install = async () => {
    await installConnector(companyId, connectorId, {});
    await recordAudit({ action: "connector_install", target: connectorId, companyId });
    setStatus("Installed");
  };

  if (!connector) return <div>Loading…</div>;

  return (
    <div style={{ padding: 16 }}>
      <h3>{connector.name}</h3>
      <p>{connector.description}</p>
      <p>Permissions: {connector.permissions?.join(", ")}</p>
      <p>Privacy: data sent only for allowed events. Secrets stored server-side. TODO: show DPIA link.</p>
      <button onClick={install}>Install</button>
      {status && <div>{status}</div>}
    </div>
  );
}
