import fs from "fs";
import path from "path";
import { assignUserToVariant } from "../experiments/assignments";
let definitions = [];
const assignmentCallbacks = [];
export function initFlags(config) {
    if (config?.source === "remote" && config.remoteUrl) {
        // TODO: fetch from secure endpoint; keep client-safe fields only
        console.warn("Remote load not implemented; falling back to local flags.json");
    }
    const localPath = path.join(process.cwd(), "flags", "flags.json");
    if (fs.existsSync(localPath)) {
        const raw = fs.readFileSync(localPath, "utf-8");
        const parsed = JSON.parse(raw);
        definitions = parsed.flags ?? [];
    }
    else {
        console.warn("flags.json missing; using empty flags set");
        definitions = [];
    }
}
function findFlag(flagKey) {
    return definitions.find((f) => f.key === flagKey);
}
export function isFeatureEnabled(flagKey, ctx) {
    const flag = findFlag(flagKey);
    if (!flag)
        return false;
    const variantKey = assignUserToVariant(flag, ctx);
    if (flag.type === "boolean")
        return variantKey !== "control" && flag.enabled && !flag.killSwitch;
    return flag.enabled && !flag.killSwitch;
}
export function getFeatureVariant(flagKey, ctx) {
    const flag = findFlag(flagKey);
    if (!flag)
        return { variantKey: "control" };
    const variantKey = assignUserToVariant(flag, ctx);
    const payload = flag.variants?.find((v) => v.key === variantKey)?.payload;
    const result = {
        flagKey,
        enabled: flag.enabled && !flag.killSwitch,
        variantKey,
        payload,
    };
    assignmentCallbacks.forEach((cb) => cb(result, ctx));
    return { variantKey, payload };
}
export function onVariantAssignment(cb) {
    assignmentCallbacks.push(cb);
}
export function getDefinitions() {
    return definitions;
}
