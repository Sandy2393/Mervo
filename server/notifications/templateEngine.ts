const htmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export function renderTemplate(template: string, data: Record<string, unknown>, options?: { escapeHtml?: boolean }) {
  const escape = options?.escapeHtml !== false;
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, token) => {
    const value = token.split(".").reduce<any>((acc, key) => (acc ? acc[key] : undefined), data);
    if (value === undefined || value === null) return "";
    const str = String(value);
    return escape ? htmlEscape(str) : str;
  });
}
