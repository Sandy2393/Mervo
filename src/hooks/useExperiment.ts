import { useEffect, useMemo, useState } from "react";
import { getFeatureVariant, isFeatureEnabled, onVariantAssignment } from "../flags";
import { UserContext } from "../types/flags";
import { trackAssignment } from "../lib/analytics/experimentsTracker";

export function useExperiment(flagKey: string, ctx: UserContext) {
  const [variant, setVariant] = useState<string>("control");
  const [payload, setPayload] = useState<Record<string, unknown> | undefined>(undefined);
  const enabled = useMemo(() => isFeatureEnabled(flagKey, ctx), [flagKey, ctx]);

  useEffect(() => {
    const { variantKey, payload: p } = getFeatureVariant(flagKey, ctx);
    setVariant(variantKey);
    setPayload(p);
    const cb = (res: any, context: UserContext) => {
      if (res.flagKey === flagKey) trackAssignment(res, context);
    };
    onVariantAssignment(cb);
  }, [flagKey, ctx]);

  return { variant, payload, isEnabled: enabled };
}
