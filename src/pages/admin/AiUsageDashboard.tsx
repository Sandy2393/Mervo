import { useEffect, useState } from "react";
import { useAI } from "../../hooks/useAI";

export default function AiUsageDashboard({ companyId }: { companyId: string }) {
  const [usage, setUsage] = useState<any>(null);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const { getQuota } = useAI();

  const load = async () => {
    const data = await getQuota(companyId);
    setUsage(data);
  };

  useEffect(() => {
    load();
  }, [companyId]);

  const toggleKillSwitch = async () => {
    // TODO: call admin endpoint to enable/disable AI globally
    setKillSwitchActive(!killSwitchActive);
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>AI Usage Dashboard</h2>
      {usage && (
        <div>
          <p>Tokens used: {usage.tokens_estimated} / 100,000</p>
          <p>Images processed: {usage.images_processed}</p>
          <p>Estimated cost: ${(usage.cost_est_cents / 100).toFixed(2)}</p>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <h3>Admin Controls</h3>
        <label>
          <input type="checkbox" checked={killSwitchActive} onChange={toggleKillSwitch} />
          Global kill switch (emergency disable all AI)
        </label>
      </div>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => window.location.href = "/admin/human-review"}>View human review queue</button>
        <button onClick={() => window.location.href = "/admin/ai-logs"}>View AI usage logs</button>
      </div>
    </div>
  );
}
