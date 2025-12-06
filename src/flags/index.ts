import fs from "fs";
import path from "path";
import { FlagDefinition, UserContext, EvaluationResult } from "../types/flags";
import { assignUserToVariant } from "../experiments/assignments";

let definitions: FlagDefinition[] = [];
const assignmentCallbacks: Array<(result: EvaluationResult, ctx: UserContext) => void> = [];

export function initFlags(config?: { source?: "local" | "remote"; remoteUrl?: string }) {
  if (config?.source === "remote" && config.remoteUrl) {
    // TODO: fetch from secure endpoint; keep client-safe fields only
    console.warn("Remote load not implemented; falling back to local flags.json");
  }
  const localPath = path.join(process.cwd(), "flags", "flags.json");
  if (fs.existsSync(localPath)) {
    const raw = fs.readFileSync(localPath, "utf-8");
    const parsed = JSON.parse(raw);
    definitions = parsed.flags ?? [];
  } else {
    console.warn("flags.json missing; using empty flags set");
    definitions = [];
  }
}

function findFlag(flagKey: string): FlagDefinition | undefined {
  return definitions.find((f) => f.key === flagKey);
}

export function isFeatureEnabled(flagKey: string, ctx: UserContext): boolean {
  const flag = findFlag(flagKey);
  if (!flag) return false;
  const variantKey = assignUserToVariant(flag, ctx);
  if (flag.type === "boolean") return variantKey !== "control" && flag.enabled && !flag.killSwitch;
  return flag.enabled && !flag.killSwitch;
}

export function getFeatureVariant(flagKey: string, ctx: UserContext): { variantKey: string; payload?: Record<string, unknown> } {
  const flag = findFlag(flagKey);
  if (!flag) return { variantKey: "control" };
  const variantKey = assignUserToVariant(flag, ctx);
  const payload = flag.variants?.find((v) => v.key === variantKey)?.payload;
  const result: EvaluationResult = {
    flagKey,
    enabled: flag.enabled && !flag.killSwitch,
    variantKey,
    payload,
  };
  assignmentCallbacks.forEach((cb) => cb(result, ctx));
  return { variantKey, payload };
}

export function onVariantAssignment(cb: (result: EvaluationResult, ctx: UserContext) => void) {
  assignmentCallbacks.push(cb);
}

export function getDefinitions() {
  return definitions;
}
