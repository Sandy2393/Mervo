import { useEffect, useMemo, useState } from "react";
import { getFeatureVariant, isFeatureEnabled, onVariantAssignment } from "../flags";
import { trackAssignment } from "../lib/analytics/experimentsTracker";
export function useExperiment(flagKey, ctx) {
    const [variant, setVariant] = useState("control");
    const [payload, setPayload] = useState(undefined);
    const enabled = useMemo(() => isFeatureEnabled(flagKey, ctx), [flagKey, ctx]);
    useEffect(() => {
        const { variantKey, payload: p } = getFeatureVariant(flagKey, ctx);
        setVariant(variantKey);
        setPayload(p);
        const cb = (res, context) => {
            if (res.flagKey === flagKey)
                trackAssignment(res, context);
        };
        onVariantAssignment(cb);
    }, [flagKey, ctx]);
    return { variant, payload, isEnabled: enabled };
}
