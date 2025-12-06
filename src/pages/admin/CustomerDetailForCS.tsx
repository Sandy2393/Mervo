
const mock = {
  company: "Acme",
  onboarding: "Post first job",
  progress: 55,
  tickets: [
    { id: "zd_1", subject: "Login issue", status: "open" },
    { id: "zd_2", subject: "Billing question", status: "pending" },
  ],
  health: { score: 72, alerts: ["No jobs in 10d", "Overdue approvals"] },
};

export default function CustomerDetailForCS() {
  return (
    <div style={{ padding: 24 }}>
      <h1>{mock.company}</h1>
      <div>Onboarding step: {mock.onboarding} ({mock.progress}%)</div>
      <div>Health score: {mock.health.score}</div>
      <h3>Health alerts</h3>
      <ul>
        {mock.health.alerts.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      <h3>Tickets</h3>
      <ul>
        {mock.tickets.map((t) => (
          <li key={t.id}>
            {t.subject} — {t.status}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12 }}>
        <button>Resend invite</button>
        <button style={{ marginLeft: 8 }}>Trigger training</button>
        <button style={{ marginLeft: 8 }}>Create ticket</button>
      </div>
    </div>
  );
}
