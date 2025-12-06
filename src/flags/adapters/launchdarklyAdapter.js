// Skeleton adapter to plug LaunchDarkly client. Do not include keys.
export async function fetchFromLaunchDarkly(_sdkKey) {
    // TODO: initialize LD client and fetch flag configs. Keep on server-side only.
    return [];
}
export async function evaluateWithLaunchDarkly(_flagKey, _ctx) {
    // TODO: call ldClient.variation and return variant
    return { variantKey: "control", payload: undefined };
}
