import { useExperiment } from "../../hooks/useExperiment";
import { trackConversion } from "../../lib/analytics/experimentsTracker";

const mockUser = { userId: "user-1", companyId: "co-1", role: "owner" };

export default function SampleFeaturePage() {
  const { variant, isEnabled } = useExperiment("pricing_experiment", mockUser);

  const onAction = () => {
    trackConversion("pricing_experiment", variant, "cta_click", mockUser, { screen: "sample" });
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Sample Feature Page</h3>
      <p>Variant: {variant}</p>
      <p>Status: {isEnabled ? "enabled" : "disabled"}</p>
      <button onClick={onAction}>Record conversion</button>
    </div>
  );
}
