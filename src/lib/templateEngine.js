// Minimal template interpolation to reduce SSTI risk.
// Supports {{path.to.value}} lookup from data object.
export function renderTemplate(template, data) {
    return template.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
        const parts = key.split(".");
        let val = data;
        for (const p of parts) {
            val = val?.[p];
            if (val === undefined || val === null)
                return "";
        }
        return String(val);
    });
}
