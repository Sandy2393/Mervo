import { useEffect, useState } from "react";
import { fetchMonitorStats } from "../../services/monitorService";
import { toggleFlag } from "../../services/flagsService";

export default function FlagsMonitor() {
  const [stats, setStats] = useState<any[]>([]);

  const load = async () => {
    const data = await fetchMonitorStats();
    setStats(data);
  };

  useEffect(() => {
    load();
  }, []);

  const kill = async (flagKey: string) => {
    const first = window.confirm(`Kill flag ${flagKey}? This sets rollout to 0 and disables.`);
    if (!first) return;
    const second = window.confirm("Are you sure? This is a kill switch.");
    if (!second) return;
    await toggleFlag(flagKey, false);
    load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Flags Monitor</h2>
      {stats.map((stat) => (
        <div key={stat.flagKey} style={{ border: "1px solid #e5e7eb", padding: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>{stat.flagKey}</h4>
            <button style={{ background: "#dc2626", color: "white" }} onClick={() => kill(stat.flagKey)}>
              Kill Switch
            </button>
          </div>
          <table style={{ width: "100%", marginTop: 8 }}>
            <thead>
              <tr>
                <th>Variant</th>
                <th>Users</th>
                <th>Conversions</th>
              </tr>
            </thead>
            <tbody>
              {stat.variants.map((v: any) => (
                <tr key={v.key}>
                  <td>{v.key}</td>
                  <td>{v.users}</td>
                  <td>{v.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
