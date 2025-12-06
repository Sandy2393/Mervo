import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId } from "../../lib/session/companyContext";
const RETENTION_OPTIONS = [
    { label: "1 month", days: 30 },
    { label: "2 months", days: 60 },
    { label: "6 months", days: 182 },
    { label: "1 year", days: 365 },
    { label: "5 years", days: 365 * 5 },
    { label: "Never", days: Number.POSITIVE_INFINITY },
];
export default function CompanySettings() {
    const [form, setForm] = useState({
        retention_media_days: 365,
        retention_meta_days: 365,
        suffix_type: "none",
        timezone: "UTC",
        currency: "USD",
        geofence_defaults: { radius_m: 50, strict: false },
        notify_quota_per_day: 500,
        billing_contact: "",
        sso_config: { enabled: false, metadata: {} },
    });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const companyId = getActiveCompanyId();
    useEffect(() => {
        async function load() {
            if (!companyId)
                return;
            setLoading(true);
            try {
                const resp = await authedFetch(`/api/settings/${companyId}`);
                if (resp.ok) {
                    const data = await resp.json();
                    setForm((prev) => ({ ...prev, ...data }));
                }
            }
            finally {
                setLoading(false);
            }
        }
        load();
    }, [companyId]);
    async function handleSubmit(e) {
        e.preventDefault();
        if (!companyId)
            return;
        setStatus("Saving...");
        const resp = await authedFetch(`/api/settings/${companyId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (resp.ok) {
            setStatus("Saved");
        }
        else {
            const err = await resp.json().catch(() => ({}));
            setStatus(err.error || "Failed to save");
        }
    }
    function updateField(key, value) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }
    if (loading)
        return _jsx("div", { children: "Loading settings..." });
    return (_jsxs("div", { className: "max-w-3xl p-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Company Settings" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("section", { className: "border p-4 rounded", children: [_jsx("h2", { className: "text-lg font-medium", children: "Retention" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [_jsxs("label", { className: "flex flex-col text-sm", children: ["Media retention", _jsx("select", { value: form.retention_media_days, onChange: (e) => updateField("retention_media_days", Number(e.target.value)), className: "border p-2 rounded", children: RETENTION_OPTIONS.map((opt) => (_jsx("option", { value: opt.days, children: opt.label }, opt.label))) })] }), _jsxs("label", { className: "flex flex-col text-sm", children: ["Metadata retention", _jsx("select", { value: form.retention_meta_days, onChange: (e) => updateField("retention_meta_days", Number(e.target.value)), className: "border p-2 rounded", children: RETENTION_OPTIONS.map((opt) => (_jsx("option", { value: opt.days, children: opt.label }, opt.label))) })] })] })] }), _jsxs("section", { className: "border p-4 rounded", children: [_jsx("h2", { className: "text-lg font-medium", children: "Naming & suffixes" }), _jsxs("label", { className: "flex flex-col text-sm", children: ["Suffix strategy", _jsxs("select", { value: form.suffix_type, onChange: (e) => updateField("suffix_type", e.target.value), className: "border p-2 rounded", children: [_jsx("option", { value: "none", children: "None" }), _jsx("option", { value: "numeric", children: "Numeric" }), _jsx("option", { value: "alpha", children: "Alphabetical" })] })] })] }), _jsxs("section", { className: "border p-4 rounded", children: [_jsx("h2", { className: "text-lg font-medium", children: "Locale & billing" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [_jsxs("label", { className: "flex flex-col text-sm", children: ["Timezone", _jsx("input", { className: "border p-2 rounded", value: form.timezone, onChange: (e) => updateField("timezone", e.target.value), placeholder: "UTC" })] }), _jsxs("label", { className: "flex flex-col text-sm", children: ["Currency", _jsx("input", { className: "border p-2 rounded", value: form.currency, onChange: (e) => updateField("currency", e.target.value), placeholder: "USD" })] }), _jsxs("label", { className: "flex flex-col text-sm col-span-2", children: ["Billing contact", _jsx("input", { className: "border p-2 rounded", value: form.billing_contact, onChange: (e) => updateField("billing_contact", e.target.value), placeholder: "billing@company.com" })] })] })] }), _jsxs("section", { className: "border p-4 rounded", children: [_jsx("h2", { className: "text-lg font-medium", children: "Geofence & notifications" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mt-2", children: [_jsxs("label", { className: "flex flex-col text-sm", children: ["Default geofence radius (m)", _jsx("input", { type: "number", className: "border p-2 rounded", value: form.geofence_defaults.radius_m, onChange: (e) => updateField("geofence_defaults", { ...form.geofence_defaults, radius_m: Number(e.target.value) }) })] }), _jsxs("label", { className: "flex items-center space-x-2 text-sm mt-6", children: [_jsx("input", { type: "checkbox", checked: !!form.geofence_defaults.strict, onChange: (e) => updateField("geofence_defaults", { ...form.geofence_defaults, strict: e.target.checked }) }), _jsx("span", { children: "Require strict geofence" })] }), _jsxs("label", { className: "flex flex-col text-sm", children: ["Notification quota per day", _jsx("input", { type: "number", className: "border p-2 rounded", value: form.notify_quota_per_day, onChange: (e) => updateField("notify_quota_per_day", Number(e.target.value)) })] })] })] }), _jsxs("section", { className: "border p-4 rounded", children: [_jsx("h2", { className: "text-lg font-medium", children: "SSO" }), _jsxs("label", { className: "flex items-center space-x-2 text-sm", children: [_jsx("input", { type: "checkbox", checked: !!form.sso_config.enabled, onChange: (e) => updateField("sso_config", { ...form.sso_config, enabled: e.target.checked }) }), _jsx("span", { children: "Enable SSO (placeholder)" })] }), _jsx("p", { className: "text-xs text-gray-600 mt-2", children: "Bring your own IdP metadata; wired later." })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded", children: "Save settings" }), _jsx("span", { className: "text-sm", children: status })] })] })] }));
}
