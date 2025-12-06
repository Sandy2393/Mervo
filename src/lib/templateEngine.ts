// Minimal template interpolation to reduce SSTI risk.
// Supports {{path.to.value}} lookup from data object.

export function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
    const parts = key.split(".");
    let val: any = data;
    for (const p of parts) {
      val = val?.[p];
      if (val === undefined || val === null) return "";
    }
    return String(val);
  });
}
