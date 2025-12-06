import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listAvailable, installConnector } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";
export default function Marketplace() {
    const [connectors, setConnectors] = useState([]);
    const [companyId] = useState("demo-company");
    const [message, setMessage] = useState("");
    useEffect(() => {
        listAvailable().then(setConnectors).catch((e) => setMessage(e.message));
    }, []);
    const canInstall = true; // TODO: check user role owner
    const install = async (connectorId) => {
        if (!canInstall) {
            setMessage("Insufficient permissions");
            return;
        }
        await installConnector(companyId, connectorId, {});
        await recordAudit({ action: "connector_install", target: connectorId, companyId });
        setMessage("Installed");
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { children: "Marketplace" }), message && _jsx("div", { children: message }), _jsx("div", { style: { display: "grid", gap: 12 }, children: connectors.map((c) => (_jsxs("div", { style: { border: "1px solid #e5e7eb", padding: 12 }, children: [_jsx("h4", { children: c.name }), _jsx("p", { children: c.description }), _jsxs("p", { children: ["Permissions: ", c.permissions?.join(", ")] }), _jsx("button", { disabled: !canInstall, onClick: () => install(c.id), children: "Install" })] }, c.id))) })] }));
}
