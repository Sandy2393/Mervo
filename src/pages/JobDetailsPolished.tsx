import { useEffect } from "react";
import Header from "../components/ui/Header";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { initTheme } from "../styles/theme";

const gallery = ["/placeholder1.png", "/placeholder2.png"];

export default function JobDetailsPolished() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header title="Job Details" companyName="APP_TAG" />
      <main className="container py-6 space-y-4">
        <Card header={<div className="flex-between"><span>Job J-1002</span><span className="text-[var(--color-text-muted)]">Retail audit</span></div>}>
          <p className="text-sm text-[var(--color-text-muted)]">Location: NYC</p>
          <div className="flex items-center gap-3 mt-3">
            <Button size="sm">Assign</Button>
            <Button size="sm" variant="secondary">
              Start
            </Button>
            <Button size="sm" variant="ghost">
              Complete
            </Button>
          </div>
        </Card>

        <Card header={<span>Photos</span>}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
            {gallery.map((src, idx) => (
              <div key={src} className="rounded-md overflow-hidden bg-[var(--color-surface-muted)]" aria-label={`Photo ${idx + 1}`}>
                <div className="h-24 w-full bg-[var(--color-border)]" aria-hidden="true" />
              </div>
            ))}
          </div>
        </Card>

        <Card header={<span>Notes</span>}>
          <p className="text-sm text-[var(--color-text-muted)]">Audit fixtures, capture before/after.</p>
        </Card>
      </main>
    </div>
  );
}
