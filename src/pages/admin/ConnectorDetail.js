import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listAvailable, installConnector } from "../../services/integrationsService";
import { recordAudit } from "../../services/auditConnectorActions";
export default function ConnectorDetail({ connectorId }) {
    const [connector, setConnector] = useState();
    const [companyId] = useState("demo-company");
    const [status, setStatus] = useState("");
    useEffect(() => {
        listAvailable().then((all) => setConnector(all.find((c) => c.id === connectorId)));
    }, [connectorId]);
    const install = async () => {
        await installConnector(companyId, connectorId, {});
        await recordAudit({ action: "connector_install", target: connectorId, companyId });
        setStatus("Installed");
    };
    if (!connector)
        return _jsx("div", { children: "Loading\u2026" });
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h3", { children: connector.name }), _jsx("p", { children: connector.description }), _jsxs("p", { children: ["Permissions: ", connector.permissions?.join(", ")] }), _jsx("p", { children: "Privacy: data sent only for allowed events. Secrets stored server-side. TODO: show DPIA link." }), _jsx("button", { onClick: install, children: "Install" }), status && _jsx("div", { children: status })] }));
}
