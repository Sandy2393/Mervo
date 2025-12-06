import { EvaluationResult, UserContext } from "../../types/flags";

let privacyEnabled = true;

export function setExperimentsTrackingEnabled(enabled: boolean) {
  privacyEnabled = enabled;
}

export function trackAssignment(result: EvaluationResult, ctx: UserContext) {
  if (!privacyEnabled) return;
  // TODO: send to analytics provider or Supabase Edge Function
  console.log("assignment", { flag: result.flagKey, variant: result.variantKey, userId: ctx.userId });
}

export function trackConversion(flagKey: string, variantKey: string, eventName: string, ctx: UserContext, metadata?: Record<string, unknown>) {
  if (!privacyEnabled) return;
  // TODO: forward to analytics pipeline
  console.log("conversion", { flagKey, variantKey, eventName, userId: ctx.userId, metadata });
}
