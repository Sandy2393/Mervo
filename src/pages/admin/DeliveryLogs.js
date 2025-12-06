import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { listDeliveries, retryDelivery } from "../../services/integrationsService";
export default function DeliveryLogs({ subscriptionId }) {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState("");
    const load = async () => {
        const data = await listDeliveries(subscriptionId);
        setLogs(data.deliveries ?? data);
    };
    useEffect(() => {
        load();
    }, [subscriptionId]);
    const retry = async (id) => {
        await retryDelivery(id);
        setStatus("Retried");
        load();
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h3", { children: "Delivery Logs" }), status && _jsx("div", { children: status }), _jsxs("table", { style: { width: "100%" }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "ID" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Attempts" }), _jsx("th", { children: "Last response" }), _jsx("th", {})] }) }), _jsx("tbody", { children: logs.map((l) => (_jsxs("tr", { children: [_jsx("td", { children: l.id }), _jsx("td", { children: l.status }), _jsx("td", { children: l.attempt_count }), _jsx("td", { children: l.last_response }), _jsx("td", { children: _jsx("button", { onClick: () => retry(l.id), children: "Retry" }) })] }, l.id))) })] })] }));
}
