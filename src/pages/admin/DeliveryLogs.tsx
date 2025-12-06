import { useEffect, useState } from "react";
import { listDeliveries, retryDelivery } from "../../services/integrationsService";

export default function DeliveryLogs({ subscriptionId }: { subscriptionId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    const data = await listDeliveries(subscriptionId);
    setLogs(data.deliveries ?? data);
  };

  useEffect(() => {
    load();
  }, [subscriptionId]);

  const retry = async (id: string) => {
    await retryDelivery(id);
    setStatus("Retried");
    load();
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Delivery Logs</h3>
      {status && <div>{status}</div>}
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Attempts</th>
            <th>Last response</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.status}</td>
              <td>{l.attempt_count}</td>
              <td>{l.last_response}</td>
              <td><button onClick={() => retry(l.id)}>Retry</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
