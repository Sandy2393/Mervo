import { useState } from "react";
import { renderTemplatePreview, sendTestEvent } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";

export default function ConnectorSettings({ subscriptionId }: { subscriptionId: string }) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [template, setTemplate] = useState("{\"event\": \"{{event}}\"}");
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");

  const onPreview = () => {
    setPreview(renderTemplatePreview(template, { event: "job.completed", payload: { id: "demo" } }));
  };

  const onSave = async () => {
    // TODO: send secrets to secure store; never log secrets
    await recordAudit({ action: "connector_secret_update", target: subscriptionId });
    setStatus("Saved (server-side TODO)");
  };

  const onTest = async () => {
    await sendTestEvent(subscriptionId, { event: "job.completed", payload: { id: "demo" } });
    setStatus("Test sent");
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Connector Settings</h3>
      <label>
        Client ID
        <input value={clientId} onChange={(e) => setClientId(e.target.value)} />
      </label>
      <label>
        Client Secret (stored server-side)
        <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
      </label>
      <label>
        Template
        <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={4} />
      </label>
      <button onClick={onPreview}>Preview</button>
      {preview && <pre>{preview}</pre>}
      <div style={{ marginTop: 12 }}>
        <button onClick={onSave}>Save</button>
        <button onClick={onTest}>Send test</button>
      </div>
      {status && <div>{status}</div>}
    </div>
  );
}
