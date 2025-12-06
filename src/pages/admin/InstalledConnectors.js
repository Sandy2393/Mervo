import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listInstalled } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";
export default function InstalledConnectors() {
    const [companyId] = useState("demo-company");
    const [installed, setInstalled] = useState([]);
    const load = async () => {
        const data = await listInstalled(companyId);
        setInstalled(data);
    };
    useEffect(() => {
        load();
    }, []);
    const disable = async (id) => {
        // TODO: call service to disable
        await recordAudit({ action: "connector_disable", target: id, companyId });
        setInstalled((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: false } : c)));
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Installed Connectors" }), installed.map((c) => (_jsxs("div", { style: { border: "1px solid #e5e7eb", padding: 12, marginBottom: 8 }, children: [_jsxs("div", { style: { display: "flex", justifyContent: "space-between" }, children: [_jsxs("div", { children: [_jsx("strong", { children: c.name }), " (", c.enabled ? "enabled" : "disabled", ")"] }), _jsx("div", { children: _jsx("button", { onClick: () => disable(c.id), children: "Disable" }) })] }), _jsxs("div", { children: ["Events: ", c.permissions?.join(", ")] }), _jsxs("div", { children: ["Installed at: ", c.created_at] })] }, c.id)))] }));
}
