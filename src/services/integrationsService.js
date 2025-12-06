import { renderTemplate } from "../lib/templateEngine";
const base = "/api/integrations"; // TODO secure via auth/service role
export async function listAvailable() {
    const res = await fetch(`${base}/connectors`);
    if (!res.ok)
        throw new Error("Failed to list connectors");
    return res.json();
}
export async function listInstalled(companyId) {
    const res = await fetch(`${base}/companies/${companyId}/connectors`);
    if (!res.ok)
        throw new Error("Failed to list installed connectors");
    return res.json();
}
export async function installConnector(companyId, connectorId, config) {
    const res = await fetch(`${base}/companies/${companyId}/connectors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId, config }),
    });
    if (!res.ok)
        throw new Error("Install failed");
    return res.json();
}
export async function sendTestEvent(subscriptionId, samplePayload) {
    const res = await fetch(`${base}/webhooks/${subscriptionId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(samplePayload),
    });
    if (!res.ok)
        throw new Error("Test event failed");
    return res.json();
}
export async function listDeliveries(subscriptionId) {
    const res = await fetch(`${base}/webhooks/${subscriptionId}/deliveries`);
    if (!res.ok)
        throw new Error("Failed to fetch deliveries");
    return res.json();
}
export async function retryDelivery(deliveryId) {
    const res = await fetch(`${base}/webhooks/deliveries/${deliveryId}/retry`, { method: "POST" });
    if (!res.ok)
        throw new Error("Retry failed");
    return res.json();
}
export function renderTemplatePreview(template, data) {
    return renderTemplate(template, data);
}
