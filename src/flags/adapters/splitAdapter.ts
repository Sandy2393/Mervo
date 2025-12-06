import { FlagDefinition, UserContext } from "../../types/flags";

// Skeleton adapter for Split.io
export async function fetchFromSplit(_apiKey: string): Promise<FlagDefinition[]> {
  // TODO: server-side integration only; fetch definitions via Admin API or SDK
  return [];
}

export async function evaluateWithSplit(_flagKey: string, _ctx: UserContext) {
  // TODO: use Split SDK treatment call
  return { variantKey: "control", payload: undefined };
}
