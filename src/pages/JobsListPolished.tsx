import { useEffect, useState } from "react";
import Header from "../components/ui/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import { initTheme } from "../styles/theme";

const jobs = [
  { id: "J-1001", title: "Warehouse inspection", location: "NYC", status: "Open" },
  { id: "J-1002", title: "Retail audit", location: "SF", status: "Assigned" },
  { id: "J-1003", title: "Maintenance", location: "Remote", status: "Open" },
];

const filters = ["All", "Open", "Assigned", "Completed"];

export default function JobsListPolished() {
  useEffect(() => {
    initTheme();
  }, []);

  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = jobs.filter((j) => (activeFilter === "All" ? true : j.status === activeFilter));

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header title="Jobs" companyName="APP_TAG" />
      <main className="container py-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          {filters.map((f) => (
            <Button key={f} size="sm" variant={f === activeFilter ? "primary" : "secondary"} onClick={() => setActiveFilter(f)}>
              {f}
            </Button>
          ))}
          <div className="flex-1 min-w-[200px]">
            <FormInput id="search" label="Search" placeholder="Search jobs" aria-label="Search jobs" />
          </div>
        </div>

        <div className="card-grid">
          {filtered.map((job) => (
            <Card key={job.id} header={<div className="flex-between"><span>{job.title}</span><span className="text-[var(--color-text-muted)]">{job.id}</span></div>}>
              <div className="text-sm text-[var(--color-text-muted)]">{job.location}</div>
              <div className="mt-2">
                <Button size="sm">View</Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
