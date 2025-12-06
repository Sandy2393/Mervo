import fs from "fs";
import path from "path";

// Mock transform test: ensure sample events load and basic fields exist

describe("staging transform", () => {
  it("loads sample events", () => {
    const file = path.join(process.cwd(), "analytics/sample/sample_events.ndjson");
    const lines = fs.readFileSync(file, "utf-8").trim().split(/\r?\n/);
    expect(lines.length).toBeGreaterThan(0);
    const evt = JSON.parse(lines[0]);
    expect(evt.event_id).toBeDefined();
    expect(evt.user.master_alias).toBeDefined();
  });
});
