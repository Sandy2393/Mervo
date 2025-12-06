import { useEffect } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { initTheme } from "../styles/theme";

const todaysJobs = [
  { id: "J-210", title: "Store check", time: "09:00", location: "Brooklyn" },
  { id: "J-211", title: "Inventory", time: "13:00", location: "Queens" },
];

export default function ContractorJobFlowPolished() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-4">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="space-y-4">
        <h1 className="text-2xl font-semibold">Today</h1>
        <div className="space-y-3">
          {todaysJobs.map((job) => (
            <Card key={job.id} header={<div className="flex-between"><span>{job.title}</span><span className="text-[var(--color-text-muted)]">{job.time}</span></div>}>
              <div className="text-sm text-[var(--color-text-muted)]">{job.location}</div>
              <div className="mt-3 flex gap-3">
                <Button block>Clock in</Button>
                <Button block variant="secondary">
                  Upload photo
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
