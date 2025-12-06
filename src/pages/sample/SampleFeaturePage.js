import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useExperiment } from "../../hooks/useExperiment";
import { trackConversion } from "../../lib/analytics/experimentsTracker";
const mockUser = { userId: "user-1", companyId: "co-1", role: "owner" };
export default function SampleFeaturePage() {
    const { variant, isEnabled } = useExperiment("pricing_experiment", mockUser);
    const onAction = () => {
        trackConversion("pricing_experiment", variant, "cta_click", mockUser, { screen: "sample" });
    };
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h3", { children: "Sample Feature Page" }), _jsxs("p", { children: ["Variant: ", variant] }), _jsxs("p", { children: ["Status: ", isEnabled ? "enabled" : "disabled"] }), _jsx("button", { onClick: onAction, children: "Record conversion" })] }));
}
