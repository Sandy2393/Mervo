import fs from "fs";
import path from "path";

type Event = {
  user_id: string;
  flagKey: string;
  variant: string;
  eventName: string;
  timestamp: string;
};

type VariantStats = { assignments: number; conversions: number; rate: number };

type Result = {
  flagKey: string;
  variants: Record<string, VariantStats>;
  uplift?: number;
  ci?: [number, number];
};

const EVENTS_DIR = path.join(process.cwd(), "events");

export function loadEvents(): Event[] {
  if (!fs.existsSync(EVENTS_DIR)) return [];
  const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith(".json"));
  const events: Event[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(EVENTS_DIR, file), "utf-8");
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) events.push(...(parsed as Event[]));
      else events.push(parsed as Event);
    } catch (e) {
      console.error("Failed to parse", file, e);
    }
  }
  return events;
}

export function computeStats(events: Event[], flagKey: string, conversionEvent = "conversion"): Result {
  const filtered = events.filter((e) => e.flagKey === flagKey);
  const variants: Record<string, VariantStats> = {};
  for (const ev of filtered) {
    const v = (variants[ev.variant] = variants[ev.variant] || { assignments: 0, conversions: 0, rate: 0 });
    if (ev.eventName === "assignment") v.assignments += 1;
    if (ev.eventName === conversionEvent) v.conversions += 1;
  }
  Object.values(variants).forEach((v) => {
    v.rate = v.assignments > 0 ? v.conversions / v.assignments : 0;
  });
  const keys = Object.keys(variants);
  let uplift: number | undefined;
  let ci: [number, number] | undefined;
  if (keys.length >= 2) {
    const a = variants[keys[0]];
    const b = variants[keys[1]];
    uplift = b.rate - a.rate;
    const se = Math.sqrt((a.rate * (1 - a.rate)) / Math.max(1, a.assignments) + (b.rate * (1 - b.rate)) / Math.max(1, b.assignments));
    const z = 1.96;
    ci = [uplift - z * se, uplift + z * se];
  }
  return { flagKey, variants, uplift, ci };
}

export function writeReports(result: Result) {
  const outDir = path.join(process.cwd(), "server", "experiments", "out");
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${result.flagKey}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  const md = [
    `# Experiment ${result.flagKey}`,
    "",
    "| Variant | Assignments | Conversions | Rate |",
    "| --- | --- | --- | --- |",
    ...Object.entries(result.variants).map(([k, v]) => `| ${k} | ${v.assignments} | ${v.conversions} | ${(v.rate * 100).toFixed(2)}% |`),
    "",
    `Uplift (variantB - control): ${result.uplift ?? 0}`,
    result.ci ? `95% CI: [${result.ci[0].toFixed(4)}, ${result.ci[1].toFixed(4)}]` : "CI: n/a",
    "",
    "> Disclaimer: basic estimator only. For production decisions, use dedicated stats tooling."
  ].join("\n");
  fs.writeFileSync(path.join(outDir, `${result.flagKey}.md`), md);
}

if (require.main === module) {
  const flagKey = process.argv[2] || "pricing_experiment";
  const events = loadEvents();
  const result = computeStats(events, flagKey);
  writeReports(result);
  console.log(`Processed ${flagKey}. See server/experiments/out/`);
}
