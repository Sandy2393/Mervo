import React, { useEffect, useState } from "react";
import { authedFetch, getActiveCompanyId } from "../../lib/session/companyContext";

const RETENTION_OPTIONS = [
  { label: "1 month", days: 30 },
  { label: "2 months", days: 60 },
  { label: "6 months", days: 182 },
  { label: "1 year", days: 365 },
  { label: "5 years", days: 365 * 5 },
  { label: "Never", days: Number.POSITIVE_INFINITY },
];

interface SettingsForm {
  retention_media_days: number;
  retention_meta_days: number;
  suffix_type: string;
  timezone: string;
  currency: string;
  geofence_defaults: { radius_m: number; strict?: boolean };
  notify_quota_per_day: number;
  billing_contact: string;
  sso_config: { enabled?: boolean; metadata?: any };
}

export default function CompanySettings() {
  const [form, setForm] = useState<SettingsForm>({
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
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const companyId = getActiveCompanyId();

  useEffect(() => {
    async function load() {
      if (!companyId) return;
      setLoading(true);
      try {
        const resp = await authedFetch(`/api/settings/${companyId}`);
        if (resp.ok) {
          const data = await resp.json();
          setForm((prev) => ({ ...prev, ...data }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [companyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId) return;
    setStatus("Saving...");
    const resp = await authedFetch(`/api/settings/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (resp.ok) {
      setStatus("Saved");
    } else {
      const err = await resp.json().catch(() => ({}));
      setStatus(err.error || "Failed to save");
    }
  }

  function updateField<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Company Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <section className="border p-4 rounded">
          <h2 className="text-lg font-medium">Retention</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label className="flex flex-col text-sm">
              Media retention
              <select
                value={form.retention_media_days}
                onChange={(e) => updateField("retention_media_days", Number(e.target.value))}
                className="border p-2 rounded"
              >
                {RETENTION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.days}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              Metadata retention
              <select
                value={form.retention_meta_days}
                onChange={(e) => updateField("retention_meta_days", Number(e.target.value))}
                className="border p-2 rounded"
              >
                {RETENTION_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.days}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="border p-4 rounded">
          <h2 className="text-lg font-medium">Naming & suffixes</h2>
          <label className="flex flex-col text-sm">
            Suffix strategy
            <select
              value={form.suffix_type}
              onChange={(e) => updateField("suffix_type", e.target.value)}
              className="border p-2 rounded"
            >
              <option value="none">None</option>
              <option value="numeric">Numeric</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </label>
        </section>

        <section className="border p-4 rounded">
          <h2 className="text-lg font-medium">Locale & billing</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label className="flex flex-col text-sm">
              Timezone
              <input
                className="border p-2 rounded"
                value={form.timezone}
                onChange={(e) => updateField("timezone", e.target.value)}
                placeholder="UTC"
              />
            </label>
            <label className="flex flex-col text-sm">
              Currency
              <input
                className="border p-2 rounded"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                placeholder="USD"
              />
            </label>
            <label className="flex flex-col text-sm col-span-2">
              Billing contact
              <input
                className="border p-2 rounded"
                value={form.billing_contact}
                onChange={(e) => updateField("billing_contact", e.target.value)}
                placeholder="billing@company.com"
              />
            </label>
          </div>
        </section>

        <section className="border p-4 rounded">
          <h2 className="text-lg font-medium">Geofence & notifications</h2>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <label className="flex flex-col text-sm">
              Default geofence radius (m)
              <input
                type="number"
                className="border p-2 rounded"
                value={form.geofence_defaults.radius_m}
                onChange={(e) =>
                  updateField("geofence_defaults", { ...form.geofence_defaults, radius_m: Number(e.target.value) })
                }
              />
            </label>
            <label className="flex items-center space-x-2 text-sm mt-6">
              <input
                type="checkbox"
                checked={!!form.geofence_defaults.strict}
                onChange={(e) =>
                  updateField("geofence_defaults", { ...form.geofence_defaults, strict: e.target.checked })
                }
              />
              <span>Require strict geofence</span>
            </label>
            <label className="flex flex-col text-sm">
              Notification quota per day
              <input
                type="number"
                className="border p-2 rounded"
                value={form.notify_quota_per_day}
                onChange={(e) => updateField("notify_quota_per_day", Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="border p-4 rounded">
          <h2 className="text-lg font-medium">SSO</h2>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.sso_config.enabled}
              onChange={(e) => updateField("sso_config", { ...form.sso_config, enabled: e.target.checked })}
            />
            <span>Enable SSO (placeholder)</span>
          </label>
          <p className="text-xs text-gray-600 mt-2">Bring your own IdP metadata; wired later.</p>
        </section>

        <div className="flex items-center space-x-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Save settings
          </button>
          <span className="text-sm">{status}</span>
        </div>
      </form>
    </div>
  );
}
