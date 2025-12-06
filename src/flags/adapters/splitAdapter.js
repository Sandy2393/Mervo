// Skeleton adapter for Split.io
export async function fetchFromSplit(_apiKey) {
    // TODO: server-side integration only; fetch definitions via Admin API or SDK
    return [];
}
export async function evaluateWithSplit(_flagKey, _ctx) {
    // TODO: use Split SDK treatment call
    return { variantKey: "control", payload: undefined };
}
