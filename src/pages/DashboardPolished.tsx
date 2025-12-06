import { useEffect } from "react";
import Header from "../components/ui/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { initTheme } from "../styles/theme";

const kpis = [
  { label: "Active jobs", value: 24, trend: "+8%" },
  { label: "On-time", value: "96%", trend: "+2%" },
  { label: "Pending approvals", value: 7, trend: "-1" },
  { label: "Avg rating", value: 4.7, trend: "+0.1" },
];

export default function DashboardPolished() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header title="Operations" companyName="APP_TAG" />
      <main id="main" className="container py-6 space-y-6">
        <div className="grid card-grid">
          {kpis.map((kpi) => (
            <Card key={kpi.label} header={<div className="text-sm text-[var(--color-text-muted)]">{kpi.label}</div>}>
              <div className="text-3xl font-bold">{kpi.value}</div>
              <div className="text-sm text-[var(--color-success)]">{kpi.trend}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-2">
          <Card header={<div className="flex-between"><span>Recent jobs</span><Button size="sm" variant="secondary">View all</Button></div>}>
            <ul className="m-0 p-0" aria-label="Recent jobs list">
              {[
                { id: "J-102", title: "Site audit", status: "In progress" },
                { id: "J-103", title: "HVAC check", status: "Pending" },
                { id: "J-104", title: "Lighting", status: "Completed" },
              ].map((job) => (
                <li key={job.id} className="py-2 flex-between border-b border-[var(--color-border)] last:border-b-0">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">{job.id}</div>
                  </div>
                  <span className="text-sm text-[var(--color-success)]">{job.status}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card header={<div className="flex-between"><span>Notifications</span><Button size="sm" variant="secondary">Settings</Button></div>}>
            <ul className="m-0 p-0 space-y-2">
              {["Payment approved", "Job assigned", "Document signed"].map((msg) => (
                <li key={msg} className="text-sm text-[var(--color-text-muted)]">
                  • {msg}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
}
