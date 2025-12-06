const base = "/api";

const htmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderTemplate = (template: string, data: Record<string, unknown>, escapeHtml = true) =>
  template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, token) => {
    const value = token.split(".").reduce<any>((acc, key) => (acc ? acc[key] : undefined), data);
    if (value === undefined || value === null) return "";
    const str = String(value);
    return escapeHtml ? htmlEscape(str) : str;
  });

export async function listTemplates(companyId: string) {
  const res = await fetch(`${base}/notifications/templates?company_id=${companyId}`);
  if (!res.ok) throw new Error("Failed to list templates");
  return res.json();
}

export function renderPreview(template: any, data: Record<string, unknown>) {
  const subject = template.subject ? renderTemplate(template.subject, data) : "(no subject)";
  const text = template.body_text ? renderTemplate(template.body_text, data, { escapeHtml: false }) : "";
  const html = template.body_html ? renderTemplate(template.body_html, data) : "";
  return { subject, text, html };
}

export async function sendTestNotification(input: { company_id: string; templateId: string; to: string }) {
  const res = await fetch(`${base}/notifications/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to send test");
  return res.json();
}

export async function fetchNotificationLog(companyId: string) {
  const res = await fetch(`${base}/notifications/logs?company_id=${companyId}`);
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}
