let privacyEnabled = true;
export function setExperimentsTrackingEnabled(enabled) {
    privacyEnabled = enabled;
}
export function trackAssignment(result, ctx) {
    if (!privacyEnabled)
        return;
    // TODO: send to analytics provider or Supabase Edge Function
    console.log("assignment", { flag: result.flagKey, variant: result.variantKey, userId: ctx.userId });
}
export function trackConversion(flagKey, variantKey, eventName, ctx, metadata) {
    if (!privacyEnabled)
        return;
    // TODO: forward to analytics pipeline
    console.log("conversion", { flagKey, variantKey, eventName, userId: ctx.userId, metadata });
}
