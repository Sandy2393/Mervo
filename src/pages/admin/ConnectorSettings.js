import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { renderTemplatePreview, sendTestEvent } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";
export default function ConnectorSettings({ subscriptionId }) {
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
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h3", { children: "Connector Settings" }), _jsxs("label", { children: ["Client ID", _jsx("input", { value: clientId, onChange: (e) => setClientId(e.target.value) })] }), _jsxs("label", { children: ["Client Secret (stored server-side)", _jsx("input", { type: "password", value: clientSecret, onChange: (e) => setClientSecret(e.target.value) })] }), _jsxs("label", { children: ["Template", _jsx("textarea", { value: template, onChange: (e) => setTemplate(e.target.value), rows: 4 })] }), _jsx("button", { onClick: onPreview, children: "Preview" }), preview && _jsx("pre", { children: preview }), _jsxs("div", { style: { marginTop: 12 }, children: [_jsx("button", { onClick: onSave, children: "Save" }), _jsx("button", { onClick: onTest, children: "Send test" })] }), status && _jsx("div", { children: status })] }));
}
