import { assignUserToVariant } from "../experiments/assignments";
// TODO: load flags from secure store / Supabase Edge Function using service role key (do not embed client-side)
let serverFlags = [];
export function loadServerFlags(defs) {
    serverFlags = defs;
}
export function evaluateFlagForUser(flagKey, ctx) {
    const flag = serverFlags.find((f) => f.key === flagKey);
    if (!flag) {
        return { flagKey, enabled: false, variantKey: "control", reason: "not_found" };
    }
    const variantKey = assignUserToVariant(flag, ctx);
    const payload = flag.variants?.find((v) => v.key === variantKey)?.payload;
    return {
        flagKey,
        enabled: flag.enabled && !flag.killSwitch,
        variantKey,
        payload,
    };
}
export function batchEvaluate(flagKeys, contexts) {
    const results = [];
    for (const key of flagKeys) {
        for (const ctx of contexts) {
            results.push(evaluateFlagForUser(key, ctx));
        }
    }
    return results;
}
