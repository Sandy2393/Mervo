import { useEffect, useState } from "react";

interface PipelineItem {
  company: string;
  stage: string;
  progress: number;
}
interface Ticket {
  id: string;
  subject: string;
  status: string;
  providerId?: string;
}
interface RiskItem {
  company: string;
  reason: string;
  severity: string;
}

export default function CSDashboard() {
  const [pipeline, setPipeline] = useState<PipelineItem[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);

  useEffect(() => {
    // TODO: fetch from backend endpoints
    setPipeline([
      { company: "Acme", stage: "Add employees", progress: 40 },
      { company: "Beta", stage: "Training", progress: 70 },
    ]);
    setTickets([
      { id: "zd_1", subject: "Login issue", status: "open" },
      { id: "zd_2", subject: "Billing question", status: "pending" },
    ]);
    setRisks([
      { company: "Acme", reason: "No jobs in 10d", severity: "high" },
      { company: "Beta", reason: "Overdue approvals", severity: "medium" },
    ]);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Customer Success Dashboard</h1>

      <section>
        <h2>Onboarding Pipeline</h2>
        {pipeline.map((p) => (
          <div key={p.company} style={{ marginBottom: 8 }}>
            <strong>{p.company}</strong> — {p.stage}
            <div style={{ background: "#eee", height: 8, width: 200 }}>
              <div style={{ background: "#4caf50", width: `${p.progress}%`, height: 8 }} />
            </div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Open Tickets</h2>
        <ul>
          {tickets.map((t) => (
            <li key={t.id}>
              {t.subject} — {t.status} (provider: {t.providerId || "zendesk"})
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>At-Risk Customers</h2>
        <ul>
          {risks.map((r) => (
            <li key={r.company}>
              {r.company}: {r.reason} (severity: {r.severity})
              <button style={{ marginLeft: 8 }}>Resend invite</button>
              <button style={{ marginLeft: 4 }}>Trigger training</button>
              <button style={{ marginLeft: 4 }}>Create ticket</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
